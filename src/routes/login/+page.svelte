<script lang="ts">
	import { enhance } from '$app/forms';

	let { form } = $props<{
		form: { error?: string } | null;
	}>();

	let loading = $state(false);
</script>

<svelte:head>
	<title>Admin Login | LinkPortal</title>
	<link rel="preconnect" href="https://fonts.googleapis.com">
	<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin="anonymous">
	<link href="https://fonts.googleapis.com/css2?family=Lato:ital,wght@0,100;0,300;0,400;0,700;0,900;1,100;1,300;1,400;1,700;1,900&family=Raleway:ital,wght@0,100..900;1,100..900&display=swap" rel="stylesheet">
</svelte:head>

<div class="login-container">
	<div class="login-card">
		<div class="brand-header">
			<span class="brand-title">LINK<span class="accent-text">PORTAL</span></span>
			<div class="brand-line"></div>
		</div>

		<form
			method="POST"
			action="?/signIn"
			use:enhance={() => {
				loading = true;
				return async ({ update }) => {
					loading = false;
					await update();
				};
			}}
		>
			<h2 class="form-title">Administrator Login</h2>

			{#if form?.error}
				<div class="error-banner">
					<p>{form.error}</p>
				</div>
			{/if}

			<div class="form-group">
				<label for="email">Email Address</label>
				<input
					type="email"
					id="email"
					name="email"
					placeholder="admin@linkportal.com"
					required
					autocomplete="username"
				/>
			</div>

			<div class="form-group">
				<label for="password">Password</label>
				<input
					type="password"
					id="password"
					name="password"
					placeholder="••••••••"
					required
					autocomplete="current-password"
				/>
			</div>

			<button type="submit" class="submit-btn" disabled={loading}>
				{#if loading}
					Signing In...
				{:else}
					Sign In
				{/if}
			</button>
		</form>
	</div>
</div>

<style>
	:global(body) {
		margin: 0;
		font-family: 'Lato', sans-serif;
		background-color: #f9f9f9;
		color: #1b1b1b;
	}

	.login-container {
		display: flex;
		justify-content: center;
		align-items: center;
		min-height: 100vh;
		background: radial-gradient(circle at top right, #e2ebf0, #f9f9f9);
		padding: 1rem;
	}

	.login-card {
		background: #ffffff;
		border-radius: 4px;
		box-shadow: 0 0.15em 2em rgba(0, 0, 0, 0.1);
		border-top: 4px solid #b21e23;
		padding: 2.5rem;
		width: 100%;
		max-width: 420px;
		box-sizing: border-box;
	}

	.brand-header {
		text-align: center;
		margin-bottom: 2rem;
	}

	.brand-title {
		font-family: 'Raleway', sans-serif;
		font-size: 1.8rem;
		font-weight: 900;
		color: #013859;
		letter-spacing: 0.1em;
	}

	.accent-text {
		color: #b21e23;
	}

	.brand-line {
		width: 40px;
		height: 3px;
		background-color: #b21e23;
		margin: 0.5rem auto 0 auto;
	}

	.form-title {
		font-family: 'Raleway', sans-serif;
		font-size: 1.25rem;
		font-weight: 700;
		color: #204f6a;
		margin-bottom: 1.5rem;
		text-align: center;
	}

	.error-banner {
		background-color: #fdf2f2;
		border-left: 4px solid #b21e23;
		color: #b21e23;
		padding: 0.75rem 1rem;
		margin-bottom: 1.5rem;
		font-size: 0.9rem;
		border-radius: 2px;
	}

	.form-group {
		margin-bottom: 1.25rem;
		display: flex;
		flex-direction: column;
		gap: 0.4rem;
	}

	label {
		font-size: 0.85rem;
		font-weight: 700;
		color: #204f6a;
		text-transform: uppercase;
		letter-spacing: 0.05em;
	}

	input {
		padding: 0.75rem;
		border: 1px solid #dcdcdc;
		border-radius: 2px;
		font-size: 1rem;
		font-family: 'Lato', sans-serif;
		background-color: #fafafa;
		transition: border-color 0.2s, box-shadow 0.2s;
	}

	input:focus {
		outline: none;
		border-color: #013859;
		box-shadow: 0 0 0 2px rgba(1, 56, 89, 0.1);
	}

	.submit-btn {
		width: 100%;
		padding: 0.85rem;
		background-color: #b21e23;
		color: #ffffff;
		border: none;
		border-radius: 2px;
		font-size: 1rem;
		font-family: 'Raleway', sans-serif;
		font-weight: 700;
		text-transform: uppercase;
		letter-spacing: 0.05em;
		cursor: pointer;
		margin-top: 1rem;
		transition: background-color 0.2s, box-shadow 0.2s;
		box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);
	}

	.submit-btn:hover {
		background-color: #013859;
		box-shadow: 0 6px 10px rgba(0, 0, 0, 0.1);
	}

	.submit-btn:disabled {
		opacity: 0.7;
		cursor: not-allowed;
	}
</style>
