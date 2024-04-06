import { Vector2 } from 'ver/Vector2';
import { math as Math } from 'ver/helpers';
import { Animation } from 'ver/Animation';
import { codeShell } from 'ver/codeShell';
import type { Viewport } from 'ver/Viewport';

import { SensorCamera } from 'engine/SensorCamera.js';
import { GridMap } from 'engine/scenes/gui/GridMap.js';
import { Control } from 'engine/scenes/Control.js';
import { Node2D } from 'engine/scenes/Node2D.js';
import { Camera2D } from 'engine/scenes/Camera2D.js';
import { SystemInfo } from 'engine/scenes/gui/SystemInfo.js';
import { Button } from 'engine/scenes/gui/Button.js';
import { Sprite } from 'engine/scenes/Sprite.js';
import {touches, viewport} from 'src/canvas.js';


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

	public anims: Animation[] = [];
	private sensor_camera = new SensorCamera();

	public TREE() { return {
		Camera2D,
		GridMap,
		SystemInfo,
		Info
	}}

	// aliases
	public get $camera() { return this.get('Camera2D'); }
	public get $gridMap() { return this.get('GridMap'); }
	public get $info() { return this.get('Info'); }

	protected async _init(this: MainScene): Promise<void> {
		await super._init();

		this.$camera.viewport = viewport;
		this.$camera.current = true;
		this.$camera.on('PreProcess', dt => {
			this.sensor_camera.update(dt, touches, this.$camera);

			this.$gridMap.scroll.set(this.$camera.position);
			this.$gridMap.position.set(this.$camera.position);
			this.$gridMap.scale.set(this.$camera.scale);
			this.$gridMap.size.set(this.$camera.size);
		});

		this.$gridMap.size.set(viewport.size.buf().inc(2));
		this.$gridMap.tile.set(30, 30);

		this.$info.self = this;
		viewport.on('resize', size => {
			const s = size.buf().div(2);
		}).call(viewport, viewport.size);
	}

	protected _ready(this: MainScene): void {
		this.processPriority = 1000;
	}

	protected _process(this: MainScene, dt: number): void {

	}
}
