<script lang="ts">
	import '../app.css';
	import favicon from '$lib/assets/favicon.svg';

	let { children } = $props();
</script>

<svelte:head>
	<link rel="icon" href={favicon} />
</svelte:head>

<div class="app-container">
	<header class="app-header">
		<a href="/" class="logo">StellarLog</a>
		<p>Welcome to StellarLog!</p>

		<form method="get" class="repo-form">
			<input name="repo" type="text" placeholder="https://github.com/owner/repo" required />
			<button type="submit">Launch</button>
		</form>
	</header>

	<main class="app-main">
		<!-- Svelte 5 renders the page content here -->
		{@render children()}
	</main>
</div>

<style>
	.app-container {
		display: flex;
		flex-direction: column;
		height: 100vh;
		width: 100vw;
		overflow: hidden;
		background-color: #0d1117;
	}

	.app-header {
		display: flex;
		justify-content: space-between;
		align-items: center;
		padding: 0.5rem 1.5rem;
		background-color: #161b22;
		border-bottom: 1px solid #30363d;
		flex-shrink: 0;
	}

	.logo {
		font-size: 1.2rem;
		font-weight: 600;
		color: #e6edf3;
		text-decoration: none;
	}

	.repo-form {
		display: flex;
		gap: 0.5rem;
	}

	input {
		background-color: #010409;
		border: 1px solid #30363d;
		color: #e6edf3;
		padding: 10px;
		width: 300px;
		border-radius: 6px;
	}

	button {
		background-color: #238636;
		color: #ffffff;
		border: 1px solid #2ea043;
		font-weight: 500;
		padding: 10px 16px;
		border-radius: 6px;
		cursor: pointer;
		transition: background-color 0.2s;
	}

	button:hover {
		background-color: #2ea043;
	}

	.app-main {
		flex-grow: 1;
		position: relative;
	}
</style>
