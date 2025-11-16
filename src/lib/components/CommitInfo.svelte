<script>
	import { selectedCommit } from '$lib/stores';
</script>

{#if selectedCommit}
	<div
		class="absolute right-4 bottom-4 z-10 w-96 rounded-lg border border-slate-700 bg-slate-900/70 p-4 text-left font-mono shadow-lg backdrop-blur-sm"
	>
		<h3 class="text-sm font-semibold tracking-wider text-slate-400 uppercase">COMMIT INFO</h3>
		<p class="mt-2 truncate text-xs text-slate-500">
			{$selectedCommit?.sha.substring(0, 7)}
		</p>
		<p class="text-slate-200s mt-1 text-base">{$selectedCommit?.commit.message}</p>
		<p class="mt-2 text-sm text-slate-400">
			{$selectedCommit?.commit.author.name} on
			{new Date($selectedCommit?.commit.author.date || '').toLocaleDateString()}
		</p>
	</div>
{/if}

