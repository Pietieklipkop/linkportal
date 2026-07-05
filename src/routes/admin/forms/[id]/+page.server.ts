import { error } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';
import { getDb } from '$lib/server/db';
import { formLink, formEntry } from '$lib/server/db/schema';
import { eq, desc } from 'drizzle-orm';

export const load: PageServerLoad = async (event) => {
	if (!event.platform?.env?.DB) {
		throw error(500, 'Database not available');
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

	return {
		form: formDetails,
		entries
	};
};
