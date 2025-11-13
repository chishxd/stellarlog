<script lang="ts">
	export let data;
</script>

<h1>StellarLog</h1>
<p>Welcome to StellarLog! Please enter the GitHub repo url here</p>

<form method="get">
	<input name="repo" type="text" placeholder="https://github.com/<user>/<repo-name>" />
	<button type="submit">Launch</button>
</form>

{#if data.error}
	<p style="color: red;">{data.error}</p>
{/if}

{#if data.commits && data.commits.length > 0}
	<p>Successfully found {data.commits.length} commits. The game canvas would now be active.</p>
{/if}
