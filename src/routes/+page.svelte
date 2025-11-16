<script lang="ts">
	import CommitInfo from '$lib/components/CommitInfo.svelte';
	import GameCanvas from '$lib/components/GameCanvas.svelte';

	export let data;

	// Debug to see what's in data
	$: console.log('Page data:', data);
</script>

{#if data?.commits && data.commits.length > 0}
	<!-- <p>Successfully found {data.commits.length} commits. The game canvas is now active.</p> -->
	<GameCanvas commits={data.commits} />
{:else if !data?.error && data?.commits}
	<div class="flex h-full w-full items-center justify-center font-mono text-slate-500">
		{data?.commits
			? 'No commits found. Try a different repository.'
			: 'Enter a repository URL to begin your journey.'}
	</div>
{/if}

{#if data?.error}
	<div class="flex h-full w-full items-center justify-center font-mono text-red-400">
		<p>Error: {data.error}</p>
	</div>
{/if}

<CommitInfo />
