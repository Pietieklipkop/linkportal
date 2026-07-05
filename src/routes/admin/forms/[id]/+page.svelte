<script lang="ts">
	let { data } = $props<{
		data: {
			form: { id: string; name: string; slug: string };
			entries: Array<{
				id: string;
				name: string;
				surname: string;
				email: string;
				phone: string;
				type: string;
				message: string;
				createdAt: Date;
			}>;
		};
	}>();

	function getTypeLabel(type: string) {
		switch (type) {
			case 'supplier':
				return 'Supplier';
			case 'client':
				return 'Client';
			case 'career_opportunity':
				return 'Career Opportunity';
			default:
				return type;
		}
	}

	function formatDate(dateVal: unknown) {
		if (!dateVal) return '';
		const d = new Date(dateVal as string | number | Date);
		return d.toLocaleDateString() + ' ' + d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
	}
</script>

<svelte:head>
	<title>Entries for {data.form.name} | LinkPortal</title>
</svelte:head>

<div class="header-section">
	<a href="/admin/links" class="back-link">← Back to Links</a>
	<div class="title-bar">
		<div>
			<h1 class="page-title">{data.form.name}</h1>
			<p class="subtitle">Review and export captured information entries.</p>
		</div>
		<div class="actions">
			<a href="/admin/forms/{data.form.id}/export" class="export-btn" download>
				Download CSV
			</a>
		</div>
	</div>
</div>

<div class="stats-bar">
	<div class="stat-card">
		<span class="stat-label">Total Entries</span>
		<span class="stat-val">{data.entries.length}</span>
	</div>
</div>

<div class="card">
	<h2 class="card-title">Submissions Log</h2>
	<div class="card-line"></div>

	{#if data.entries.length === 0}
		<div class="empty-state">
			<p>No entries have been submitted to this form yet.</p>
		</div>
	{:else}
		<div class="table-container">
			<table class="entries-table">
				<thead>
					<tr>
						<th>Date</th>
						<th>Contact Details</th>
						<th>Type</th>
						<th>Message</th>
					</tr>
				</thead>
				<tbody>
					{#each data.entries as entry (entry.id)}
						<tr>
							<td class="date-cell">
								{formatDate(entry.createdAt)}
							</td>
							<td class="contact-cell">
								<div class="fullname">{entry.name} {entry.surname}</div>
								<div class="email">{entry.email}</div>
								<div class="phone">{entry.phone}</div>
							</td>
							<td>
								<span class="badge" class:badge-supplier={entry.type === 'supplier'} class:badge-client={entry.type === 'client'} class:badge-career={entry.type === 'career_opportunity'}>
									{getTypeLabel(entry.type)}
								</span>
							</td>
							<td class="message-cell">
								<p>{entry.message}</p>
							</td>
						</tr>
					{/each}
				</tbody>
			</table>
		</div>
	{/if}
</div>

<style>
	.header-section {
		margin-bottom: 2rem;
	}

	.back-link {
		color: #204f6a;
		text-decoration: none;
		font-weight: 700;
		font-size: 0.9rem;
		display: inline-block;
		margin-bottom: 1rem;
		transition: color 0.2s;
	}

	.back-link:hover {
		color: #b21e23;
	}

	.title-bar {
		display: flex;
		justify-content: space-between;
		align-items: center;
		flex-wrap: wrap;
		gap: 1rem;
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

	.export-btn {
		background-color: #b21e23;
		color: #ffffff;
		border: none;
		border-radius: 2px;
		padding: 0.85rem 1.5rem;
		font-family: 'Raleway', sans-serif;
		font-weight: 700;
		text-transform: uppercase;
		text-decoration: none;
		letter-spacing: 0.05em;
		cursor: pointer;
		display: inline-block;
		transition: background-color 0.2s;
		box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);
	}

	.export-btn:hover {
		background-color: #013859;
	}

	.stats-bar {
		margin-bottom: 2rem;
	}

	.stat-card {
		background: #ffffff;
		border-radius: 4px;
		box-shadow: 0 0.15em 2em rgba(0, 0, 0, 0.03);
		padding: 1.5rem;
		display: inline-flex;
		flex-direction: column;
		min-width: 160px;
		border-left: 4px solid #013859;
	}

	.stat-label {
		font-size: 0.8rem;
		font-weight: 700;
		color: #666;
		text-transform: uppercase;
		letter-spacing: 0.05em;
		margin-bottom: 0.25rem;
	}

	.stat-val {
		font-size: 2.2rem;
		font-weight: 900;
		color: #013859;
		line-height: 1;
	}

	.card {
		background: #ffffff;
		border-radius: 4px;
		box-shadow: 0 0.15em 2em rgba(0, 0, 0, 0.05);
		padding: 2rem;
		box-sizing: border-box;
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

	.empty-state {
		text-align: center;
		padding: 4rem 1rem;
		color: #666;
		font-style: italic;
	}

	.table-container {
		overflow-x: auto;
	}

	.entries-table {
		width: 100%;
		border-collapse: collapse;
		text-align: left;
	}

	.entries-table th {
		padding: 0.75rem 1rem;
		border-bottom: 2px solid #013859;
		color: #013859;
		font-family: 'Raleway', sans-serif;
		font-weight: 700;
		font-size: 0.9rem;
	}

	.entries-table td {
		padding: 1.25rem 1.0rem;
		border-bottom: 1px solid #e5e7eb;
		vertical-align: top;
	}

	.date-cell {
		font-size: 0.85rem;
		color: #666;
		white-space: nowrap;
		width: 140px;
	}

	.contact-cell {
		width: 250px;
	}

	.fullname {
		font-weight: 700;
		color: #1b1b1b;
		margin-bottom: 0.25rem;
	}

	.email {
		font-size: 0.85rem;
		color: #013859;
		margin-bottom: 0.15rem;
	}

	.phone {
		font-size: 0.85rem;
		color: #555;
	}

	.badge {
		font-size: 0.75rem;
		font-weight: 700;
		padding: 0.25rem 0.6rem;
		border-radius: 2px;
		display: inline-block;
		text-transform: uppercase;
		letter-spacing: 0.03em;
	}

	.badge-supplier {
		background-color: #eff6ff;
		color: #1d4ed8;
		border: 1px solid #bfdbfe;
	}

	.badge-client {
		background-color: #f0fdf4;
		color: #166534;
		border: 1px solid #bbf7d0;
	}

	.badge-career {
		background-color: #fffbeb;
		color: #92400e;
		border: 1px solid #fde68a;
	}

	.message-cell {
		max-width: 400px;
	}

	.message-cell p {
		margin: 0;
		font-size: 0.9rem;
		line-height: 1.4;
		white-space: pre-wrap;
		color: #444;
	}
</style>
