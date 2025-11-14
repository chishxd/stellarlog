<script lang="ts">
	import GameCanvas from '$lib/components/GameCanvas.svelte';

	export let data;

	// Debug to see what's in data
	$: console.log('Page data:', data);
</script>

<h1>StellarLog</h1>
<p>Welcome to StellarLog! Please enter the GitHub repo url here</p>

<form method="get" action="">
	<input name="repo" type="text" placeholder="https://github.com/owner/repo" required />
	<button type="submit">Launch</button>
</form>

{#if data?.error}
	<p style="color: red;">Error: {data.error}</p>
{/if}

{#if data?.commits && data.commits.length > 0}
	<p>Successfully found {data.commits.length} commits. The game canvas is now active.</p>
	<GameCanvas commits={data.commits} />
{:else if !data?.error && data?.commits}
	<p>No commits found. Try a different repository.</p>
{/if}
