import { fail } from '@sveltejs/kit';
import type { Actions, PageServerLoad } from './$types';
import { getDb } from '$lib/server/db';
import { user } from '$lib/server/db/schema';
import { desc } from 'drizzle-orm';
import { APIError } from 'better-auth/api';

export const load: PageServerLoad = async (event) => {
	if (!event.platform?.env?.DB) {
		return { users: [] };
	}

	const db = getDb(event.platform.env.DB);
	const users = await db.select().from(user).orderBy(desc(user.createdAt));

	return {
		users
	};
};

export const actions: Actions = {
	createUser: async (event) => {
		const { auth } = event.locals;
		const formData = await event.request.formData();
		const name = (formData.get('name') as string | null)?.trim() ?? '';
		const email = (formData.get('email') as string | null)?.trim() ?? '';
		const password = (formData.get('password') as string | null) ?? '';

		if (!name || !email || !password) {
			return fail(400, { error: 'All fields (Name, Email, and Password) are required' });
		}

		if (password.length < 6) {
			return fail(400, { error: 'Password must be at least 6 characters long' });
		}

		try {
			// Call better-auth API to sign up the new user
			await auth.api.signUpEmail({
				body: {
					email,
					password,
					name
				}
			});
		} catch (error) {
			if (error instanceof APIError) {
				return fail(400, { error: error.message || 'Failed to create user account' });
			}
			console.error('Failed to create user:', error);
			return fail(500, { error: 'An unexpected error occurred during user creation' });
		}

		return { success: true };
	}
};
