<script lang="ts">
	import type { GithubCommit } from '$lib/types';
	import { onDestroy } from 'svelte';
	// import Phaser from 'phaser';
	import { selectedCommit } from '$lib/stores';

	export let commits: GithubCommit[] = [];
	let GameScene: any;
	let HudScene: any;

	let game: Phaser.Game | null = null;
	let gameContainer: HTMLDivElement;

	const layoutCommitGraph = (commits: GithubCommit[], canvasHeight: number = 600) => {
		const positionedCommits = new Map<string, { commit: GithubCommit; x: number; y: number }>();
		const lanes: (string | null)[] = [];

		const sortedCommits = [...commits].reverse();

		sortedCommits.forEach((commit, timeIndex) => {
			let assignedLane = -1;

			// Find a commit that fits this lane
			// A commit fits the lane if it's parent is at end of the lane
			if (commit.parents.length > 0) {
				for (let i = 0; i < lanes.length; i++) {
					if (lanes[i] === commit.parents[0].sha) {
						lanes[i] = commit.sha;
						assignedLane = i;
						break;
					}
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
				x: 50 + timeIndex * 50,
				y: 50 + assignedLane * 40
			});

			if (commit.parents.length > 0) {
				for (let i = 0; i < lanes.length; i++) {
					if (i !== assignedLane && lanes[i] === commit.parents[0].sha) {
						lanes[i] = null;
					}
				}
			}
		});

		if (positionedCommits.size === 0) {
			return positionedCommits;
		}

		// Find min and max of the graph
		let minY = Infinity;
		let maxY = -Infinity;
		for (const node of positionedCommits.values()) {
			if (node.y < minY) minY = node.y;
			if (node.y > maxY) maxY = node.y;
		}

		const graphHeight = maxY - minY;
		const offsetY = (canvasHeight - graphHeight) / 2 - minY;

		const centeredCommits = new Map<string, { commit: GithubCommit; x: number; y: number }>();
		positionedCommits.forEach((node, sha) => {
			centeredCommits.set(sha, {
				...node,
				y: node.y + offsetY
			});
		});

		return centeredCommits;
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

		// --- 1. DEFINE THE NEW HUD SCENE ---
		HudScene = class extends PhaserDefault.Scene {
			starfield: Phaser.GameObjects.TileSprite | null = null;

			constructor() {
				super({ key: 'HudScene' });
			}

			preload() {
				this.load.image('starfield', '/starfield.png');
			}

			create() {
				// Create the background. Its camera will never move.
				this.starfield = this.add.tileSprite(
					this.scale.width / 2,
					this.scale.height / 2,
					this.scale.width,
					this.scale.height,
					'starfield'
				);

				// Listen for resize events to keep the background perfectly filling the screen
				this.scale.on('resize', (gameSize: Phaser.Structs.Size) => {
					if (this.starfield) {
						this.starfield.setSize(gameSize.width, gameSize.height);
						this.starfield.setPosition(gameSize.width / 2, gameSize.height / 2);
					}
				});
			}

			update() {
				if (this.starfield) {
					this.starfield.tilePositionX += 0.2; // A slower, more cinematic scroll
				}
			}
		};

		// I HATE JS :HEAVYSOB:
		GameScene = class extends PhaserDefault.Scene {
			// commitData: GithubCommit[];

			// starfield: Phaser.GameObjects.TileSprite | null = null;
			player: any = null;
			visibleStars: Map<string, any> = new Map();
			visibleLines: any = null;
			positionedCommits: Map<string, { commit: GithubCommit; x: number; y: number }> = new Map();

			preload() {
				this.load.image('ship', '/ship.png');
			}

			constructor() {
				super({ key: 'GameScene' });
			}
			init(data: {
				positionedCommits: Map<string, { commit: GithubCommit; x: number; y: number }>;
			}) {
				this.positionedCommits = data.positionedCommits;
			}

			create() {
				// this.starfield = this.add.tileSprite(
				// 	this.scale.width / 2,
				// 	this.scale.height / 2,
				// 	this.scale.width,
				// 	this.scale.height,
				// 	'starfield'
				// );

				this.visibleLines = this.add.graphics();
				this.cameras.main.setBackgroundColor('rgba(0,0,0,0)');
				let firstNode: { commit: GithubCommit; x: number; y: number } | undefined = undefined;

				// this.starfield.setScrollFactor(0);

				if (this.positionedCommits.size > 0) {
					let lowestX = Infinity;
					this.positionedCommits.forEach((node) => {
						if (node.x < lowestX) {
							lowestX = node.x;
							firstNode = node;
						}
					});

					let maxX = -Infinity;
					let maxY = -Infinity;
					this.positionedCommits.forEach((node) => {
						if (node.x > maxX) maxX = node.x;
						if (node.y > maxY) maxY = node.y;
					});

					const worldHeight = Math.max(this.scale.height, maxY + 200);

					this.cameras.main.setBounds(0, 0, maxX + 200, maxY + 200);

					if (firstNode) {
						const node = firstNode as { commit: GithubCommit; x: number; y: number };
						this.player = this.add.sprite(node.x, node.y - 30, 'ship');
						this.player.setAngle(0);
						this.player.setScale(0.6);
					}
				}

				this.input.on(
					'wheel',
					(
						pointer: Phaser.Input.Pointer,
						gameObjects: Phaser.GameObjects.GameObject[],
						deltaX: number,
						deltaY: number,
						deltaZ: number
					) => {
						const newZoom = this.cameras.main.zoom - deltaY * 0.0015;
						this.cameras.main.zoom = Phaser.Math.Clamp(newZoom, 0.2, 2.5);

						this.updateVisibleObjects();
					}
				);

				this.input.on('pointermove', (pointer: Phaser.Input.Pointer) => {
					if (!pointer.isDown) return;

					this.cameras.main.scrollX -=
						(pointer.x - pointer.prevPosition.x) / this.cameras.main.zoom;
					this.cameras.main.scrollY -=
						(pointer.y - pointer.prevPosition.y) / this.cameras.main.zoom;

					this.updateVisibleObjects();
				});

				if (firstNode) {
					const node = firstNode as { commit: GithubCommit; x: number; y: number };
					this.cameras.main.centerOn(node.x, node.y);
				}

				// Set up the trigger and perform the initial draw
				this.cameras.main.on('move', () => this.updateVisibleObjects());

				// background Rendering Stuff
				this.updateVisibleObjects();
			}

			updateVisibleObjects() {
				if (!this.visibleLines) return;

				const cameraBounds = this.cameras.main.worldView;

				// This part destroys off-screen stars
				this.visibleStars.forEach((star, sha) => {
					if (!PhaserDefault.Geom.Rectangle.Overlaps(cameraBounds, star.getBounds())) {
						star.destroy();
						this.visibleStars.delete(sha);
					}
				});
				this.visibleLines.clear();

				// Create only on camera objects
				this.positionedCommits.forEach(({ commit, x, y }) => {
					if (cameraBounds.contains(x, y)) {
						this.visibleLines?.lineStyle(1, 0x444444);
						commit.parents.forEach((parent) => {
							const parentNode = this.positionedCommits.get(parent.sha);
							if (parentNode) {
								this.visibleLines?.lineBetween(x, y, parentNode.x, parentNode.y);
							}
						});

						if (!this.visibleStars.has(commit.sha)) {
							const totalChanges = commit.stats.total;
							const cappedChanges = Math.min(totalChanges, 500);
							const radius = PhaserDefault.Math.Linear(2, 6, cappedChanges / 500);

							const star = this.add.circle(x, y, radius, 0xffffff);

							star.setInteractive({ useHandCursor: true });

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
							star.setInteractive(hitArea, PhaserDefault.Geom.Circle.Contains);
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

							// Add the new star to our tracking map
							this.visibleStars.set(commit.sha, star);
						}
					}
				});
			}

			update() {
				this.updateVisibleObjects();
			}
		};

		const canvasHeight = targetDiv.clientHeight || 600;
		const positionedCommits = layoutCommitGraph(commitData, canvasHeight);

		const config: Phaser.Types.Core.GameConfig = {
			type: PhaserDefault.AUTO,
			width: '100%',
			height: '100%',
			scale: {
				mode: PhaserDefault.Scale.RESIZE
			},
			parent: targetDiv,
			transparent: true
		};

		game = new PhaserDefault.Game(config);
		game.scene.add('HudScene', HudScene, true);
		game.scene.add('GameScene', GameScene, true, { positionedCommits: positionedCommits });
		game.scene.bringToTop('GameScene');
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
