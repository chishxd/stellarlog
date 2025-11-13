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

/**
 * SvelteKit's load function that fetches commit data based on URL query
 * @param {object} event - The SvelteKit's implicit load event object
 * @param {URL} event.url - Contains the URL of the current request, including search parameters.
 * @returns {Promise<{commits: GithubCommit[], error: string | null}>}
 */
export const load = async ({
	url
}: {
	url: URL;
}): Promise<{ commits: GithubCommit[]; error: string | null }> => {
	const repoUrl = url.searchParams.get('repo');

	if (!repoUrl) {
		return { commits: [] as GithubCommit[], error: null };
	}

	try {
		const parsedUrl = new URL(repoUrl);
		if (parsedUrl.host !== 'github.com') {
			throw new Error('Invalid Link. Only github.com URLs are accepted');
		}

		// Parsing / Formatting the URL here.. IDK if I needed to comment that
		const pathSegments = parsedUrl.pathname.split('/').filter(Boolean);
		const owner = pathSegments[0];
		const repo = pathSegments[1];

		if (!owner || !repo) {
			throw new Error('Could not parse owner and repo from URL.');
		}

		// Build url for API and fetch data
		const apiUrl = `https://api.github.com/repos/${owner}/${repo}/commits?per_page=100`;
		const response = await fetch(apiUrl);
		if (!response.ok) {
			return { commits: [], error: `Failed to fetch data: ${response.statusText}` };
		}
		const commits = (await response.json()) as GithubCommit[];
		return { commits: commits, error: null };
	} catch (e: any) {
		return { commits: [], error: e.message || 'Unknown Error occured' };
	}
};
