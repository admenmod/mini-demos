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
import { Ship } from './Ship.js';

import { touches, viewport } from 'src/canvas.js';
import { audioContorller } from '../state.js';


const vec1 = new Vector2(1, 0).normalize(100).set();
const vec2 = new Vector2(1, 0).normalize(100).set();
const vec3 = new Vector2(1, 0).normalize(100).set();


class Info extends Node2D {
	public self!: MainScene;
	protected async _init(): Promise<void> { this.draw_distance = Math.INF; }
	protected _ready(): void { this.zIndex = 10000; }

	protected _draw({ ctx, size }: Viewport): void {
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


		ctx.resetTransform();
		ctx.globalAlpha = 0.5;
		ctx.lineWidth = 5;

		const c = size.buf().div(2);

		const v1 = c.buf().add(vec1);
		ctx.beginPath();
		ctx.strokeStyle = 'red';
		ctx.moveTo(c.x, c.y);
		ctx.lineTo(v1.x, v1.y);
		ctx.stroke();

		const v2 = c.buf().add(vec2);
		ctx.beginPath();
		ctx.strokeStyle = 'green';
		ctx.moveTo(c.x, c.y);
		ctx.lineTo(v2.x, v2.y);
		ctx.stroke();

		const v3 = c.buf().add(vec3);
		ctx.beginPath();
		ctx.strokeStyle = 'blue';
		ctx.moveTo(c.x, c.y);
		ctx.lineTo(v3.x, v3.y);
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
		Ship
	}}
	// aliases
	public get $camera() { return this.get('Camera2D'); }
	public get $gridMap() { return this.get('GridMap'); }
	public get $info() { return this.get('Info'); }
	public get $joystick() { return this.get('Joystick'); }
	public get $ship() { return this.get('Ship'); }

	public sensor_camera = new SensorCamera();

	protected async _init(this: MainScene): Promise<void> {
		await super._init();

		this.$camera.viewport = viewport;
		this.$camera.current = true;
		this.$camera.on('PreProcess', dt => {
			this.$camera.position.moveTime(this.$ship.position.buf(), 5);

			// this.sensor_camera.update(dt, touches, this.$camera);

			this.$gridMap.scroll.set(this.$camera.position);
			this.$gridMap.position.set(this.$camera.position);
			this.$gridMap.scale.set(this.$camera.scale);
			this.$gridMap.size.set(this.$camera.size);
		});

		this.$gridMap.tile.set(100, 100);
		this.$info.self = this;

		await audioContorller.load('click', 'assets/audio/play.wav');


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
		const ship = this.$ship;
		const joystick = this.$joystick;


		let touch = touches.findTouch();
		if(touch && touch.pos.x > viewport.size.x/2) {
			// NOTE: gun shoot
		}


		const speed = 0.2;
		const angular_speed = 0.002;

		if(!joystick.value) ship.state('idle');
		else {
			ship.state('running');

			const dir = Math.mod(joystick.angle - ship.rotation, -Math.PI, Math.PI);
			ship.angular_velosity += angular_speed * dir;

			ship.velosity.moveAngle(dt/16 * speed * joystick.value, ship.rotation);
		}
	}
}
