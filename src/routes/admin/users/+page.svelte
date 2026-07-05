<script lang="ts">
	import { enhance } from '$app/forms';

	let { data, form } = $props<{
		data: { users: Array<{ id: string; name: string; email: string; role: string; createdAt: Date }> };
		form: { error?: string; success?: boolean } | null;
	}>();

	let loading = $state(false);

	function getRoleLabel(role: string) {
		switch (role) {
			case 'platform_admin':
				return 'Platform Admin';
			case 'firm_admin':
				return 'Firm Admin';
			case 'firm_editor':
				return 'Firm Editor';
			case 'end_user':
				return 'User / Staff';
			default:
				return role;
		}
	}

	function formatDate(dateVal: unknown) {
		if (!dateVal) return '';
		const d = new Date(dateVal as string | number | Date);
		return d.toLocaleDateString() + ' ' + d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
	}
</script>

<svelte:head>
	<title>User Management | LinkPortal</title>
</svelte:head>

<div class="dashboard-header">
	<h1 class="page-title">User Management</h1>
	<p class="subtitle">View active users and register new admin or staff accounts.</p>
</div>

<div class="dashboard-grid">
	<!-- Left: Add New User Form -->
	<div class="card">
		<h2 class="card-title">Register New User</h2>
		<div class="card-line"></div>

		<form
			method="POST"
			action="?/createUser"
			use:enhance={() => {
				loading = true;
				return async ({ update }) => {
					loading = false;
					await update();
				};
			}}
		>
			{#if form?.error}
				<div class="error-banner">
					<p>{form.error}</p>
				</div>
			{/if}

			{#if form?.success}
				<div class="success-banner">
					<p>User account registered successfully!</p>
				</div>
			{/if}

			<div class="form-group">
				<label for="name">Full Name</label>
				<input
					type="text"
					id="name"
					name="name"
					placeholder="e.g. John Doe"
					required
				/>
			</div>

			<div class="form-group">
				<label for="email">Email Address</label>
				<input
					type="email"
					id="email"
					name="email"
					placeholder="e.g. user@linkportal.com"
					required
				/>
			</div>

			<div class="form-group">
				<label for="password">Password</label>
				<input
					type="password"
					id="password"
					name="password"
					placeholder="Minimum 6 characters"
					required
					minlength="6"
				/>
			</div>

			<button type="submit" class="submit-btn" disabled={loading}>
				{#if loading}
					Registering...
				{:else}
					Register User
				{/if}
			</button>
		</form>
	</div>

	<!-- Right: Active Users List -->
	<div class="card">
		<h2 class="card-title">Active Platform Users</h2>
		<div class="card-line"></div>

		{#if data.users.length === 0}
			<div class="empty-state">
				<p>No registered users found.</p>
			</div>
		{:else}
			<div class="table-container">
				<table class="users-table">
					<thead>
						<tr>
							<th>Name</th>
							<th>Email Address</th>
							<th>Role</th>
							<th>Joined</th>
						</tr>
					</thead>
					<tbody>
						{#each data.users as userItem (userItem.id)}
							<tr>
								<td class="fullname-cell">
									<strong>{userItem.name}</strong>
								</td>
								<td class="email-cell">
									{userItem.email}
								</td>
								<td>
									<span
										class="role-badge"
										class:role-admin={userItem.role === 'platform_admin' || userItem.role === 'admin'}
									>
										{getRoleLabel(userItem.role)}
									</span>
								</td>
								<td class="date-cell">
									{formatDate(userItem.createdAt)}
								</td>
							</tr>
						{/each}
					</tbody>
				</table>
			</div>
		{/if}
	</div>
</div>

<style>
	.dashboard-header {
		margin-bottom: 2rem;
	}

	.page-title {
		font-family: 'Raleway', sans-serif;
		font-size: 2rem;
		font-weight: 900;
		color: #013859;
		margin: 0 0 0.5rem 0;
	}

	.subtitle {
		font-size: 1.1rem;
		color: #666;
		margin: 0;
	}

	.dashboard-grid {
		display: grid;
		grid-template-columns: 1fr;
		gap: 2rem;
	}

	@media (min-width: 900px) {
		.dashboard-grid {
			grid-template-columns: 350px 1fr;
		}
	}

	.card {
		background: #ffffff;
		border-radius: 4px;
		box-shadow: 0 0.15em 2em rgba(0, 0, 0, 0.05);
		padding: 2rem;
		box-sizing: border-box;
		height: fit-content;
	}

	.card-title {
		font-family: 'Raleway', sans-serif;
		font-size: 1.25rem;
		font-weight: 700;
		color: #204f6a;
		margin: 0 0 0.5rem 0;
	}

	.card-line {
		width: 30px;
		height: 3px;
		background-color: #b21e23;
		margin-bottom: 1.5rem;
	}

	.form-group {
		margin-bottom: 1.5rem;
		display: flex;
		flex-direction: column;
		gap: 0.4rem;
	}

	label {
		font-size: 0.8rem;
		font-weight: 700;
		color: #204f6a;
		text-transform: uppercase;
		letter-spacing: 0.05em;
	}

	input[type='text'],
	input[type='email'],
	input[type='password'] {
		padding: 0.75rem;
		border: 1px solid #dcdcdc;
		border-radius: 2px;
		font-size: 0.95rem;
		font-family: 'Lato', sans-serif;
		background-color: #fafafa;
		transition: border-color 0.2s;
	}

	input[type='text']:focus,
	input[type='email']:focus,
	input[type='password']:focus {
		outline: none;
		border-color: #013859;
	}

	.submit-btn {
		width: 100%;
		padding: 0.85rem;
		background-color: #b21e23;
		color: #ffffff;
		border: none;
		border-radius: 2px;
		font-size: 0.9rem;
		font-family: 'Raleway', sans-serif;
		font-weight: 700;
		text-transform: uppercase;
		letter-spacing: 0.05em;
		cursor: pointer;
		transition: background-color 0.2s;
	}

	.submit-btn:hover {
		background-color: #013859;
	}

	.error-banner {
		background-color: #fdf2f2;
		border-left: 4px solid #b21e23;
		color: #b21e23;
		padding: 0.75rem 1rem;
		margin-bottom: 1.5rem;
		font-size: 0.85rem;
		border-radius: 2px;
	}

	.success-banner {
		background-color: #f0fdf4;
		border-left: 4px solid #16a34a;
		color: #16a34a;
		padding: 0.75rem 1rem;
		margin-bottom: 1.5rem;
		font-size: 0.85rem;
		border-radius: 2px;
	}

	.empty-state {
		text-align: center;
		padding: 3rem 1rem;
		color: #666;
		font-style: italic;
	}

	.table-container {
		overflow-x: auto;
	}

	.users-table {
		width: 100%;
		border-collapse: collapse;
		text-align: left;
	}

	.users-table th {
		padding: 0.75rem 1rem;
		border-bottom: 2px solid #013859;
		color: #013859;
		font-family: 'Raleway', sans-serif;
		font-weight: 700;
		font-size: 0.9rem;
	}

	.users-table td {
		padding: 1rem;
		border-bottom: 1px solid #e5e7eb;
		vertical-align: middle;
	}

	.fullname-cell {
		color: #204f6a;
		font-size: 1rem;
	}

	.email-cell {
		color: #555;
		font-size: 0.9rem;
	}

	.role-badge {
		font-size: 0.75rem;
		font-weight: 700;
		padding: 0.25rem 0.5rem;
		border-radius: 2px;
		background-color: #f3f4f6;
		color: #4b5563;
		border: 1px solid #e5e7eb;
		display: inline-block;
	}

	.role-badge.role-admin {
		background-color: #fef2f2;
		color: #991b1b;
		border-color: #fee2e2;
	}

	.date-cell {
		font-size: 0.85rem;
		color: #666;
		white-space: nowrap;
	}
</style>
