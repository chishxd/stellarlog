<script lang="ts">
	import type { GithubCommit } from '$lib/types';
	import { onDestroy } from 'svelte';
	// import Phaser from 'phaser';
	import { selectedCommit } from '$lib/stores';

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
				this.starfield = this.add.tileSprite(
					this.scale.width / 2,
					this.scale.height / 2,
					this.scale.width,
					this.scale.height,
					'starfield'
				);

				// Basic Stuff
				this.cameras.main.setBackgroundColor('#000000');
				const startX = 50;
				const spacingX = (this.scale.width - 100) / this.commitData.length;

				// Logic to render stars
				this.commitData.forEach((commit, index) => {
					const x = startX + index * spacingX;
					const y = PhaserDefault.Math.Between(this.scale.height * 0.2, this.scale.height * 0.8);
					const radius = PhaserDefault.Math.FloatBetween(2.5, 5.0);
					const alpha = PhaserDefault.Math.FloatBetween(0.7, 1.0);

					const star = this.add.circle(x, y, radius, 0xffffff);
					star.setAlpha(alpha);

					star.setInteractive({ useHandCursor: true });

					const hitArea = new PhaserDefault.Geom.Circle(0, 0, 15);
					star.setInteractive('hitArea', PhaserDefault.Geom.Circle.Contains);

					star.on('pointerdown', () => {
						selectedCommit.set(commit);
						if (this.player) {
							console.log(`Moving to commit: ${commit.sha}`);

							// The animation
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
			width: '100%',
			height: '100%',
			scale: {
				mode: PhaserDefault.Scale.RESIZE
			},
			parent: targetDiv,
			backgroundColor: '#000000',
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
		width: 100%;
		height: 100%;
		margin: 0;
		border: none;
	}
</style>
