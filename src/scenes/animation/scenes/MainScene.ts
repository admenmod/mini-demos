import { Vector2 } from 'ver/Vector2';
import { State } from 'ver/State';
import { math as Math } from 'ver/helpers';
import { Animation } from 'ver/Animation';
import type { Viewport } from 'ver/Viewport';

import { SensorCamera } from 'engine/SensorCamera.js';
import { Node2D } from 'engine/scenes/Node2D.js';
import { Control } from 'engine/scenes/Control.js';
import { Sprite } from 'engine/scenes/Sprite.js';
import { Camera2D } from 'engine/scenes/Camera2D.js';
import { Button } from 'engine/scenes/gui/Button.js';
import { Joystick } from 'engine/scenes/gui/Joystick.js';
import { GridMap } from 'engine/scenes/gui/GridMap.js';
import { SystemInfo } from 'engine/scenes/gui/SystemInfo.js';
import { Ship } from './Ship.js';
import { BulletContainer } from './Bullets.js';

import { touches, viewport } from 'src/canvas.js';
import { audioContorller } from '../state.js';
import { c } from 'src/animations.js';


const marks: { pos: Vector2, alpha: number }[] = [];
const addMark = (pos: Vector2) => { marks.push({ pos, alpha: 1 }); }
const marks_anim = new Animation(function* () {
	yield 0; while(true) { yield 50;
		for(const mark of marks) {
			mark.alpha = Math.clamp(0, mark.alpha-0.1, 1);
		}

		for(const mark of marks) {
			if(mark.alpha <= 0) {
				const l = marks.indexOf(mark);
				if(!~l) throw new Error('delete mark');
				marks.splice(l, 1);
				break;
			}
		}
	}
});


class Info extends Node2D {
	public self!: MainScene;
	protected override async _init(): Promise<void> { this.draw_distance = Math.INF; }
	protected override _ready(): void { this.zIndex = 1000; }

	protected override _draw({ ctx }: Viewport): void {
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


		ctx.resetTransform();
		viewport.scalePixelRatio();


		ctx.save();
		for(const { pos, alpha } of marks) {
			ctx.globalAlpha = alpha;
			ctx.fillStyle = '#eeaaaa';
			ctx.beginPath();
			ctx.arc(pos.x, pos.y, 5, 0, Math.TAU);
			ctx.closePath();
			ctx.fill();
		}
		ctx.restore();
	}
}


export class MainScene extends Control {
	protected static override async _load(scene: typeof this): Promise<void> {
		await Sprite.load();
		await super._load(scene);

		await audioContorller.load('shot', 'assets/audio/lazer-shot.mp3');
	}

	public override TREE() { return {
		Camera2D,
		GridMap,
		BulletContainer,
		Ship,
		Joystick,
		FireButton: Button,
		Info,
		SystemInfo
	}}
	// aliases
	public get $camera() { return this.get('Camera2D'); }
	public get $gridMap() { return this.get('GridMap'); }
	public get $info() { return this.get('Info'); }
	public get $joystick() { return this.get('Joystick'); }
	public get $btnfire() { return this.get('FireButton'); }
	public get $ship() { return this.get('Ship'); }
	public get $bullets() { return this.get('BulletContainer'); }

	public sensor_camera = new SensorCamera();

	public fireCD = 500;
	public fire_delay = 100;
	public is_fire = new State(false);

	public fire_s = function* (self: MainScene) {
		yield* c(c => {
			self.$ship.$flare.alpha = c;
		}, self.fire_delay/2, 50);

		yield* c(c => {
			self.$ship.$flare.alpha = 1-c;
		}, self.fire_delay/2, 50);
	}

	public shot_anim = new Animation(function* (self: MainScene) {
		yield 0; while(self.is_fire.last) {
			audioContorller.play('shot');

			yield* self.fire_s(self);

			self.$bullets.c.create({
				id: Math.randomInt(1e6, 1e7-1).toString(),
				position: self.$ship.position.new(),
				velocity: self.$ship.velocity.new().moveAngle(10, self.$ship.rotation - Math.PI/2),
				rotation: self.$ship.rotation,
				angular_velocity: self.$ship.angular_velocity
			});
		yield self.fireCD; }
	});

	protected override async _init(this: MainScene): Promise<void> {
		await super._init();

		this.$camera.viewport = viewport;
		this.$camera.current = true;

		this.$camera.on('PreProcess', dt => {
			this.$camera.position.moveTime(this.$ship.position, 5);
			// this.$camera.rotation += Math.mod(this.$ship.rotation-this.$camera.rotation, -Math.PI, Math.PI) / 5;

			if(!this.$joystick.touch) this.sensor_camera.update(dt, touches, this.$camera);

			this.$gridMap.scroll.set(this.$camera.position);
			this.$gridMap.position.set(this.$camera.position);
			this.$gridMap.size.set(this.$camera.size.new().inc(this.$camera.scale)).inc(5);
		});

		this.$gridMap.tile.set(100, 100);

		this.$info.self = this;


		viewport.on('resize', size => {
			const s = size.new().div(2);

			this.$joystick.position.set(-(s.x - 100), s.y - 100);

			this.$btnfire.size.set(size.new().div(5));
			this.$btnfire.position.set(+(s.x - 100), s.y - 100);
		}).call(viewport, viewport.size);


		this.is_fire.on(value => {
			if(value) this.shot_anim.run(this);
		});
	}

	protected override _ready(this: MainScene): void {
		this.$camera.addChild(this.removeChild(this.$joystick.name, true));
		this.$camera.addChild(this.removeChild(this.$btnfire.name, true));

		this.$btnfire.text = 'FIRE';

		this.$btnfire.on('pressed', () => this.is_fire(true));
		this.$btnfire.on('up', () => this.is_fire(false));

		marks_anim.run();
	}

	protected override _process(this: MainScene, dt: number): void {
		marks_anim.tick(dt);
		this.shot_anim.tick(dt);

		for(const touch of touches.touches) {
			if(touch.isPress() || touch.isUp() || touch.isMove()) {
				const pos = viewport.transformToLocal(touch.pos.new()).add(viewport.size.new().div(2));
				addMark(pos);
			}
		}

		const ship = this.$ship;
		const joystick = this.$joystick;


		const speed = 0.2;
		const angular_speed = 0.005;

		if(!joystick.value) ship.state('idle');
		else {
			ship.state('running');

			const dir = Math.mod(joystick.angle - ship.rotation + Math.PI/2, -Math.PI, Math.PI);
			ship.angular_velocity += angular_speed*2 * Math.sign(dir);

			ship.velocity.moveAngle(dt/16 * speed * joystick.value * Math.max(0, Math.cos(dir)), ship.rotation - Math.PI/2);
		}
	}
}
