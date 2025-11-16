<script>
	import { selectedCommit } from '$lib/stores';
</script>

{#if selectedCommit}
	<div
		class="absolute right-4 bottom-4 z-10 flex max-h-56 w-96 flex-col rounded-lg border border-slate-700 bg-slate-900/70 p-4 text-left font-mono shadow-lg backdrop-blur-sm"
	>
		<div class="shrink-0">
			<h3 class="text-sm font-semibold tracking-wider text-slate-400 uppercase">COMMIT INFO</h3>
			<p class="mt-2 truncate text-xs text-slate-500">
				{$selectedCommit?.sha.substring(0, 7)}
			</p>
		</div>

		<p class="text-slate-200s mt-1 min-h-0 grow overflow-y-auto text-base">
			{$selectedCommit?.commit.message}
		</p>

		<div class="mt-2 shrink-0 border-t border-slate-700 pt-2">
			<p class=" text-sm text-slate-400">
				{$selectedCommit?.commit.author.name} on
				{new Date($selectedCommit?.commit.author.date || '').toLocaleDateString()}
			</p>
		</div>
	</div>
{/if}
