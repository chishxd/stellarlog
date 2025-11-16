<script lang="ts">
	import type { GithubCommit } from '$lib/types';
	import { onDestroy } from 'svelte';
	// import Phaser from 'phaser';
	import { selectedCommit } from '$lib/stores';
	import { time } from 'console';

	export let commits: GithubCommit[] = [];
	let GameScene: any;

	let game: Phaser.Game | null = null;
	let gameContainer: HTMLDivElement;

	const layoutCommitGraph = (commits: GithubCommit[]) => {
		const positionedCommits = new Map<string, { commit: GithubCommit; x: number; y: number }>();
		const lanes: (string | null)[] = [];

		const sortedCommits = [...commits].reverse();

		sortedCommits.forEach((commit, timeIndex) => {
			let assignedLane = -1;

			// Find a commit that fits this lane
			// A commit fits the lane if it's parent is at end of the lane
			for (let i = 0; i < lanes.length; i++) {
				if (lanes[i] === commit.parents[0].sha) {
					lanes[i] = commit.sha;
					assignedLane = i;
					break;
				}
			}

			// If no lane found, it's a new branch, so find some empty
			if (assignedLane === -1) {
				for (let i = 0; i < lanes.length; i++) {
					if (lanes[i] === null) {
						lanes[i] = commit.sha;
						assignedLane = i;
						break;
					}
				}
			}

			// If still no lane is found, create new one
			if (assignedLane === -1) {
				lanes.push(commit.sha);
				assignedLane = lanes.length - 1;
			}

			positionedCommits.set(commit.sha, {
				commit,
				x: 50 + assignedLane * 40,
				y: 50 + timeIndex * 30
			});

			if (commit.parents.length > 0) {
				for (let i = 0; i < lanes.length; i++) {
					if (i !== assignedLane && lanes[i] === commit.parents[0].sha) {
						lanes[i] = null;
					}
				}
			}
		});
		return positionedCommits;
	};

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
					const totalChanges = commit.stats.total;
					const cappedChanges = Math.min(totalChanges, 500);

					const radius = PhaserDefault.Math.Linear(2, 8, cappedChanges / 500);
					const alpha = PhaserDefault.Math.FloatBetween(0.7, 1.0);

					const star = this.add.circle(x, y, radius, 0xffffff);
					star.setAlpha(alpha);

					star.setInteractive({ useHandCursor: true });

					// if (totalChanges > 200) {
					// 	const glowColor = 0xfff00;
					// 	const outerGlow = this.add.circle(x, y, radius * 2, glowColor, 0.3);
					// 	const innerGlow = this.add.circle(x, y, radius * 1.5, glowColor, 0.5);
					// }

					if (totalChanges > 150 && star.postFX) {
						const glowPipeline = star.postFX.addGlow(0xffff00, 1, 0, false, 0.1);

						this.tweens.add({
							targets: glowPipeline,
							outerStrength: 4,
							yoyo: true,
							repeat: -1,
							ease: 'sine-out',
							duration: PhaserDefault.Math.Between(1500, 2500)
						});
					}

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
