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
import { Box } from './Box.js';
import { AABB } from 'engine/scenes/CollisionShape.js';

import { touches, viewport } from 'src/canvas.js';
import { audioContorller } from '../state.js';


const vec1 = new Vector2(1, 0);
const vec2 = new Vector2(1, 0);
const vec3 = new Vector2(1, 0);


let intersectRect = new AABB(new Vector2(), new Vector2());


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
	protected override _ready(): void { this.zIndex = 10000; }

	protected override _draw(viewport: Viewport): void {
		const { ctx, size } = viewport;

		{
		ctx.save();
		ctx.resetTransform();
		viewport.scalePixelRatio();
		viewport.use();
		ctx.globalAlpha = 0.5;

		const pos = intersectRect.min.new();
		// vec1.set(pos);
		const size = intersectRect.size();

		ctx.fillStyle = 'red';
		ctx.fillRect(pos.x, pos.y, size.x, size.y);

		ctx.globalAlpha = 1;
		ctx.strokeStyle = 'red';
		ctx.strokeRect(pos.x, pos.y, size.x, size.y);

		ctx.restore();
		}


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


		ctx.save();
		ctx.resetTransform();
		viewport.scalePixelRatio();
		ctx.globalAlpha = 0.5;
		ctx.lineJoin = 'round';
		ctx.lineCap = 'round';

		const c = size.new().div(2);
		const m = 10;

		const v3 = c.new().add(vec3);
		ctx.lineWidth = 5;
		ctx.beginPath();
		ctx.strokeStyle = 'yellow';
		ctx.moveTo(c.x, c.y);
		ctx.lineTo(v3.x, v3.y);
		ctx.stroke();

		const v1 = c.new().add(vec1);
		ctx.lineWidth = 3;
		ctx.beginPath();
		ctx.strokeStyle = 'red';
		ctx.moveTo(c.x, c.y);
		ctx.lineTo(v1.x, v1.y);
		ctx.stroke();

		const v2 = c.new().add(vec2);
		ctx.beginPath();
		ctx.strokeStyle = 'blue';
		ctx.moveTo(c.x, c.y);
		ctx.lineTo(v2.x, v2.y);
		ctx.stroke();
		ctx.restore();


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
	}

	public override TREE() { return {
		Camera2D,
		GridMap,
		SystemInfo,
		Info,
		Joystick,
		Box1: Box,
		Box2: Box
	}}
	// aliases
	public get $camera() { return this.get('Camera2D'); }
	public get $gridMap() { return this.get('GridMap'); }
	public get $info() { return this.get('Info'); }
	public get $joystick() { return this.get('Joystick'); }
	public get $box1() { return this.get('Box1'); }
	public get $box2() { return this.get('Box2'); }

	public sensor_camera = new SensorCamera();

	protected override async _init(this: MainScene): Promise<void> {
		await super._init();

		this.$camera.viewport = viewport;
		this.$camera.current = true;
		this.$camera.on('PreProcess', dt => {
			// if(!this.$joystick.touch) this.sensor_camera.update(dt, touches, this.$camera);

			this.$gridMap.scroll.set(this.$camera.position);
			this.$gridMap.position.set(this.$camera.position);
			this.$gridMap.size.set(this.$camera.size.new().inc(this.$camera.scale));
		});

		this.$gridMap.tile.set(100, 100);
		this.$info.self = this;

		await audioContorller.load('click', 'assets/audio/play.wav');


		viewport.on('resize', size => {
			const s = size.new().div(2);

			this.$joystick.position.set(-(s.x - 100), s.y - 100);
		}).call(viewport, viewport.size);
	}

	protected override _ready(this: MainScene): void {
		this.$camera.addChild(this.removeChild(this.$joystick.name, true));

		const box1 = this.$box1, box2 = this.$box2;
		box1.position.set(-120, -120);

		box1.on('BeginContact', c => {
			intersectRect = c.areaAABB;
		});

		marks_anim.run();
	}

	protected override _process(this: MainScene, dt: number): void {
		marks_anim.tick(dt);


		const joystick = this.$joystick;
		const box1 = this.$box1, box2 = this.$box2;

		const speed = 0.2;
		box1.velocity.moveAngle(dt/16 * speed * joystick.value, joystick.angle);

		let touch;
		if(touch = touches.findTouch(t => t.isPress() || t.isUp() || t.isMove())) {
			const pos = viewport.transformToLocal(touch.pos.new());
			addMark(pos);
		}
	}
}
