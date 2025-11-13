import type { GithubCommit } from '$lib/types';

export const load = async ({ url }) => {
	const repoUrl = url.searchParams.get('repo');

	if (!repoUrl) {
		return { commits: [] as GithubCommit[] };
	}

	try {
		const urlParts = repoUrl.split('/');
		const owner = urlParts[urlParts.length - 2];
		const repo = urlParts[urlParts.length - 1];

		const apiUrl = `https://api.github.com/repos/${owner}/${repo}/commits?per_page=100`;
		const response = await fetch(apiUrl);
		if (!response.ok) {
			return { commits: [], error: 'Failed to fetch data. Check repository URL.' };
		}
		const commits = (await response.json()) as GithubCommit[];

		return { commits: commits, error: null };
	} catch (e) {
		return { commits: [], error: 'Invalid URL provided.' };
	}
};
