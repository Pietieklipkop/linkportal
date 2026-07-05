import { fail, redirect } from '@sveltejs/kit';
import type { Actions, PageServerLoad } from './$types';
import { APIError } from 'better-auth/api';

export const load: PageServerLoad = async (event) => {
	if (event.locals.user) {
		return redirect(302, '/admin');
	}

	// Auto-seed the admin user on the first load of the login page
	if (event.platform?.env?.DB) {
		const { auth } = event.locals;
		try {
			await auth.api.signUpEmail({
				body: {
					email: 'admin@linkportal.com',
					password: 'password123',
					name: 'Admin'
				}
			});
		} catch {
			// Admin user already exists or seeding failed, which is expected on subsequent loads
		}
	}

	return {};
};

export const actions: Actions = {
	signIn: async (event) => {
		const { auth } = event.locals;
		const formData = await event.request.formData();
		const email = (formData.get('email') as string | null) ?? '';
		const password = (formData.get('password') as string | null) ?? '';

		if (!email || !password) {
			return fail(400, { error: 'Email and password are required' });
		}

		try {
			// Call better-auth API to verify credentials
			const res = await auth.api.signInEmail({
				body: {
					email,
					password
				},
				headers: event.request.headers
			});

			if (res?.token) {
				event.cookies.set('better-auth.session-token', res.token, {
					path: '/',
					httpOnly: true,
					secure: true,
					sameSite: 'lax',
					maxAge: 60 * 60 * 24 * 7 // 7 days
				});
			}
		} catch (error) {
			if (error instanceof APIError) {
				return fail(400, { error: error.message || 'Invalid email or password' });
			}
			return fail(500, { error: 'An unexpected error occurred' });
		}

		return redirect(302, '/admin');
	},
	signOut: async (event) => {
		event.cookies.delete('better-auth.session-token', { path: '/' });
		event.cookies.delete('better-auth.session_token', { path: '/' });
		event.cookies.delete('__Secure-better-auth.session-token', { path: '/' });
		event.cookies.delete('__Secure-better-auth.session_token', { path: '/' });
		return redirect(302, '/login');
	}
};
