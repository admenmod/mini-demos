import { Vector2 } from 'ver/Vector2';
import { math as Math } from 'ver/helpers';
import { Animation } from 'ver/Animation';
import type { Viewport } from 'ver/Viewport';

import { SensorCamera } from 'engine/SensorCamera.js';
import { Joystick } from 'engine/scenes/gui/Joystick.js';
import { GridMap } from 'engine/scenes/gui/GridMap.js';
import { Control } from 'engine/scenes/Control.js';
import { Node2D } from 'engine/scenes/Node2D.js';
import { Camera2D } from 'engine/scenes/Camera2D.js';
import { SystemInfo } from 'engine/scenes/gui/SystemInfo.js';
import { Sprite } from 'engine/scenes/Sprite.js';
import { Cat, cat_anims } from './Cat.js';

import { touches, viewport } from 'src/canvas.js';
import { anims } from '../scene.js';
import { audioContorller } from '../state.js';


class Info extends Node2D {
	public self!: MainScene;
	protected async _init(): Promise<void> { this.draw_distance = Math.INF; }
	protected _ready(): void { this.zIndex = 10000; }

	protected _draw({ ctx }: Viewport): void {
		const center = Vector2.ZERO;
		const a = 30;

		ctx.beginPath();
		ctx.globalAlpha = 0.2;
		ctx.strokeStyle = '#ffff00';
		ctx.moveTo(center.x, center.y-a);
		ctx.lineTo(center.x, center.y+a);
		ctx.moveTo(center.x-a, center.y);
		ctx.lineTo(center.x+a, center.y);
		ctx.stroke();
	}
}


export class MainScene extends Control {
	protected static async _load(scene: typeof this): Promise<void> {
		await Promise.all([
			Sprite.load(),
			super._load(scene)
		]);
	}

	public TREE() { return {
		Camera2D,
		GridMap,
		SystemInfo,
		Info,
		Joystick,
		Cat
	}}
	// aliases
	public get $camera() { return this.get('Camera2D'); }
	public get $gridMap() { return this.get('GridMap'); }
	public get $info() { return this.get('Info'); }
	public get $cat() { return this.get('Cat'); }
	public get $joystick() { return this.get('Joystick'); }

	private sensor_camera = new SensorCamera();

	protected async _init(this: MainScene): Promise<void> {
		await super._init();

		this.$camera.viewport = viewport;
		this.$camera.current = true;
		this.$camera.on('PreProcess', dt => {
			this.$camera.position.moveTime(this.$cat.position.buf().add(0, -this.$camera.size.y/2 + 50), 5);

			// this.sensor_camera.update(dt, touches, this.$camera);

			this.$gridMap.scroll.set(this.$camera.position);
			this.$gridMap.position.set(this.$camera.position);
			this.$gridMap.scale.set(this.$camera.scale);
			this.$gridMap.size.set(this.$camera.size);
		});

		this.$gridMap.tile.set(30, 30);

		this.$info.self = this;

		await audioContorller.load('click', 'assets/audio/play.wav');


		const cat = this.$cat;


		// this.on('input:press', () => {
		// 	current_anim = 'running';
		// 	anims.run(cat_anims.up, cat, 50)
		// 	.then(() => anims.run(cat_anims.running, cat))
		// 	.then(() => anims.run(cat_anims.sit, cat, 50));
		//
		// 	delay(3000, () => {
		// 		current_anim = 'sit';
		// 	});
		//
		// 	// audioContorller.play('click');
		// });


		cat.state.on(next => {
			if(next === 'running') {
				anims.del(cat_anims.sit);
				cat.current_anim = 'running';
				anims.run(cat_anims.running, cat);
				return;
			}
			if(next === 'idle') {
				anims.del(cat_anims.running);
				cat.current_anim = 'sit';
				anims.run(cat_anims.sit, cat, 50);
				return;
			}
		});


		viewport.on('resize', size => {
			const s = size.buf().div(2);

			this.$joystick.position.set(-(s.x - 100), s.y - 100);
		}).call(viewport, viewport.size);
	}

	protected _ready(this: MainScene): void {
		this.processPriority = 1000;

		this.$camera.addChild(this.removeChild(this.$joystick.name, true));
	}

	protected _process(this: MainScene, dt: number): void {
		const cat = this.$cat;
		const joystick = this.$joystick;

		let speed = 0.2;

		if(!joystick.value) cat.state('idle');
		else {
			cat.state('running');
			const dir = Math.sign(Math.cos(joystick.angle));
			if(dir > 0) cat.invertX = true;
			if(dir < 0) cat.invertX = false;
			cat.velosity.add(speed * joystick.value * dir, 0);
		}
	}
}
