import { Vector2 } from 'ver/Vector2';
import { math as Math } from 'ver/helpers';
import { Animation } from 'ver/Animation';
import type { Viewport } from 'ver/Viewport';
import { Loader } from 'ver/Loader';

import { SensorCamera } from 'engine/SensorCamera.js';
import { Joystick } from 'engine/scenes/gui/Joystick.js';
import { GridMap } from 'engine/scenes/gui/GridMap.js';
import { Control } from 'engine/scenes/Control.js';
import { Node2D } from 'engine/scenes/Node2D.js';
import { Camera2D } from 'engine/scenes/Camera2D.js';
import { SystemInfo } from 'engine/scenes/gui/SystemInfo.js';
import { Sprite } from 'engine/scenes/Sprite.js';
import { Enemy } from './Enemy.js';

import { touches, viewport } from 'src/canvas.js';
import { audioContorller } from '../state.js';


class Info extends Node2D {
	public self!: MainScene;
	protected async _init(): Promise<void> { this.draw_distance = Math.INF; }
	protected _ready(): void { this.zIndex = 10000; }

	protected _draw({ ctx, size }: Viewport): void {
		const center = Vector2.ZERO;
		const a = 30;

		ctx.save();
		ctx.beginPath();
		ctx.globalAlpha = 0.2;
		ctx.strokeStyle = '#ffff00';
		ctx.moveTo(center.x, center.y-a);
		ctx.lineTo(center.x, center.y+a);
		ctx.moveTo(center.x-a, center.y);
		ctx.lineTo(center.x+a, center.y);
		ctx.stroke();
		ctx.restore();
	}
}


let crosshair_target_size = new Vector2();
let current_crosshair: number = 1;

const loadCrosshair = async (i: number) => Loader.instance().loadImage(`assets/crosshair/PNG/Outline/crosshair${i.toString().padStart(3, '0')}.png`);


const moveTime_anim = new Animation(function* (target: Vector2, value: Vector2) {
	value.set(target);
	yield 300; while(value.getDistance(Vector2.ZERO) > 1) { value.moveTime(Vector2.ZERO, 10); yield 10; }
});

export class MainScene extends Control {
	protected static async _load(scene: typeof this): Promise<void> {
		await Promise.all([
			Sprite.load(),
			Enemy.load(),
			super._load(scene)
		]);
	}

	public TREE() { return {
		Camera2D,
		GridMap,
		SystemInfo,
		Info,
		// Joystick,
		Crosshair: Sprite
	}}
	// aliases
	public get $camera() { return this.get('Camera2D'); }
	public get $gridMap() { return this.get('GridMap'); }
	public get $info() { return this.get('Info'); }
	// public get $joystick() { return this.get('Joystick'); }
	public get $crosshair() { return this.get('Crosshair'); }

	public sensor_camera = new SensorCamera();

	public spawn_anim = new Animation(function* (root: MainScene) {
		yield 0; while(true) { yield 1000;
			const enemy = new Enemy();
			enemy.name = Math.randomInt(1e6, 1e7-1);
			enemy.position.set(Math.randomInt(-500, 500), Math.randomInt(-500, 500));

			enemy.init().then(() => {
				root.addChild(enemy);
				enemy.state('moveing');
			});
		}
	});

	public enemys: Enemy[] = [];

	protected async _init(this: MainScene): Promise<void> {
		await super._init();

		this.$camera.viewport = viewport;
		this.$camera.current = true;

		this.$camera.on('PreProcess', dt => {
			this.sensor_camera.update(dt, touches, this.$camera);

			this.$gridMap.scroll.set(this.$camera.position);
			this.$gridMap.position.set(this.$camera.position);
			this.$gridMap.size.set(this.$camera.size.new().inc(this.$camera.scale));
		});

		this.$gridMap.tile.set(100, 100);
		this.$info.self = this;

		await audioContorller.load('click', 'assets/audio/play.wav');


		this.$crosshair.zIndex = 10;
		this.$crosshair.on('PreRender', ({ ctx }) => ctx.imageSmoothingEnabled = false);


		loadCrosshair(current_crosshair).then(img => {
			this.$crosshair.image = img;
			crosshair_target_size.set(this.$crosshair.width, this.$crosshair.height);
		});

		this.on('child_entered_tree', scene => {
			if(scene instanceof Enemy) {
				this.enemys.push(scene);
			}
		});
		this.on('child_exiting_tree', scene => {
			if(scene instanceof Enemy) {
				const l = this.enemys.indexOf(scene);
				if(!~l) return; 
				this.enemys.splice(l, 1);
			}
		});

		viewport.on('resize', size => {
			const s = size.new().div(2);

			// this.$joystick.position.set(-(s.x - 100), s.y - 100);
		}).call(viewport, viewport.size);
	}

	protected _ready(this: MainScene): void {
		this.processPriority = 1000;

		// this.$camera.addChild(this.removeChild(this.$joystick.name, true));

		this.spawn_anim.run(this);
	}

	protected _process(this: MainScene, dt: number): void {
		moveTime_anim.tick(dt);
		this.spawn_anim.tick(dt);


		let touch = touches.findTouch(t => t.isClick());
		if(touch) {
			const pos = viewport.transformFromScreenToViewport(touch.pos.new());

			for(const enemy of this.enemys) {
				if(enemy.position.getDistance(pos) < crosshair_target_size.module) {
					this.removeChild(enemy.name);
					break;
				}
			}


			current_crosshair += 1;
			loadCrosshair(current_crosshair).then(img => {
				this.$crosshair.image = img;

				this.$crosshair.position.set(pos);

				moveTime_anim.reset().run(crosshair_target_size, this.$crosshair.size);
			});
		}
	}
}
