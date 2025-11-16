<script lang="ts">
	import '../app.css';
	import favicon from '$lib/assets/favicon.png';

	let { children } = $props();
</script>

<svelte:head>
	<link rel="icon" href={favicon} />
</svelte:head>

<div class="flex h-screen w-screen flex-col overflow-hidden bg-slate-900 text-slate-300">
	<header
		class="flex shrink-0 items-center justify-between border-b border-slate-700 bg-slate-800 px-6 py-2"
	>
		<a href="/" class="text-lg font-semibold text-slate-100 no-underline">StellarLog</a>
		<!-- <p>Welcome to StellarLog!</p> -->

		<form method="get" class="flex items-center gap-2">
			<input
				name="repo"
				type="text"
				placeholder="https://github.com/owner/repo"
				required
				class="w-80 rounded-md border border-slate-600 bg-slate-900 px-3 py-1.5 text-slate-100 placeholder-slate-500 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:outline-none"
			/>
			<button
				type="submit"
				class="rounded-md bg-green-600 px-4 py-1.5 font-medium text-white hover:bg-green-700 focus:ring-2 focus:ring-green-500 focus:ring-offset-2 focus:ring-offset-slate-800 focus:outline-none"
				>Launch</button
			>
		</form>
	</header>

	<main class="relative grow">
		<!-- Svelte 5 renders the page content here -->
		{@render children()}
	</main>
</div>
