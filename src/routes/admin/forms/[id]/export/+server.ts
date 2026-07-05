import { error } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { getDb } from '$lib/server/db';
import { formLink, formEntry } from '$lib/server/db/schema';
import { eq, desc } from 'drizzle-orm';

function escapeCSV(val: string) {
	if (val === null || val === undefined) return '';
	const str = String(val);
	if (str.includes(',') || str.includes('"') || str.includes('\n') || str.includes('\r')) {
		return `"${str.replace(/"/g, '""')}"`;
	}
	return str;
}

export const GET: RequestHandler = async (event) => {
	if (!event.platform?.env?.DB) {
		throw error(500, 'Database not available');
	}

	// Double check auth
	if (!event.locals.user) {
		throw error(401, 'Unauthorized');
	}

	const db = getDb(event.platform.env.DB);
	const formId = event.params.id;

	const formDetails = await db.query.formLink.findFirst({
		where: eq(formLink.id, formId)
	});

	if (!formDetails) {
		throw error(404, 'Form not found');
	}

	const entries = await db
		.select()
		.from(formEntry)
		.where(eq(formEntry.formLinkId, formId))
		.orderBy(desc(formEntry.createdAt));

	// Generate CSV
	const headers = ['Name', 'Surname', 'Email', 'Phone', 'Type', 'Message', 'Created At'];
	const rows = entries.map((e) => [
		e.name,
		e.surname,
		e.email,
		e.phone,
		e.type,
		e.message,
		e.createdAt ? new Date(e.createdAt).toISOString() : ''
	]);

	const csvContent = [headers.join(','), ...rows.map((r) => r.map(escapeCSV).join(','))].join(
		'\r\n'
	);

	// Filename slug
	const filename = `${formDetails.slug}-entries.csv`;

	return new Response(csvContent, {
		status: 200,
		headers: {
			'Content-Type': 'text/csv; charset=utf-8',
			'Content-Disposition': `attachment; filename="${filename}"`,
			'Cache-Control': 'no-cache'
		}
	});
};
