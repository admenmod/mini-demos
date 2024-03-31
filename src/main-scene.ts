import { Vector2 } from 'ver/Vector2';
import { Event, EventDispatcher } from 'ver/events';
import { Animation } from 'ver/Animation';
import type { Touch } from 'ver/TouchesController';

import * as ANIM from './animations.js';
import { mainloop, render, touches, viewport } from './canvas.js';


const anims = new class extends EventDispatcher {
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
mainloop.on('update', dt => { for(const anim of anims.anims) anim.tick(dt); }, 10);

const t = new Vector2();
const rect_pos = new Vector2().set(viewport.size.buf().div(2));

let touch: Touch | null = null;

render.on(({ ctx }) => {
	if(touch = touches.findTouch() || touch) {
		const b = viewport.transformFromScreenToViewport(touch.b.buf());
		const pos = viewport.transformFromScreenToViewport(touch.pos.buf());

		if(touch.isPress()) {
			rect_pos.set(pos);
			anims.run(ANIM.moveTime, viewport.size, t.set());
		}

		ctx.beginPath();
		ctx.strokeStyle = '#eeeeee';
		ctx.moveTo(b.x, b.y);
		ctx.lineTo(pos.x, pos.y);
		ctx.stroke();

		if(touch.isUp()) touch = null;
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
