import { fail } from '@sveltejs/kit';
import type { Actions, PageServerLoad } from './$types';
import { getDb } from '$lib/server/db';
import { formLink, formEntry } from '$lib/server/db/schema';
import { desc, eq, count } from 'drizzle-orm';

export const load: PageServerLoad = async (event) => {
	if (!event.platform?.env?.DB) {
		return { forms: [] };
	}

	const db = getDb(event.platform.env.DB);
	const forms = await db
		.select({
			id: formLink.id,
			name: formLink.name,
			slug: formLink.slug,
			company: formLink.company,
			notificationEmail: formLink.notificationEmail,
			emailBody: formLink.emailBody,
			views: formLink.views,
			attachmentPath: formLink.attachmentPath,
			attachmentName: formLink.attachmentName,
			createdAt: formLink.createdAt,
			submissionsCount: count(formEntry.id)
		})
		.from(formLink)
		.leftJoin(formEntry, eq(formEntry.formLinkId, formLink.id))
		.groupBy(formLink.id)
		.orderBy(desc(formLink.createdAt));

	return {
		forms
	};
};

export const actions: Actions = {
	createFormLink: async (event) => {
		const { DB } = event.platform!.env;
		const db = getDb(DB);
		const formData = await event.request.formData();
		const name = (formData.get('name') as string | null)?.trim() ?? '';
		const company = (formData.get('company') as string | null)?.trim() || 'LinkPortal';

		// Set default email settings
		const notificationEmail = 'admin@linkportal.com';
		const emailBody = `Hello,

A new submission has been received for the form.

Details:
Name: {name} {surname}
Email: {email}
Phone: {phone}
Type: {type}

Message:
{message}`;

		if (!name) {
			return fail(400, { error: 'Form Name is required' });
		}

		// Generate a clean slug
		const slug = name
			.toLowerCase()
			.replace(/[^a-z0-9]+/g, '-')
			.replace(/(^-|-$)+/g, '');

		if (!slug) {
			return fail(400, { error: 'Invalid Form Name' });
		}

		try {
			await db.insert(formLink).values({
				name,
				slug,
				company,
				notificationEmail,
				emailBody
			});
		} catch (error: unknown) {
			const errMsg = (error as { message?: string })?.message ?? '';
			const causeMsg = (error as { cause?: { message?: string } })?.cause?.message ?? '';
			if (errMsg.includes('UNIQUE') || causeMsg.includes('UNIQUE')) {
				return fail(400, { error: 'A form link with this name or slug already exists' });
			}
			return fail(500, { error: 'Failed to create form link' });
		}

		return { success: true };
	},

	updateFormLink: async (event) => {
		const { DB } = event.platform!.env;
		const db = getDb(DB);
		const formData = await event.request.formData();
		const id = formData.get('id') as string | null;
		const company = (formData.get('company') as string | null)?.trim() || 'LinkPortal';
		const notificationEmail = (formData.get('notificationEmail') as string | null)?.trim() ?? '';
		const emailBody = (formData.get('emailBody') as string | null)?.trim() ?? '';
		const removeAttachment = formData.get('removeAttachment') === 'true';
		const attachment = formData.get('attachment') as File | null;

		if (!id) {
			return fail(400, { error: 'Form Link ID is required' });
		}
		if (!notificationEmail) {
			return fail(400, { error: 'Notification Email is required' });
		}
		if (!emailBody) {
			return fail(400, { error: 'Email Body template is required' });
		}

		let attachmentPath: string | null | undefined = undefined;
		let attachmentName: string | null | undefined = undefined;

		if (removeAttachment) {
			attachmentPath = null;
			attachmentName = null;
			// Delete existing R2 file
			const formDetails = await db.query.formLink.findFirst({
				where: eq(formLink.id, id)
			});
			if (formDetails?.attachmentPath && event.platform?.env?.STORAGE) {
				try {
					await event.platform.env.STORAGE.delete(formDetails.attachmentPath);
				} catch (e) {
					console.error('Failed to delete attachment from R2:', e);
				}
			}
		}

		if (attachment && attachment.size > 0 && event.platform?.env?.STORAGE) {
			const key = `attachments/${id}/${attachment.name}`;
			try {
				const arrayBuffer = await attachment.arrayBuffer();
				await event.platform.env.STORAGE.put(key, arrayBuffer, {
					httpMetadata: { contentType: attachment.type }
				});
				attachmentPath = key;
				attachmentName = attachment.name;
			} catch (e) {
				console.error('Failed to upload file to R2:', e);
				return fail(500, { error: 'Failed to save attachment file.' });
			}
		}

		try {
			const updateData: Partial<typeof formLink.$inferSelect> = {
				company,
				notificationEmail,
				emailBody
			};

			if (attachmentPath !== undefined) {
				updateData.attachmentPath = attachmentPath;
			}
			if (attachmentName !== undefined) {
				updateData.attachmentName = attachmentName;
			}

			await db.update(formLink).set(updateData).where(eq(formLink.id, id));
		} catch (error) {
			console.error('Failed to update form link:', error);
			return fail(500, { error: 'Failed to update form link' });
		}

		return { success: true };
	}
};
