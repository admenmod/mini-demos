import { Vector2 } from 'ver/Vector2';
import { State } from 'ver/State';
import { math as Math, delay } from 'ver/helpers';
import { codeShell } from 'ver/codeShell';
import { Animation } from 'ver/Animation';
import type { Viewport } from 'ver/Viewport';

import { Value } from 'engine/Value.js';

import { SensorCamera } from 'engine/SensorCamera.js';
import { GridMap } from 'engine/scenes/gui/GridMap.js';
import { Control } from 'engine/scenes/Control.js';
import { Node2D } from 'engine/scenes/Node2D.js';
import { Camera2D } from 'engine/scenes/Camera2D.js';
import { SystemInfo } from 'engine/scenes/gui/SystemInfo.js';
import { Sprite } from 'engine/scenes/Sprite.js';
import { CodeEditorView } from './CodeEditorView.js';

import { touches, viewport } from 'src/canvas.js';
import { audioContorller, editor } from '../state.js';
import { c } from 'src/animations.js';


class Info extends Node2D {
	protected override async _init(): Promise<void> { this.draw_distance = Math.INF; }
	protected override _ready(): void { this.zIndex = 10000; }

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
	}
}


class AlertText extends Node2D {
	public text: string = this.SCENE_TYPE;
	public color: string = '#eeaaaa';
	public background: string = '#22222280';
	public fontSize: number = 25;
	public fontFamily: string = 'arkhip';
	public padding = new Vector2(30, 15);

	protected _exit: boolean = false;

	public state = new State(false);

	public opasity_anim = new Animation(function* (o: AlertText, time = 1000, gap = 1000) {
		const m = (c: number) => c;

		let f = true;

		yield gap; while(true) {
			if(f) {
				yield* c(c => {
					o.alpha = 1-c;
				}, time/2, 20, m);

				if(o._exit) {
					o._exit = false;
					break;
				}
			} else {
				yield* c(c => {
					o.alpha = c;
				}, time/2, 20, m);

				yield gap;
			}

			f = !f;
		}
	});

	public async show(text: string, time: number): Promise<void> {
		if(this.state(true)) {
			this.text = text;
			await delay(time, () => this._exit = true);
		}
	}
	public async hide(): Promise<void> { this.state(false); }

	protected override async _init(): Promise<void> {
		this.zIndex = 100;

		this.visible = false;

		this.opasity_anim.on('run', () => this.visible = true);
		this.opasity_anim.on('end', () => this.state(false));
		this.opasity_anim.on('reset', () => this.visible = false);

		this.state.on(value => value ? this.opasity_anim.run(this) : this.opasity_anim.reset());
	}

	protected override _process(dt: number): void {
		this.opasity_anim.tick(dt);
	}

	protected override _draw(viewport: Viewport): void {
		const { ctx, size } = viewport;

		ctx.save();
		ctx.resetTransform();
		viewport.scalePixelRatio();
		ctx.translate(size.x/2, size.y/2);

		ctx.textRendering = 'geometricPrecision';
		ctx.textAlign = 'center';
		ctx.textBaseline = 'middle';
		ctx.font = `${this.fontSize}px ${this.fontFamily}`;

		const { width } = ctx.measureText(this.text);

		ctx.filter = 'blur(10px)';
		ctx.fillStyle = this.background;
		ctx.fillRect(
			-width/2-this.padding.x,
			-this.fontSize/2 - this.padding.y,
			width+this.padding.x*2,
			this.fontSize+this.padding.y*2
		);

		ctx.filter = 'blur(0)';
		ctx.fillStyle = this.color;
		ctx.fillText(this.text, 0, 0);
		ctx.restore();
	}
}


export class MainScene extends Control {
	protected static override async _load(scene: typeof this): Promise<void> {
		await super._load(scene);
		await Sprite.load();

		await audioContorller.load('click', 'assets/audio/play.wav');
	}

	public override TREE() { return {
		Camera2D,
		GridMap,
		SystemInfo,
		Info,
		AlertText,
		CodeEditorView
	}}
	// aliases
	public get $camera() { return this.get('Camera2D'); }
	public get $gridMap() { return this.get('GridMap'); }
	public get $info() { return this.get('Info'); }
	public get $alert() { return this.get('AlertText'); }

	public sensor_camera = new SensorCamera();

	protected override async _init(this: MainScene): Promise<void> {
		this.get('CodeEditorView').editor = editor;

		await super._init();


		this.$camera.current = true;
		this.$camera.viewport = viewport;

		this.$camera.on('PreProcess', dt => {
			this.sensor_camera.update(dt, touches, this.$camera);

			this.$gridMap.scroll.set(this.$camera.position);
			this.$gridMap.position.set(this.$camera.position);
			this.$gridMap.size.set(this.$camera.size.new().inc(this.$camera.scale));
		});

		this.$gridMap.tile.set(100, 100);


		viewport.on('resize', size => {
			const s = size.new().div(2);
			s;
		}).call(viewport, viewport.size);
	}

	protected override _ready(this: MainScene): void {
		editor.setText(
`let a = 9;
const wjj = 'dkk';`
		);
		this.on('input:click', () => {
			editor.focus();
		});
	}

	protected override _process(this: MainScene, dt: number): void {
		let touch = touches.findTouch(t => t.isdblClick());
		if(touch) {
			const pos = viewport.transformFromScreenToViewport(touch.pos.new());

			const text = `Alert`;

			this.$alert.show(text, 3000);
		}
	}
}
