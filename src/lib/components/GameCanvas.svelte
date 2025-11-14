<script lang="ts">
	import type { GithubCommit } from '$lib/types';
	import { onMount } from 'svelte';

	export let commits: GithubCommit[] = [];

	let GameScene: any;

	onMount(() => {
		let game: Phaser.Game | null = null;

		(async () => {
			const PhaserDefault = (await import('phaser')).default;

			// This is the only place I ASKED ai how can I declare a class which requires contents from dynamically imported stuff
			GameScene = class extends PhaserDefault.Scene {
				constructor() {
					super({ key: 'GameScene' });
				}

				init(data: { commits: GithubCommit[] }) {
					console.log('Phaser scene has been initialized with data.', data);
				}

				create() {
					console.log('Phaser `create` method is running.');
					this.cameras.main.setBackgroundColor('#000000');
				}
			};

			const config: Phaser.Types.Core.GameConfig = {
				type: PhaserDefault.AUTO,
				width: 800,
				height: 600,
				parent: 'game-container',
				backgroundColor: '#1a1a1a',
				scene: GameScene
			};
			game = new PhaserDefault.Game(config);
			game.scene.start('GameScene', { commits: commits });
		})();

		return () => {
			if (game) {
				console.log('Destroying Phaser game instance.');
				game.destroy(true);
				game = null;
			}
		};
	});
</script>

<div id="game-container"></div>

<style>
	#game-container {
		width: 800px;
		height: 600px;
		margin: 20px auto;
		border: 1px solid #333;
	}
</style>
