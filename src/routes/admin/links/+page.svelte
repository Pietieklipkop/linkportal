<script lang="ts">
	import { enhance } from '$app/forms';
	import { page } from '$app/state';
	import { Plus, Paperclip, Copy, ExternalLink, Edit2, FileText, MoveLeft, Settings, Eye, Check } from 'lucide-svelte';
	import { getConversionRate } from '$lib/server/utils';

	let { data, form } = $props<{
		data: {
			forms: Array<{
				id: string;
				name: string;
				slug: string;
				company: string;
				notificationEmail: string;
				emailBody: string;
				views: number;
				submissionsCount: number;
				attachmentPath: string | null;
				attachmentName: string | null;
				createdAt: Date;
			}>;
		};
		form: { error?: string; success?: boolean } | null;
	}>();

	let loading = $state(false);
	let copiedId = $state<string | null>(null);

	// View mode state: 'list' | 'create' | 'edit'
	let viewMode = $state<'list' | 'create' | 'edit'>('list');

	let editingForm = $state<{
		id: string;
		name: string;
		company: string;
		notificationEmail: string;
		emailBody: string;
		attachmentName: string | null;
		removeAttachment: boolean;
	} | null>(null);

	// Modal Tab state ('settings' | 'preview')
	let activeTab = $state<'settings' | 'preview'>('settings');

	function getAbsoluteUrl(slug: string) {
		const origin = page.url.origin;
		return `${origin}/f/${slug}`;
	}

	async function copyToClipboard(url: string, id: string) {
		try {
			await navigator.clipboard.writeText(url);
			copiedId = id;
			setTimeout(() => {
				if (copiedId === id) copiedId = null;
			}, 2000);
		} catch (err) {
			console.error('Failed to copy text: ', err);
		}
	}

	function startEdit(item: typeof data.forms[0]) {
		activeTab = 'settings';
		editingForm = {
			id: item.id,
			name: item.name,
			company: item.company || 'LinkPortal',
			notificationEmail: item.notificationEmail,
			emailBody: item.emailBody,
			attachmentName: item.attachmentName,
			removeAttachment: false
		};
		viewMode = 'edit';
	}

	function closeEdit() {
		editingForm = null;
		viewMode = 'list';
	}



	// Email preview helper
	function getPreviewHtml(template: string) {
		let body = template || '';
		body = body
			.replace(/{name}/g, 'John')
			.replace(/{surname}/g, 'Smith')
			.replace(/{email}/g, 'john.smith@example.com')
			.replace(/{phone}/g, '+27 82 123 4567')
			.replace(/{type}/g, 'Client')
			.replace(/{message}/g, 'Hello SME team,\n\nI would like to inquire about your engineering services for our upcoming plant upgrade project.\n\nBest regards,\nJohn');

		const isHtml = /<\/?[a-z][\s\S]*>/i.test(body);
		if (isHtml) {
			return body;
		} else {
			return body.replace(/\n/g, '<br>');
		}
	}
</script>

<svelte:head>
	<title>Form Links | LinkPortal</title>
</svelte:head>

{#if viewMode === 'list'}
	<div class="dashboard-header">
		<div class="header-main-row">
			<div>
				<h1 class="page-title">Form Links Management</h1>
				<p class="subtitle">Generate, edit and track custom entry capture forms with view-to-submission metrics.</p>
			</div>
			<button onclick={() => viewMode = 'create'} class="add-link-btn gap-2">
				<Plus size={16} /> Generate Link
			</button>
		</div>
	</div>

	<div class="main-card card">
		<h2 class="card-title">Active Links & Metrics</h2>
		<div class="card-line"></div>

		{#if form?.error && viewMode === 'list'}
			<div class="error-banner">
				<p>{form.error}</p>
			</div>
		{/if}

		{#if form?.success && viewMode === 'list'}
			<div class="success-banner">
				<p>Form link generated successfully!</p>
			</div>
		{/if}

		{#if data.forms.length === 0}
			<div class="empty-state">
				<p>No active form links generated yet. Click "Generate Link" above to start.</p>
			</div>
		{:else}
			<div class="table-container">
				<table class="forms-table">
					<thead>
						<tr>
							<th>Form Name</th>
							<th class="number-header">Opens</th>
							<th class="number-header">Submissions</th>
							<th class="number-header">Conversion</th>
							<th>Actions</th>
						</tr>
					</thead>
					<tbody>
						{#each data.forms as item (item.id)}
							{@const fullUrl = getAbsoluteUrl(item.slug)}
							<tr>
								<td class="form-name-cell">
									<strong>{item.name}</strong>
									<div class="sub-info"><strong>Company:</strong> {item.company}</div>
								</td>
								<td class="number-cell font-mono">{item.views}</td>
								<td class="number-cell font-mono">{item.submissionsCount}</td>
								<td class="number-cell font-mono rate-cell">
									{getConversionRate(item.submissionsCount, item.views)}
								</td>
								<td>
									<div class="action-buttons flex items-center gap-2">
										<button
											onclick={() => copyToClipboard(fullUrl, item.id)}
											class="copy-btn"
											class:copied={copiedId === item.id}
											title={copiedId === item.id ? 'Copied' : 'Copy link'}
										>
											{#if copiedId === item.id}
												<Check size={14} />
											{:else}
												<Copy size={14} />
											{/if}
										</button>
										<a
											href={fullUrl}
											target="_blank"
											rel="noopener noreferrer"
											class="open-btn"
											title="Open link"
										>
											<ExternalLink size={14} />
										</a>
										<button onclick={() => startEdit(item)} class="edit-btn gap-1">
											<Edit2 size={12} /> Edit
										</button>
										<a href="/admin/forms/{item.id}" class="view-btn gap-1">
											<FileText size={12} /> Entries
										</a>
									</div>
								</td>
							</tr>
						{/each}
					</tbody>
				</table>
			</div>
		{/if}
	</div>
{:else if viewMode === 'create'}
	<div class="back-navigation">
		<button type="button" class="back-link-btn" onclick={() => viewMode = 'list'}>
			<MoveLeft size={16} /> Back to Link List
		</button>
	</div>

	<div class="dashboard-header">
		<h1 class="page-title">Generate Form Link</h1>
		<p class="subtitle">Create a new customized capture link.</p>
	</div>

	<div class="main-card card">
		<form
			method="POST"
			action="?/createFormLink"
			use:enhance={() => {
				loading = true;
				return async ({ result, update }) => {
					loading = false;
					if (result.type === 'success') {
						viewMode = 'list';
					}
					await update();
				};
			}}
		>
			{#if form?.error}
				<div class="error-banner">
					<p>{form.error}</p>
				</div>
			{/if}

			<div class="form-group">
				<label for="name">Form Description / Target Name</label>
				<input
					type="text"
					id="name"
					name="name"
					placeholder="e.g. Supplier Contact Form"
					required
				/>
				<small class="helper-text">
					This name is unique and converted into a URL slug. You can customize the email settings after creation.
				</small>
			</div>

			<div class="form-group">
				<label for="company">Company Name</label>
				<input
					type="text"
					id="company"
					name="company"
					placeholder="e.g. Clear Metrics"
					required
				/>
				<small class="helper-text">
					This company name will appear as the sender name of the email.
				</small>
			</div>

			<div class="form-actions">
				<button type="button" onclick={() => viewMode = 'list'} class="cancel-btn">Cancel</button>
				<button type="submit" class="submit-btn save-btn" disabled={loading}>
					{#if loading}Generating...{:else}Generate Link{/if}
				</button>
			</div>
		</form>
	</div>
{:else if viewMode === 'edit' && editingForm}
	<div class="back-navigation">
		<button type="button" class="back-link-btn" onclick={closeEdit}>
			<MoveLeft size={16} /> Back to Link List
		</button>
	</div>

	<div class="dashboard-header">
		<h1 class="page-title">Edit Link Details: {editingForm.name}</h1>
		<p class="subtitle">Customize company settings, success attachments, and notification alerts.</p>
	</div>

	<div class="edit-page-layout">
		<!-- Left Pane: Settings -->
		<div class="edit-pane card">
			<h2 class="card-title flex items-center gap-2">
				<Settings size={18} /> Settings
			</h2>
			<div class="card-line"></div>

			<form
				method="POST"
				action="?/updateFormLink"
				enctype="multipart/form-data"
				use:enhance={() => {
					loading = true;
					return async ({ result, update }) => {
						loading = false;
						if (result.type === 'success') {
							viewMode = 'list';
							editingForm = null;
						}
						await update();
					};
				}}
			>
				{#if form?.error}
					<div class="error-banner">
						<p>{form.error}</p>
					</div>
				{/if}

				<input type="hidden" name="id" value={editingForm.id} />

				<div class="form-group">
					<label for="disabledFormName">Form Name (Read-Only)</label>
					<input id="disabledFormName" type="text" value={editingForm.name} disabled class="disabled-input" />
					<small class="helper-text">
						The name/slug is fixed to ensure public link routes do not break.
					</small>
				</div>

				<div class="form-group">
					<label for="editCompany">Company Name</label>
					<input
						type="text"
						id="editCompany"
						name="company"
						bind:value={editingForm.company}
						required
					/>
					<small class="helper-text">
						This company name will appear as the sender name of the email.
					</small>
				</div>

				<div class="form-group">
					<label for="editNotificationEmail">Notification Email</label>
					<input
						type="email"
						id="editNotificationEmail"
						name="notificationEmail"
						bind:value={editingForm.notificationEmail}
						required
					/>
					<small class="helper-text">
						Destination for alert notifications for this form.
					</small>
				</div>

				<div class="form-group">
					<label for="editEmailBody">Email Body Template (HTML Supported)</label>
					<textarea
						id="editEmailBody"
						name="emailBody"
						rows="8"
						bind:value={editingForm.emailBody}
						required
					></textarea>
					<small class="helper-text">
						HTML tags are fully supported. Use templates to customize notifications.
					</small>
					<small class="helper-text placeholder-guide">
						Placeholders: <code class="placeholder-code">&#123;name&#125;</code>, <code class="placeholder-code">&#123;surname&#125;</code>, <code class="placeholder-code">&#123;email&#125;</code>, <code class="placeholder-code">&#123;phone&#125;</code>, <code class="placeholder-code">&#123;type&#125;</code>, <code class="placeholder-code">&#123;message&#125;</code>
					</small>
				</div>

				<!-- R2 Attachment Section -->
				<div class="form-group attachment-section">
					<label for="attachment">Success Email Attachment</label>
					
					{#if editingForm.attachmentName && !editingForm.removeAttachment}
						<div class="current-attachment">
							<span class="file-name inline-flex items-center gap-1">
								<Paperclip size={14} /> {editingForm.attachmentName}
							</span>
							<label class="remove-label">
								<input
									type="checkbox"
									name="removeAttachment"
									value="true"
									bind:checked={editingForm.removeAttachment}
								/>
								Remove Attachment
							</label>
						</div>
					{:else}
						<input type="file" id="attachment" name="attachment" class="file-input-field" />
						<small class="helper-text">
							Upload a file (brochure, invoice, guide) to send along with success emails.
						</small>
					{/if}
				</div>

				<div class="form-actions">
					<button type="button" onclick={closeEdit} class="cancel-btn">Cancel</button>
					<button type="submit" class="submit-btn save-btn" disabled={loading}>
						{#if loading}Saving...{:else}Save Changes{/if}
					</button>
				</div>
			</form>
		</div>

		<!-- Right Pane: Live Preview -->
		<div class="preview-pane card">
			<h2 class="card-title flex items-center gap-2">
				<Eye size={18} /> Live Preview
			</h2>
			<div class="card-line"></div>

			<div class="preview-container">
				<div class="preview-meta">
					<div><strong>From:</strong> {editingForm.company} &lt;no-reply@clear-metrics.co.za&gt;</div>
					<div><strong>To:</strong> {editingForm.notificationEmail || 'admin@linkportal.com'}</div>
					<div><strong>Subject:</strong> New Form Entry: {editingForm.name}</div>
				</div>
				<div class="preview-envelope">
					<div class="email-mock-header">
						Form Submission Alert
					</div>
					<div class="email-mock-body">
						{@html getPreviewHtml(editingForm.emailBody)}
					</div>
					{#if editingForm.attachmentName && !editingForm.removeAttachment}
						<div class="email-mock-attachment">
							<Paperclip size={14} class="text-slate-400" />
							<span class="mock-file-name">{editingForm.attachmentName}</span>
							<span class="mock-file-size">(Cloudflare R2 Storage)</span>
						</div>
					{/if}
				</div>
			</div>
		</div>
	</div>
{/if}

<style>
	.dashboard-header {
		margin-bottom: 2rem;
	}

	.header-main-row {
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

	.add-link-btn {
		background-color: #b21e23;
		color: #ffffff;
		border: none;
		border-radius: 2px;
		padding: 0.8rem 1.5rem;
		font-family: 'Raleway', sans-serif;
		font-weight: 700;
		font-size: 0.95rem;
		text-transform: uppercase;
		letter-spacing: 0.05em;
		cursor: pointer;
		display: flex;
		align-items: center;
		gap: 0.5rem;
		box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);
		transition: background-color 0.2s;
	}

	.add-link-btn:hover {
		background-color: #013859;
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
		margin-bottom: 1.25rem;
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
	textarea {
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
	textarea:focus {
		outline: none;
		border-color: #013859;
	}

	.disabled-input {
		background-color: #f1f3f5 !important;
		color: #6c757d;
		cursor: not-allowed;
	}

	.helper-text {
		font-size: 0.75rem;
		color: #666;
		line-height: 1.4;
	}

	.placeholder-guide {
		margin-top: 0.25rem;
	}

	.placeholder-code {
		background-color: #f3f4f6;
		padding: 0.1rem 0.25rem;
		border-radius: 2px;
		color: #b21e23;
		font-size: 0.75rem;
		font-family: monospace;
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

	.forms-table {
		width: 100%;
		border-collapse: collapse;
		text-align: left;
	}

	.forms-table th {
		padding: 0.75rem 1rem;
		border-bottom: 2px solid #013859;
		color: #013859;
		font-family: 'Raleway', sans-serif;
		font-weight: 700;
		font-size: 0.9rem;
	}

	.number-header {
		text-align: right;
		padding-right: 1.5rem !important;
	}

	.forms-table td {
		padding: 1rem;
		border-bottom: 1px solid #e5e7eb;
		vertical-align: middle;
	}

	.form-name-cell {
		color: #204f6a;
		font-size: 1rem;
		white-space: nowrap;
	}

	.sub-info {
		margin-bottom: 0.25rem;
	}

	.number-cell {
		text-align: right;
		font-weight: 700;
		color: #1b1b1b;
		padding-right: 1.5rem !important;
	}

	.font-mono {
		font-family: monospace;
		font-size: 0.95rem;
	}

	.rate-cell {
		color: #204f6a;
	}



	.copy-btn, .open-btn {
		width: 32px;
		height: 32px;
		border: none;
		border-radius: 2px;
		font-family: 'Raleway', sans-serif;
		font-size: 0.8rem;
		font-weight: 700;
		cursor: pointer;
		transition: background-color 0.2s;
		display: inline-flex;
		align-items: center;
		justify-content: center;
		text-decoration: none;
		box-sizing: border-box;
		white-space: nowrap;
	}

	.copy-btn {
		background-color: #204f6a;
		color: white;
	}

	.copy-btn:hover {
		background-color: #013859;
	}

	.copy-btn.copied {
		background-color: #16a34a;
	}

	.open-btn {
		background-color: #555;
		color: white;
	}

	.open-btn:hover {
		background-color: #333;
	}

	.action-buttons {
		display: flex;
		gap: 0.35rem;
		align-items: center;
	}

	.edit-btn, .view-btn {
		padding: 0.4rem 0.8rem;
		border: none;
		border-radius: 2px;
		font-family: 'Raleway', sans-serif;
		font-size: 0.8rem;
		font-weight: 700;
		cursor: pointer;
		transition: background-color 0.2s;
		display: inline-flex;
		align-items: center;
		justify-content: center;
		gap: 0.25rem;
		text-decoration: none;
		height: 32px;
		box-sizing: border-box;
		white-space: nowrap;
		line-height: 1;
	}

	.edit-btn {
		background-color: #204f6a;
		color: white;
	}

	.edit-btn:hover {
		background-color: #013859;
	}

	.view-btn {
		background-color: #b21e23;
		color: white;
	}

	.view-btn:hover {
		background-color: #013859;
	}

	/* Back Navigation */
	.back-navigation {
		margin-bottom: 1.5rem;
	}

	.back-link-btn {
		background: none;
		border: none;
		color: #013859;
		font-family: 'Raleway', sans-serif;
		font-weight: 700;
		font-size: 0.95rem;
		cursor: pointer;
		padding: 0;
		display: flex;
		align-items: center;
		gap: 0.25rem;
		transition: color 0.2s;
	}

	.back-link-btn:hover {
		color: #b21e23;
		text-decoration: underline;
	}

	/* Form actions */
	.form-actions {
		display: flex;
		gap: 1rem;
		margin-top: 1.5rem;
	}

	/* Edit Page Layout */
	.edit-page-layout {
		display: grid;
		grid-template-columns: 1.2fr 1fr;
		gap: 2rem;
		align-items: start;
	}

	@media (max-width: 1024px) {
		.edit-page-layout {
			grid-template-columns: 1fr;
		}
	}

	.edit-pane, .preview-pane {
		margin-bottom: 0;
	}

	/* Attachment Upload section */
	.attachment-section {
		background-color: #f8fafc;
		border: 1px dashed #cbd5e1;
		border-radius: 4px;
		padding: 1rem;
		margin-top: 1.5rem;
	}

	.current-attachment {
		display: flex;
		justify-content: space-between;
		align-items: center;
		background: #ffffff;
		padding: 0.5rem 1rem;
		border-radius: 4px;
		border: 1px solid #e2e8f0;
	}

	.file-name {
		font-weight: 700;
		color: #1e40af;
		font-size: 0.9rem;
	}

	.remove-label {
		font-size: 0.8rem;
		color: #991b1b;
		cursor: pointer;
		display: flex;
		align-items: center;
		gap: 0.25rem;
		font-weight: 700;
	}

	.file-input-field {
		font-size: 0.9rem;
		font-family: inherit;
	}

	/* Live Email Preview */
	.preview-container {
		background-color: #f1f5f9;
		border-radius: 6px;
		padding: 1.5rem;
		box-sizing: border-box;
		border: 1px solid #e2e8f0;
	}

	.preview-meta {
		font-size: 0.85rem;
		color: #475569;
		display: flex;
		flex-direction: column;
		gap: 0.3rem;
		border-bottom: 1px dashed #cbd5e1;
		padding-bottom: 1rem;
		margin-bottom: 1rem;
	}

	.preview-envelope {
		background: #ffffff;
		border-radius: 4px;
		box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);
		border: 1px solid #e2e8f0;
	}

	.email-mock-header {
		background-color: #013859;
		color: #ffffff;
		padding: 1rem;
		font-family: 'Raleway', sans-serif;
		font-weight: 900;
		font-size: 1.1rem;
		border-top-left-radius: 4px;
		border-top-right-radius: 4px;
		border-bottom: 3px solid #b21e23;
	}

	.email-mock-body {
		padding: 1.5rem;
		font-family: sans-serif;
		color: #1b1b1b;
		line-height: 1.6;
		font-size: 0.95rem;
		min-height: 180px;
	}

	.email-mock-attachment {
		background-color: #f8fafc;
		border-top: 1px solid #e2e8f0;
		padding: 0.75rem 1rem;
		display: flex;
		align-items: center;
		gap: 0.5rem;
		font-size: 0.85rem;
		border-bottom-left-radius: 4px;
		border-bottom-right-radius: 4px;
	}

	.mock-file-name {
		font-weight: 700;
		color: #1e40af;
	}

	.mock-file-size {
		color: #64748b;
	}

	.cancel-btn {
		padding: 0.85rem 1.5rem;
		background-color: #e5e7eb;
		color: #1f2937;
		border: none;
		border-radius: 2px;
		font-size: 0.9rem;
		font-family: 'Raleway', sans-serif;
		font-weight: 700;
		text-transform: uppercase;
		cursor: pointer;
		transition: background-color 0.2s;
	}

	.cancel-btn:hover {
		background-color: #d1d5db;
	}

	.save-btn {
		width: auto;
		padding: 0.85rem 1.5rem;
	}
</style>
