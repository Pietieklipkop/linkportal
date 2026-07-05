<script lang="ts">
	import type { Snippet } from 'svelte';
	import { enhance } from '$app/forms';
	import { page } from '$app/state';
	import { LayoutDashboard, Link, Users } from 'lucide-svelte';

	let { data, children } = $props<{
		data: { user: { email: string } };
		children: Snippet;
	}>();
</script>

<div class="admin-wrapper">
	<aside class="admin-sidebar">
		<div class="sidebar-top">
			<div class="brand">
				<a href="/admin" class="brand-link">
					<span class="brand-title">LINK<span class="accent-text">PORTAL</span></span>
					<span class="badge">ADMIN</span>
				</a>
			</div>

			<nav class="sidebar-nav">
				<a href="/admin" class="nav-link" class:active={page.url.pathname === '/admin'}>
					<span class="nav-icon"><LayoutDashboard size={18} /></span>
					<span class="nav-text">Dashboard</span>
				</a>
				<a
					href="/admin/links"
					class="nav-link"
					class:active={page.url.pathname.startsWith('/admin/links') ||
						page.url.pathname.startsWith('/admin/forms')}
				>
					<span class="nav-icon"><Link size={18} /></span>
					<span class="nav-text">Links</span>
				</a>
				<a href="/admin/users" class="nav-link" class:active={page.url.pathname.startsWith('/admin/users')}>
					<span class="nav-icon"><Users size={18} /></span>
					<span class="nav-text">Users</span>
				</a>
			</nav>
		</div>

		<div class="sidebar-footer">
			<div class="user-info">
				<div class="user-label">Logged in as</div>
				<div class="user-email" title={data.user?.email}>{data.user?.email}</div>
			</div>
			<form action="/login?/signOut" method="POST" use:enhance class="logout-form">
				<button type="submit" class="logout-btn">Sign Out</button>
			</form>
		</div>
	</aside>

	<main class="admin-content">
		{@render children()}
	</main>
</div>

<style>
	:global(body) {
		margin: 0;
		font-family: 'Lato', sans-serif;
		background-color: #f9f9f9;
		color: #1b1b1b;
		overflow-x: hidden;
	}

	.admin-wrapper {
		display: flex;
		min-height: 100vh;
		width: 100vw;
	}

	.admin-sidebar {
		width: 260px;
		min-width: 260px;
		background-color: #013859;
		color: #ffffff;
		display: flex;
		flex-direction: column;
		justify-content: space-between;
		border-right: 3px solid #b21e23;
		box-sizing: border-box;
		position: sticky;
		top: 0;
		height: 100vh;
	}

	.sidebar-top {
		padding: 1.5rem;
	}

	.brand {
		margin-bottom: 2.5rem;
	}

	.brand-link {
		text-decoration: none;
		display: flex;
		align-items: center;
		flex-wrap: wrap;
		gap: 0.5rem;
	}

	.brand-title {
		font-family: 'Raleway', sans-serif;
		font-size: 1.4rem;
		font-weight: 900;
		color: #ffffff;
		letter-spacing: 0.08em;
	}

	.accent-text {
		color: #b21e23;
	}

	.badge {
		background-color: #b21e23;
		color: #ffffff;
		font-size: 0.65rem;
		font-weight: 700;
		padding: 0.15rem 0.4rem;
		border-radius: 2px;
		letter-spacing: 0.05em;
	}

	.sidebar-nav {
		display: flex;
		flex-direction: column;
		gap: 0.5rem;
	}

	.nav-link {
		display: flex;
		align-items: center;
		gap: 0.75rem;
		color: rgba(255, 255, 255, 0.75);
		text-decoration: none;
		font-family: 'Raleway', sans-serif;
		font-weight: 700;
		font-size: 0.95rem;
		padding: 0.8rem 1rem;
		border-radius: 4px;
		transition: all 0.2s;
	}

	.nav-link:hover {
		color: #ffffff;
		background-color: rgba(255, 255, 255, 0.05);
	}

	.nav-link.active {
		color: #ffffff;
		background-color: #b21e23;
	}

	.nav-icon {
		display: flex;
		align-items: center;
	}

	.sidebar-footer {
		padding: 1.5rem;
		border-top: 1px solid rgba(255, 255, 255, 0.1);
		background-color: rgba(0, 0, 0, 0.15);
	}

	.user-info {
		margin-bottom: 1rem;
	}

	.user-label {
		font-size: 0.7rem;
		text-transform: uppercase;
		letter-spacing: 0.05em;
		color: rgba(255, 255, 255, 0.5);
		font-weight: 700;
		margin-bottom: 0.2rem;
	}

	.user-email {
		font-size: 0.85rem;
		font-weight: 700;
		color: #ffffff;
		white-space: nowrap;
		overflow: hidden;
		text-overflow: ellipsis;
	}

	.logout-form {
		width: 100%;
	}

	.logout-btn {
		width: 100%;
		background-color: transparent;
		color: #ffffff;
		border: 1px solid rgba(255, 255, 255, 0.4);
		padding: 0.5rem;
		font-family: 'Raleway', sans-serif;
		font-size: 0.85rem;
		font-weight: 700;
		text-transform: uppercase;
		cursor: pointer;
		transition: all 0.2s;
		border-radius: 2px;
	}

	.logout-btn:hover {
		background-color: #b21e23;
		border-color: #b21e23;
	}

	.admin-content {
		flex: 1;
		padding: 2rem;
		box-sizing: border-box;
		overflow-y: auto;
		height: 100vh;
	}
</style>
