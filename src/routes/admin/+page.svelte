<script lang="ts">
	import { Link, Inbox, Users, ArrowRight, Eye, Percent } from 'lucide-svelte';

	let { data } = $props<{
		data: {
			stats: { links: number; entries: number; users: number };
			recentSubmissions: Array<{
				id: string;
				name: string;
				surname: string;
				email: string;
				type: string;
				createdAt: Date;
				formName: string;
				formId: string;
			}>;
			formsData: Array<{
				id: string;
				name: string;
				views: number;
				submissionsCount: number;
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

	// Compute totals for Conversion Rate
	const totalViews = $derived(data.formsData.reduce((acc, f) => acc + f.views, 0));
	const totalSubmissions = $derived(data.formsData.reduce((acc, f) => acc + f.submissionsCount, 0));
	const conversionRate = $derived(totalViews > 0 ? (totalSubmissions / totalViews) * 100 : 0);
</script>

<svelte:head>
	<title>Admin Dashboard | LinkPortal</title>
</svelte:head>

<div class="dashboard-header mb-8">
	<h1 class="page-title text-3xl font-black text-slate-800">Admin Dashboard</h1>
	<p class="subtitle text-slate-500 mt-1">Welcome to your Portal overview. Manage links, users and submissions.</p>
</div>

<!-- Stats Grid (DaisyUI style) -->
<div class="stats shadow w-full mb-8 bg-white border border-slate-100">
	<div class="stat">
		<div class="stat-figure text-primary">
			<Link size={28} />
		</div>
		<div class="stat-title text-slate-500 font-bold uppercase tracking-wider text-xs">Active Links</div>
		<div class="stat-value text-primary font-black">{data.stats.links}</div>
		<div class="stat-actions mt-2">
			<a href="/admin/links" class="btn btn-sm btn-ghost gap-1 text-xs">
				Manage Links <ArrowRight size={12} />
			</a>
		</div>
	</div>

	<div class="stat">
		<div class="stat-figure text-secondary">
			<Inbox size={28} />
		</div>
		<div class="stat-title text-slate-500 font-bold uppercase tracking-wider text-xs">Total Submissions</div>
		<div class="stat-value text-secondary font-black">{data.stats.entries}</div>
		<div class="stat-desc mt-2 text-xs text-slate-400">Across all active forms</div>
	</div>

	<div class="stat">
		<div class="stat-figure text-accent">
			<Users size={28} />
		</div>
		<div class="stat-title text-slate-500 font-bold uppercase tracking-wider text-xs">Platform Users</div>
		<div class="stat-value text-slate-800 font-black">{data.stats.users}</div>
		<div class="stat-actions mt-2">
			<a href="/admin/users" class="btn btn-sm btn-ghost gap-1 text-xs">
				Manage Users <ArrowRight size={12} />
			</a>
		</div>
	</div>
</div>

<!-- Telemetry Grid -->
<div class="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
	<!-- Entries per link chart -->
	<div class="card bg-white shadow-sm border border-slate-100">
		<div class="card-body">
			<h2 class="card-title text-slate-800 font-bold text-lg mb-4">Submissions per Link</h2>
			{#if data.formsData.length === 0}
				<p class="text-slate-400 italic text-sm">No data available</p>
			{:else}
				<div class="space-y-4">
					{#each data.formsData as form}
						{@const pct = data.stats.entries > 0 ? (form.submissionsCount / data.stats.entries) * 100 : 0}
						<div>
							<div class="flex justify-between text-xs mb-1">
								<span class="font-semibold text-slate-700">{form.name}</span>
								<span class="text-slate-500 font-mono">{form.submissionsCount} entries</span>
							</div>
							<div class="w-full bg-slate-100 rounded-full h-3">
								<div class="bg-primary h-3 rounded-full transition-all duration-500" style="width: {pct}%"></div>
							</div>
						</div>
					{/each}
				</div>
			{/if}
		</div>
	</div>

	<!-- Conversion Rate chart -->
	<div class="card bg-white shadow-sm border border-slate-100">
		<div class="card-body flex flex-col items-center justify-center">
			<h2 class="card-title text-slate-800 font-bold text-lg mb-6 w-full text-left">Overall Conversion Rate</h2>
			
			<div class="radial-progress text-primary" style="--value:{conversionRate.toFixed(0)}; --size:10rem; --thickness: 0.8rem;" role="progressbar">
				<span class="text-2xl font-black text-slate-800">{conversionRate.toFixed(1)}%</span>
			</div>
			
			<div class="flex gap-8 mt-6 text-sm text-center">
				<div>
					<div class="text-slate-400 text-xs font-bold uppercase tracking-wider">Total Views</div>
					<div class="font-black text-xl text-slate-800 mt-1">{totalViews}</div>
				</div>
				<div class="divider divider-horizontal"></div>
				<div>
					<div class="text-slate-400 text-xs font-bold uppercase tracking-wider">Total Entries</div>
					<div class="font-black text-xl text-slate-800 mt-1">{totalSubmissions}</div>
				</div>
			</div>
		</div>
	</div>
</div>

<!-- Recent Submissions Feed -->
<div class="card bg-white shadow-sm border border-slate-100">
	<div class="card-body">
		<h2 class="card-title text-slate-800 font-bold text-lg mb-4">Recent Activity Feed</h2>
		
		{#if data.recentSubmissions.length === 0}
			<div class="text-center py-8 text-slate-400 italic text-sm">
				No submission activity recorded yet. Generate a link to start capturing lead data.
			</div>
		{:else}
			<div class="overflow-x-auto w-full">
				<table class="table w-full text-slate-700">
					<thead>
						<tr class="text-slate-400 uppercase text-xs font-bold tracking-wider border-b border-slate-100">
							<th>Date</th>
							<th>Form Link</th>
							<th>Contact Details</th>
							<th>Type</th>
							<th>Action</th>
						</tr>
					</thead>
					<tbody>
						{#each data.recentSubmissions as entry (entry.id)}
							<tr class="hover:bg-slate-50 border-b border-slate-100">
								<td class="text-xs text-slate-500 font-mono">
									{formatDate(entry.createdAt)}
								</td>
								<td>
									<span class="badge badge-neutral badge-sm font-semibold">{entry.formName}</span>
								</td>
								<td>
									<div class="font-bold text-slate-800">{entry.name} {entry.surname}</div>
									<div class="text-xs text-primary font-medium">{entry.email}</div>
								</td>
								<td>
									<span
										class="badge badge-sm font-semibold"
										class:badge-info={entry.type === 'supplier'}
										class:badge-success={entry.type === 'client'}
										class:badge-warning={entry.type === 'career_opportunity'}
									>
										{getTypeLabel(entry.type)}
									</span>
								</td>
								<td>
									<a href="/admin/forms/{entry.formId}" class="btn btn-xs btn-outline btn-primary gap-1">
										<Eye size={12} /> View All
									</a>
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
	.page-title {
		font-family: 'Raleway', sans-serif;
	}
</style>
