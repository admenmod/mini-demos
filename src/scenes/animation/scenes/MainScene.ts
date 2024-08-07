import { Vector2 } from 'ver/Vector2';
import { math as Math } from 'ver/helpers';
import { Animation } from 'ver/Animation';
import type { Viewport } from 'ver/Viewport';

import { SensorCamera } from 'engine/SensorCamera.js';
import { Node2D } from 'engine/scenes/Node2D.js';
import { Control } from 'engine/scenes/Control.js';
import { Sprite } from 'engine/scenes/Sprite.js';
import { Camera2D } from 'engine/scenes/Camera2D.js';
import { GridMap } from 'engine/scenes/gui/GridMap.js';
import { SystemInfo } from 'engine/scenes/gui/SystemInfo.js';

import { touches, viewport } from 'src/canvas.js';
import { main } from '../animations/index.js';


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
	}

	public override TREE() { return {
		Camera2D,
		GridMap,
		Info,
		SystemInfo
	}}
	// aliases
	public get $camera() { return this.get('Camera2D'); }
	public get $gridMap() { return this.get('GridMap'); }
	public get $info() { return this.get('Info'); }

	public sensor_camera = new SensorCamera();

	protected override async _init(this: MainScene): Promise<void> {
		await super._init();

		this.$camera.viewport = viewport;
		this.$camera.current = true;

		this.$camera.on('PreProcess', dt => {
			this.sensor_camera.update(dt, touches, this.$camera);

			this.$gridMap.scroll.set(this.$camera.position);
			this.$gridMap.position.set(this.$camera.position);
			this.$gridMap.size.set(this.$camera.size.new().inc(this.$camera.scale)).inc(5);
		});

		this.$gridMap.tile.set(100, 100);

		this.$info.self = this;


		viewport.on('resize', size => {
			const s = size.new().div(2);
			s;
		}).call(viewport, viewport.size);
	}

	protected override _ready(this: MainScene): void {
		marks_anim.run();

		main();
	}

	protected override _process(this: MainScene, dt: number): void {
		marks_anim.tick(dt);

		for(const touch of touches.touches) {
			if(touch.isPress() || touch.isUp() || touch.isMove()) {
				const pos = viewport.transformToLocal(touch.pos.new()).add(viewport.size.new().div(2));
				addMark(pos);
			}
		}
	}
}
