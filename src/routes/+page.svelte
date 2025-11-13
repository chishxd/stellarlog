<script lang="ts">
	import type { GithubCommit } from '$lib/types';
	import { commitStore } from '$lib/stores';

	let repoUrl: string;
	let isLoading = false;
	let errorMessage = '';

	const handleLaunch = async () => {
		isLoading = true;
		errorMessage = '';
		commitStore.set([]);

		const url = repoUrl.split('/');
		const domain = url[2];

		if (domain == 'github.com') {
			const repo_info = url.slice(-2);
			const owner = repo_info[0];
			const repo = repo_info[1];

			const apiUrl = `https://api.github.com/repos/${owner}/${repo}/commits?per_page=100`;
			const response = await fetch(apiUrl);
			if (!response.ok) {
				errorMessage = 'Failed to fetch data. Check repository URL properly';
				isLoading = false;
				return;
			}
			const commits = (await response.json()) as GithubCommit[];

			commitStore.set(commits);
		} else {
			errorMessage = 'Invalid Link. Please put proper Github Repository Link';
		}
		isLoading = false;
	};
</script>

<h1>StellarLog</h1>
<p>Welcome to StellarLog! Please enter the GitHub repo url here</p>
<input bind:value={repoUrl} type="text" placeholder="https://github.com/<user>/<repo-name>" />
<button on:click={handleLaunch} disabled={isLoading}>
	{#if isLoading}
		Loading...
	{:else}
		Launch
	{/if}
</button>

{#if errorMessage}
	<p style="color: red;">{errorMessage}</p>
{/if}

{#if $commitStore.length > 0}
	<p>Successfully found {$commitStore.length} commits. The game canvas would now be active.</p>
{/if}
