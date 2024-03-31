import { Vector2 } from 'ver/Vector2';
import { Event, EventAsFunction, EventDispatcher } from 'ver/events';
import { math as Math } from 'ver/helpers';
import { Animation } from 'ver/Animation';
import type { Touch } from 'ver/TouchesController';

import * as ANIM from 'src/animations.js';
import { touches, viewport } from 'src/canvas.js';
import { process, render } from './index.js';


export const anims = new class extends EventDispatcher {
	public anims: Animation<any>[] = [];

	public async run<const Args extends any[]>(gen: Animation.Generator<Args>, ...args: Args): Promise<Animation<Args>> {
		const anim = new Animation(gen);
		this.anims.push(anim);

		await anim.run(...args);
		this.del(anim);

		return anim;
	}
	public del<T extends any[]>(anim: Animation<T>): Animation<T> {
		const l = this.anims.indexOf(anim);
		if(!~l) return anim;
		this.anims.splice(l, 1);

		return anim;
	}
}

process.on(dt => { for(const anim of anims.anims) anim.tick(dt); }, 10);


const t = new Vector2();
const rect_pos = new Vector2().set(viewport.size.buf().div(2));

let touch: Touch | null = null;
let current_item = 0;

render.on(({ ctx }) => {
	if(touch = touches.findTouch() || touch) {
		if(touch.isPress()) {
			current_item += 1;
			current_item %= arr.length;

			rect_pos.set(viewport.transformFromScreenToViewport(touch.pos.buf()));
			anims.run(ANIM.moveTime, viewport.size, t.set());

			arr.forEach(({ movement }) => movement!.effect = v => v.buf().div(10));
		}

		const b = arr[current_item].movement!.position.buf();
		const pos = arr[current_item].movement!.position.buf().add(touch.d);

		if(touch.isUp()) {
			arr.forEach(({ movement }) => movement!.effect = null);

			arr[current_item].movement?.velosity.add(touch.d.buf().div(100));
			touch = null;
		}


		ctx.beginPath();
		ctx.strokeStyle = '#eeeeee';
		ctx.moveTo(b.x, b.y);
		ctx.lineTo(pos.x, pos.y);
		ctx.stroke();
	}

	ctx.font = `${20}px monospace`;
	ctx.textAlign = 'center';
	ctx.textBaseline = 'middle';

	const size = t.buf().div(4);
	const m = size.module;
	ctx.setLineDash([m/100*4, m/100, m/100*4]);
	ctx.strokeStyle = '#eeeeee';
	ctx.strokeRect(rect_pos.x -size.x/2, rect_pos.y -size.y/2, size.x, size.y);
});


interface IMovement {
	position: Vector2;
	velosity: Vector2;
	rotation: number;
	effect: ((velosity: Vector2) => Vector2) | null;
}

interface IItem {
	movement?: IMovement;
}


const GRAVITY = 0.01;

const $movement = {
	D: 0.97 as const,

	is(item: IItem): item is { movement: IMovement } { return 'movement' in item; },

	setup(v = Vector2.ZERO): IMovement { return {
		position: new Vector2().set(v),
		velosity: new Vector2().set(v),
		effect: null,
		rotation: 0
	}},

	update(dt: number, { movement }: { movement: IMovement }) {
		movement.velosity.add(0, GRAVITY).buf();
		movement.position.add((movement.effect?.(movement.velosity) || movement.velosity.inc(this.D)).buf().inc(dt));
	}
};


const arr: IItem[] = [];

arr.push({
	movement: $movement.setup()
});
arr.push({
	movement: $movement.setup()
});


process.on(dt => {
	for(const item of arr) {
		if($movement.is(item)) {
			$movement.update(dt, item);

			const { position, velosity } = item.movement;
			const screen = viewport.scale.buf().inc(viewport.size);

			if(position.x < -screen.x/2) {
				position.x = -screen.x/2;
				velosity.x *= -1;
			}
			if(position.x > screen.x/2) {
				position.x = screen.x/2;
				velosity.x *= -1;
			}
			if(position.y < -screen.y/2) {
				position.y = -screen.y/2;
				velosity.y *= -1;
			}
			if(position.y > screen.y/2) {
				position.y = screen.y/2;
				velosity.y *= -1;
			}
		}
	}
});

render.on(({ ctx }) => {
	for(const item of arr) {
		if(!$movement.is(item)) continue;

		const { position } = item.movement;

		ctx.beginPath();
		ctx.fillStyle = '#ee9292';
		ctx.arc(position.x, position.y, 3, 0, Math.TAU);
		ctx.fill();
		ctx.closePath();
	}
});
