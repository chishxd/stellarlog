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
import { GITHUB_TOKEN } from '$env/static/private';
import type { PageServerLoad } from './$types';

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
		const parsedUrl = new URL(repoUrl);
		if (parsedUrl.host !== 'github.com') {
			throw new Error('Invalid Link. Only github.com URLs are accepted');
		}

		// Parsing / Formatting the URL here.. IDK if I needed to comment that
		const pathSegments = parsedUrl.pathname.split('/').filter(Boolean);
		const owner = pathSegments[0];
		const repo = pathSegments[1];

		const headers = {
			Authorization: `Bearer ${GITHUB_TOKEN}`
		};

		if (!owner || !repo) {
			throw new Error('Could not parse owner and repo from URL.');
		}

		// Build url for API and fetch commit data
		const listApiUrl = `https://api.github.com/repos/${owner}/${repo}/commits?per_page=50`;
		const listResponse = await fetch(listApiUrl, { headers });

		if (!listResponse.ok) {
			return { commits: [], error: `Failed to fetch data: ${listResponse.statusText}` };
		}
		const commitList = (await listResponse.json()) as { sha: string }[];

		const allCommitStats: GithubCommit[] = [];
		const batchSize = 10;

		for (let i = 0; i < commitList.length; i += batchSize) {
			const batch = commitList.slice(i, i + batchSize);

			const batchPromises = batch.map(async (item) => {
				const detailApiUrl = `https://api.github.com/repos/${owner}/${repo}/commits/${item.sha}`;
				return fetch(detailApiUrl, { headers }).then((res) => {
					if (!res.ok) {
						throw new Error(`Failed to fetch commit ${item.sha}: ${res.statusText}`);
					}
					return res.json();
				});
			});

			const batchResults = await Promise.all(batchPromises);

			allCommitStats.push(...batchResults);
		}

		return { commits: allCommitStats, error: null };
	} catch (e: any) {
		return { commits: [], error: e.message || 'Unknown Error occured' };
	}
};
