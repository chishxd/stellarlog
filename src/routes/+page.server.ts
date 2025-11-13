/**
 * @file Server-Side logic for StellarLog
 *
 * @description This file handles the data-loading stuff for our application
 * It receives GH repo link via that form in client(named REPO)
 * then I fetches the commit history and returns an object with all the commits and error(if any)
 *
 * I made this file to avoid CORS issues(it was happening previously, yeah)
 */

import type { GithubCommit } from '$lib/types';
import type { PageServerLoad } from './$types.js';

/**
 * SvelteKit's load function that fetches commit data based on URL query
 * @param {object} event - The SvelteKit's implicit load event object
 * @param {URL} event.url - Contains the URL of the current request, including search parameters.
 * @returns {Promise<{commits: GithubCommit[], error: string | null}>}
 */
export const load: PageServerLoad = async ({
	url
}: {
	url: URL;
}): Promise<{ commits: GithubCommit[]; error: string | null }> => {
	const repoUrl = url.searchParams.get('repo');

	if (!repoUrl) {
		return { commits: [] as GithubCommit[], error: null };
	}

	try {
		// Parsing / Formatting the URL here.. IDK if I needed to comment that
		const urlParts = repoUrl.split('/');
		const owner = urlParts[urlParts.length - 2];
		const repo = urlParts[urlParts.length - 1];

		// Build url for API and fetch data
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
