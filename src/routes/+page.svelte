<script lang="ts">
	import type { GithubCommit } from '../types';

	let repoUrl: string;

	const handleLaunch = async () => {
		const url = repoUrl.split('/');
		const domain = url[2];

		if (domain == 'github.com') {
			const repo_info = url.slice(-2);
			const owner = repo_info[0];
			const repo = repo_info[1];

			const apiUrl = `https://api.github.com/repos/${owner}/${repo}/commits?per_page=100`;
			const response = await fetch(apiUrl);
			if (!response.ok) {
				console.error('Failed to fetch data');
			}
			const commits = (await response.json()) as GithubCommit[];

			console.log(commits[0].commit.author.name);
		} else {
			console.log('INVALID LINK');
		}
	};
</script>

<h1>StellarLog</h1>
<p>Welcome to stellarLog! Please enter the GitHub repo url here</p>
<input bind:value={repoUrl} type="text" placeholder="https://github.com/<user>/<repo-name>" />
<button on:click={handleLaunch}>Launch</button>
