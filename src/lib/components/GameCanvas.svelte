<script lang="ts">
	import type { GithubCommit } from '$lib/types';
	import { onDestroy } from 'svelte';
	import type Phaser from 'phaser';

	export let commits: GithubCommit[] = [];
	let GameScene: any;

	let game: Phaser.Game | null = null;
	let gameContainer: HTMLDivElement;

	const handleLifecycle = async (targetDiv: HTMLDivElement, commitData: GithubCommit[]) => {
		if (game) {
			game.destroy(true);
			game = null;
		}

		if (!commitData || commitData.length === 0) {
			return;
		}

		const PhaserDefault = (await import('phaser')).default;

		// I HATE JS :HEAVYSOB:
		GameScene = class extends PhaserDefault.Scene {
			commitData: GithubCommit[];

			starfield: Phaser.GameObjects.TileSprite | null = null;
			player: Phaser.GameObjects.Sprite | null = null;

			preload() {
				this.load.image('starfield', '/starfield.png');
				this.load.image('ship', '/ship.png');
			}

			constructor() {
				super({ key: 'GameScene' });
				this.commitData = [];
			}
			init(data: { commits: GithubCommit[] }) {
				this.commitData = data.commits;
			}
			create() {
				this.starfield = this.add.tileSprite(400, 300, 800, 600, 'starfield');

				// Basic Stuff
				this.cameras.main.setBackgroundColor('#000000');
				const startX = 50;
				const spacingX = 15;

				// Logic to render stars
				this.commitData.forEach((commit, index) => {
					const x = startX + index * spacingX;
					const y = PhaserDefault.Math.Between(200, 400);
					const radius = PhaserDefault.Math.FloatBetween(1, 3.5);
					const alpha = PhaserDefault.Math.FloatBetween(0.5, 1.0);

					const star = this.add.circle(x, y, radius, 0xffffff);
					star.setAlpha(alpha);

					star.setInteractive({ useHandCursor: true });

					star.on('pointerdown', () => {
						if (this.player) {
							console.log(`Moving to commit: ${commit.sha}`);
							this.tweens.add({
								targets: this.player,
								x: star.x,
								y: star.y - 20,
								duration: 400,
								ease: 'Power2'
							});
						}
					});
				});

				if (this.commitData.length > 0) {
					const lastCommit = 0;
					const startX = 50 + lastCommit * 15;
					const startY = 250;

					this.player = this.add.sprite(startX, startY, 'ship');
					this.player.setScale(0.6);
				}
			}

			update() {
				if (this.starfield) {
					this.starfield.tilePositionX += 0.5;
				}
			}
		};

		const config: Phaser.Types.Core.GameConfig = {
			type: PhaserDefault.AUTO,
			width: 800,
			height: 600,
			parent: targetDiv,
			backgroundColor: '#1a1a1a',
			scene: GameScene
		};

		game = new PhaserDefault.Game(config);
		game.scene.start('GameScene', { commits: commitData });
	};

	$: if (commits && gameContainer) {
		handleLifecycle(gameContainer, commits);
	}

	onDestroy(() => {
		if (game) {
			game.destroy(true);
			game = null;
		}
	});
</script>

<div bind:this={gameContainer}></div>

<style>
	div {
		width: 800px;
		height: 600px;
		margin: 20px auto;
		border: 1px solid #333;
	}
</style>
