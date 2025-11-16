<script lang="ts">
	import CommitInfo from '$lib/components/CommitInfo.svelte';
	import GameCanvas from '$lib/components/GameCanvas.svelte';

	export let data;

	// Debug to see what's in data
	$: console.log('Page data:', data);
</script>

{#if data?.error}
	<p style="color: red;">Error: {data.error}</p>
{/if}

{#if data?.commits && data.commits.length > 0}
	<p>Successfully found {data.commits.length} commits. The game canvas is now active.</p>
	<GameCanvas commits={data.commits} />
{:else if !data?.error && data?.commits}
	<p>No commits found. Try a different repository.</p>
{/if}

<CommitInfo />

<style>
	* {
		padding: 5px;
	}
	p {
		color: green;
	}
</style>
