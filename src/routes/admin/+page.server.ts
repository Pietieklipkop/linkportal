import type { PageServerLoad } from './$types';
import { getDb } from '$lib/server/db';
import { formLink, formEntry, user } from '$lib/server/db/schema';
import { desc, eq, count } from 'drizzle-orm';

export const load: PageServerLoad = async (event) => {
	if (!event.platform?.env?.DB) {
		return {
			stats: { links: 0, entries: 0, users: 0 },
			recentSubmissions: []
		};
	}

	const db = getDb(event.platform.env.DB);

	// Get counts
	const [linksCountRes] = await db.select({ value: count() }).from(formLink);
	const [entriesCountRes] = await db.select({ value: count() }).from(formEntry);
	const [usersCountRes] = await db.select({ value: count() }).from(user);

	// Get 5 most recent submissions across all forms
	const recentSubmissions = await db
		.select({
			id: formEntry.id,
			name: formEntry.name,
			surname: formEntry.surname,
			email: formEntry.email,
			type: formEntry.type,
			createdAt: formEntry.createdAt,
			formName: formLink.name,
			formId: formLink.id
		})
		.from(formEntry)
		.innerJoin(formLink, eq(formEntry.formLinkId, formLink.id))
		.orderBy(desc(formEntry.createdAt))
		.limit(5);

	// Get form links with views and submissions count for telemetry charts
	const formsData = await db
		.select({
			id: formLink.id,
			name: formLink.name,
			views: formLink.views,
			submissionsCount: count(formEntry.id)
		})
		.from(formLink)
		.leftJoin(formEntry, eq(formEntry.formLinkId, formLink.id))
		.groupBy(formLink.id);

	return {
		stats: {
			links: linksCountRes?.value ?? 0,
			entries: entriesCountRes?.value ?? 0,
			users: usersCountRes?.value ?? 0
		},
		recentSubmissions,
		formsData
	};
};
