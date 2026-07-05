<script lang="ts">
	import { enhance } from '$app/forms';

	let { data, form } = $props<{
		data: { form: { name: string; slug: string } };
		form: { error?: string; success?: boolean; values?: Record<string, string> } | null;
	}>();

	let loading = $state(false);
</script>

<svelte:head>
	<title>{data.form.name} | SME Contact Portal</title>
	<link rel="preconnect" href="https://fonts.googleapis.com">
	<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin="anonymous">
	<link href="https://fonts.googleapis.com/css2?family=Lato:ital,wght@0,100;0,300;0,400;0,700;0,900;1,100;1,300;1,400;1,700;1,900&family=Raleway:ital,wght@0,100..900;1,100..900&display=swap" rel="stylesheet">
</svelte:head>

<div class="sme-header">
	<div class="header-container">
		<span class="brand-title">SPECIALIST<span class="accent-text">MECHANICAL</span>ENGINEERS</span>
		<div class="brand-line"></div>
	</div>
</div>

<div class="page-container">
	<div class="form-container">
		{#if form?.success}
			<div class="thank-you-card">
				<div class="success-icon">✓</div>
				<h2 class="thank-you-title">Thank You</h2>
				<p class="thank-you-msg">Your information has been captured successfully. Our team will review your submission and contact you shortly.</p>
				<button class="reset-btn" onclick={() => location.reload()}>Submit Another Response</button>
			</div>
		{:else}
			<h1 class="form-title">{data.form.name}</h1>
			<p class="form-desc">Please complete the form below. All fields are required.</p>

			{#if form?.error}
				<div class="error-banner">
					<p>{form.error}</p>
				</div>
			{/if}

			<form
				method="POST"
				use:enhance={() => {
					loading = true;
					return async ({ update }) => {
						loading = false;
						await update();
					};
				}}
			>
				<div class="form-row">
					<div class="form-group">
						<label for="name">Name</label>
						<input
							type="text"
							id="name"
							name="name"
							value={form?.values?.name ?? ''}
							required
							placeholder="e.g. John"
						/>
					</div>
					<div class="form-group">
						<label for="surname">Surname</label>
						<input
							type="text"
							id="surname"
							name="surname"
							value={form?.values?.surname ?? ''}
							required
							placeholder="e.g. Smith"
						/>
					</div>
				</div>

				<div class="form-row">
					<div class="form-group">
						<label for="email">Email Address</label>
						<input
							type="email"
							id="email"
							name="email"
							value={form?.values?.email ?? ''}
							required
							placeholder="e.g. john.smith@company.com"
						/>
					</div>
					<div class="form-group">
						<label for="phone">Phone Number</label>
						<input
							type="tel"
							id="phone"
							name="phone"
							value={form?.values?.phone ?? ''}
							required
							placeholder="e.g. +27 82 123 4567"
						/>
					</div>
				</div>

				<div class="form-group">
					<label for="type">Relationship Type</label>
					<select id="type" name="type" required>
						<option value="" disabled selected={!form?.values?.type}>-- Select Category --</option>
						<option value="supplier" selected={form?.values?.type === 'supplier'}>Supplier</option>
						<option value="client" selected={form?.values?.type === 'client'}>Client</option>
						<option value="career_opportunity" selected={form?.values?.type === 'career_opportunity'}>Career Opportunity</option>
					</select>
				</div>

				<div class="form-group">
					<label for="message">Message / Enquiry</label>
					<textarea
						id="message"
						name="message"
						rows="5"
						required
						placeholder="Please write your detailed enquiry here..."
					>{form?.values?.message ?? ''}</textarea>
				</div>

				<button type="submit" class="submit-btn" disabled={loading}>
					{#if loading}
						Submitting Information...
					{:else}
						Submit Request
					{/if}
				</button>
			</form>
		{/if}
	</div>
</div>

<style>
	:global(body) {
		margin: 0;
		font-family: 'Lato', sans-serif;
		background-color: #f9f9f9;
		color: #1b1b1b;
	}

	.sme-header {
		background-color: #013859;
		color: #ffffff;
		border-bottom: 3px solid #b21e23;
		padding: 1.5rem 0;
		text-align: center;
	}

	.header-container {
		max-width: 800px;
		margin: 0 auto;
		padding: 0 1rem;
	}

	.brand-title {
		font-family: 'Raleway', sans-serif;
		font-size: 1.2rem;
		font-weight: 900;
		letter-spacing: 0.15em;
		color: #ffffff;
	}

	.accent-text {
		color: #b21e23;
		margin: 0 0.4rem;
	}

	.brand-line {
		width: 50px;
		height: 3px;
		background-color: #b21e23;
		margin: 0.5rem auto 0 auto;
	}

	.page-container {
		max-width: 800px;
		margin: 3rem auto;
		padding: 0 1rem;
		box-sizing: border-box;
	}

	.form-container {
		background: #ffffff;
		border-radius: 4px;
		box-shadow: 0 0.15em 2em rgba(0, 0, 0, 0.05);
		padding: 2.5rem;
		box-sizing: border-box;
		border-top: 4px solid #013859;
	}

	.form-title {
		font-family: 'Raleway', sans-serif;
		font-size: 1.8rem;
		font-weight: 700;
		color: #013859;
		margin: 0 0 0.5rem 0;
	}

	.form-desc {
		color: #666;
		margin: 0 0 2rem 0;
		font-size: 0.95rem;
	}

	.form-row {
		display: grid;
		grid-template-columns: 1fr;
		gap: 1.5rem;
		margin-bottom: 1.5rem;
	}

	@media (min-width: 600px) {
		.form-row {
			grid-template-columns: 1fr 1fr;
		}
	}

	.form-group {
		display: flex;
		flex-direction: column;
		gap: 0.4rem;
		margin-bottom: 1.5rem;
	}

	label {
		font-size: 0.8rem;
		font-weight: 700;
		color: #204f6a;
		text-transform: uppercase;
		letter-spacing: 0.05em;
	}

	input, select, textarea {
		padding: 0.75rem;
		border: 1px solid #dcdcdc;
		border-radius: 2px;
		font-size: 1rem;
		font-family: 'Lato', sans-serif;
		background-color: #fafafa;
		transition: border-color 0.2s;
	}

	input:focus, select:focus, textarea:focus {
		outline: none;
		border-color: #013859;
	}

	select {
		height: 45px;
	}

	.submit-btn {
		width: 100%;
		padding: 1rem;
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
		transition: background-color 0.2s;
		box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);
	}

	.submit-btn:hover {
		background-color: #013859;
	}

	.submit-btn:disabled {
		opacity: 0.7;
		cursor: not-allowed;
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

	.thank-you-card {
		text-align: center;
		padding: 2rem 1rem;
	}

	.success-icon {
		width: 60px;
		height: 60px;
		background-color: #f0fdf4;
		border: 2px solid #16a34a;
		color: #16a34a;
		border-radius: 50%;
		display: flex;
		justify-content: center;
		align-items: center;
		font-size: 2rem;
		font-weight: bold;
		margin: 0 auto 1.5rem auto;
	}

	.thank-you-title {
		font-family: 'Raleway', sans-serif;
		font-size: 2rem;
		font-weight: 900;
		color: #013859;
		margin: 0 0 1rem 0;
	}

	.thank-you-msg {
		color: #555;
		line-height: 1.6;
		margin-bottom: 2rem;
	}

	.reset-btn {
		background-color: #204f6a;
		color: white;
		border: none;
		border-radius: 2px;
		padding: 0.75rem 1.5rem;
		font-family: 'Raleway', sans-serif;
		font-weight: 700;
		text-transform: uppercase;
		cursor: pointer;
		transition: background-color 0.2s;
	}

	.reset-btn:hover {
		background-color: #b21e23;
	}
</style>
