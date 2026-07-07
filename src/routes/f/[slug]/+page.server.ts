import { error, fail } from '@sveltejs/kit';
import type { Actions, PageServerLoad } from './$types';
import { getDb } from '$lib/server/db';
import { formLink, formEntry } from '$lib/server/db/schema';
import { eq, sql } from 'drizzle-orm';
import { env } from '$env/dynamic/private';

export const load: PageServerLoad = async (event) => {
	if (!event.platform?.env?.DB) {
		throw error(500, 'Database not available');
	}

	const db = getDb(event.platform.env.DB);
	const slug = event.params.slug;

	const formDetails = await db.query.formLink.findFirst({
		where: eq(formLink.slug, slug)
	});

	if (!formDetails) {
		throw error(404, 'Form not found');
	}

	// Increment view count
	await db
		.update(formLink)
		.set({ views: sql`${formLink.views} + 1` })
		.where(eq(formLink.id, formDetails.id));

	return {
		form: formDetails
	};
};

export const actions: Actions = {
	default: async (event) => {
		const { DB } = event.platform!.env;
		const db = getDb(DB);
		const slug = event.params.slug;

		// Re-fetch form link to ensure it exists and get ID
		const formDetails = await db.query.formLink.findFirst({
			where: eq(formLink.slug, slug)
		});

		if (!formDetails) {
			return fail(404, { error: 'Form not found' });
		}

		const formData = await event.request.formData();
		const name = (formData.get('name') as string | null)?.trim() ?? '';
		const surname = (formData.get('surname') as string | null)?.trim() ?? '';
		const email = (formData.get('email') as string | null)?.trim() ?? '';
		const phone = (formData.get('phone') as string | null)?.trim() ?? '';
		const type = (formData.get('type') as string | null)?.trim() ?? '';
		const message = (formData.get('message') as string | null)?.trim() ?? '';

		// Validation
		if (!name || !surname || !email || !phone || !type || !message) {
			return fail(400, {
				error: 'All fields are required',
				values: { name, surname, email, phone, type, message }
			});
		}

		const validTypes = ['supplier', 'client', 'career_opportunity'];
		if (!validTypes.includes(type)) {
			return fail(400, {
				error: 'Invalid selection type',
				values: { name, surname, email, phone, type, message }
			});
		}

		try {
			await db.insert(formEntry).values({
				formLinkId: formDetails.id,
				name,
				surname,
				email,
				phone,
				type,
				message
			});

			// Trigger Resend API alert only if type is 'client'
			const apiKey = env.RESEND_API_KEY || event.platform?.env?.RESEND_API_KEY;
			if (apiKey && type === 'client') {
				let bodyContent = formDetails.emailBody || 'New submission received.';
				bodyContent = bodyContent
					.replace(/{name}/g, name)
					.replace(/{surname}/g, surname)
					.replace(/{email}/g, email)
					.replace(/{phone}/g, phone)
					.replace(/{type}/g, type)
					.replace(/{message}/g, message);

				const isHtml = /<\/?[a-z][\s\S]*>/i.test(bodyContent);
				const htmlContent = isHtml
					? bodyContent
					: `<div style="font-family: sans-serif; line-height: 1.5; color: #1b1b1b;">
							<h2 style="color: #013859; border-bottom: 2px solid #b21e23; padding-bottom: 0.5rem;">Form Submission Alert</h2>
							<div style="font-size: 1rem; white-space: pre-wrap;">${bodyContent.replace(/\n/g, '<br>')}</div>
						</div>`;

				const subject = `New Form Entry: ${formDetails.name}`;
				const toEmail = email;

				console.log(`Attempting to send Resend email to ${toEmail}...`);

				let attachments: Array<{ filename: string; content: string }> = [];

				if (
					formDetails.attachmentPath &&
					formDetails.attachmentName &&
					event.platform?.env?.STORAGE
				) {
					console.log(`Fetching attachment from R2: ${formDetails.attachmentPath}...`);
					try {
						const attachmentObj = await event.platform.env.STORAGE.get(formDetails.attachmentPath);
						if (attachmentObj) {
							const arrayBuffer = await attachmentObj.arrayBuffer();
							const bytes = new Uint8Array(arrayBuffer);
							let binary = '';
							for (let i = 0; i < bytes.byteLength; i++) {
								binary += String.fromCharCode(bytes[i]);
							}
							const base64Content = btoa(binary);
							attachments = [
								{
									filename: formDetails.attachmentName,
									content: base64Content
								}
							];
							console.log('Attachment successfully loaded and encoded!');
						} else {
							console.warn('Attachment file was configured but not found in R2!');
						}
					} catch (e) {
						console.error('Error fetching file from R2:', e);
					}
				}

				const res = await event.fetch('https://api.resend.com/emails', {
					method: 'POST',
					headers: {
						Authorization: `Bearer ${apiKey}`,
						'Content-Type': 'application/json'
					},
					body: JSON.stringify({
						from: `${formDetails.company} <no-reply@clear-metrics.co.za>`,
						to: toEmail,
						subject: subject,
						html: htmlContent,
						attachments: attachments.length > 0 ? attachments : undefined
					})
				});

				if (!res.ok) {
					const resText = await res.text();
					console.error(`Resend API Error (${res.status}):`, resText);
				} else {
					console.log('Resend email sent successfully!');
				}
			} else {
				console.warn('Resend email trigger skipped: RESEND_API_KEY is not defined.');
			}
		} catch (err: unknown) {
			console.error('Error during form submission / Resend call:', err);
			return fail(500, {
				error: 'Failed to submit form. Please try again.',
				values: { name, surname, email, phone, type, message }
			});
		}

		return { success: true };
	}
};
