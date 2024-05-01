import { Vector2 } from 'ver/Vector2';
import { Event } from 'ver/events';
import { State } from 'ver/State';
import { math as Math } from 'ver/helpers';
import { Animation } from 'ver/Animation';
import type { Viewport } from 'ver/Viewport';

import { PhysicsItem } from 'engine/scenes/PhysicsItem.js';
import { c } from 'src/animations.js';


export class Ship extends PhysicsItem {
	public '@HP' = new Event<Ship, [last: number, prev: number]>(this);

	private _HP: number = 0;
	public get HP() { return this._HP; }
	public set HP(v) {
		v = Math.clamp(0, v, Math.INF);

		if(this._HP === v) return;

		const prev = this._HP;
		this._HP = v;
		this['@HP'].emit(this._HP, prev);
	}

	public state = new State<'idle' | 'running'>('idle');

	public _alpha_body: number = 1;
	public get alpha_body() { return this._alpha_body }
	public set alpha_body(v) { this._alpha_body = Math.clamp(0, v, 1); }

	public anim = new Animation(function* (self: Ship) {
		yield 0; while(true) {
			const d = 0.7;

			yield* c(c => self.alpha_body = 1 - d*c, 200, 50);     // 1.0 - 0.3
			yield* c(c => self.alpha_body = (1-d) + d*c, 200, 50); // 0.3 - 1.0
		}
	});

	protected override async _init(): Promise<void> {
		this.type_body = 'dynamic';

		this.HP = 100;
	}

	protected override _ready(): void {
		this.anim.run(this);
	}

	protected override _process(dt: number): void {
		this.anim.tick(dt);
	}


	protected override _draw({ ctx }: Viewport): void {
		ctx.strokeStyle = '#eeaa77';
		ctx.beginPath();
		ctx.moveTo(0, -10);
		ctx.lineTo(5, 10);
		ctx.lineTo(-5, 10);
		ctx.closePath();
		ctx.stroke();

		ctx.globalAlpha = this.alpha_body;
		ctx.fillStyle = '#eeaa77';
		ctx.beginPath();
		ctx.moveTo(0, -10);
		ctx.lineTo(5, 10);
		ctx.lineTo(-5, 10);
		ctx.closePath();
		ctx.fill();
	}
}
