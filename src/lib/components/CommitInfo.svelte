<script>
	import { selectedCommit } from '$lib/stores';
</script>

{#if selectedCommit}
	<div class="commit-panel">
		<h3>COMMIT INFO</h3>
		<p class="sha">{$selectedCommit?.sha.substring(0, 7)}</p>
		<p class="message">{$selectedCommit?.commit.message}</p>
		<p class="author">
			{$selectedCommit?.commit.author.name} on
			{new Date($selectedCommit?.commit.author.date || '').toLocaleDateString()}
		</p>
	</div>
{/if}

<style>
	.commit-panel {
		position: absolute;
		bottom: 20px;
		left: 20px;
		width: 300px;
		background-color: rgba(13, 17, 23, 0.8);
		border: 1px solid #30363d;
		border-radius: 6px;
		padding: 1rem;
		text-align: left;
		font-family: ui-monospace, monospace;
		backdrop-filter: blur(5px);
	}
	.sha {
		font-size: 0.8rem;
		color: #8b949e;
	}
	.message {
		font-size: 1rem;
		color: #c9d1d9;
		margin: 0.5rem 0;
	}
	.author {
		font-size: 0.9rem;
		color: #8b949e;
	}
</style>
