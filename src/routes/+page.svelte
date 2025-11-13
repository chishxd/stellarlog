<script lang="ts">
	let repoUrl: string;

	function handleLaunch() {
		console.log(repoUrl);
	}
</script>

<h1>StellarLog</h1>
<p>Welcome to stellarLog! Please enter the GitHub repo url here</p>
<input bind:value={repoUrl} type="text" placeholder="https://github.com/<user>/<repo-name>" />
<button on:click={handleLaunch}>Launch</button>
