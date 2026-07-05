import { integer, sqliteTable, text } from 'drizzle-orm/sqlite-core';
import { sql } from 'drizzle-orm';

export const task = sqliteTable('task', {
	id: text('id')
		.primaryKey()
		.$defaultFn(() => crypto.randomUUID()),
	title: text('title').notNull(),
	priority: integer('priority').notNull().default(1)
});

export const formLink = sqliteTable('form_link', {
	id: text('id')
		.primaryKey()
		.$defaultFn(() => crypto.randomUUID()),
	name: text('name').notNull().unique(),
	slug: text('slug').notNull().unique(),
	notificationEmail: text('notification_email').default('admin@linkportal.com').notNull(),
	emailBody: text('email_body')
		.default('Hello, a new submission has been received from {name} {surname}.')
		.notNull(),
	views: integer('views').default(0).notNull(),
	company: text('company').default('LinkPortal').notNull(),
	attachmentPath: text('attachment_path'),
	attachmentName: text('attachment_name'),
	createdAt: integer('created_at', { mode: 'timestamp_ms' })
		.default(sql`(cast(unixepoch('subsecond') * 1000 as integer))`)
		.notNull()
});

export const formEntry = sqliteTable('form_entry', {
	id: text('id')
		.primaryKey()
		.$defaultFn(() => crypto.randomUUID()),
	formLinkId: text('form_link_id')
		.notNull()
		.references(() => formLink.id, { onDelete: 'cascade' }),
	name: text('name').notNull(),
	surname: text('surname').notNull(),
	email: text('email').notNull(),
	phone: text('phone').notNull(),
	type: text('type').notNull(), // supplier | client | career_opportunity
	message: text('message').notNull(),
	createdAt: integer('created_at', { mode: 'timestamp_ms' })
		.default(sql`(cast(unixepoch('subsecond') * 1000 as integer))`)
		.notNull()
});

export * from './auth.schema';
export * from './tenants.schema';
