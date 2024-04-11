import { Vector2 } from 'ver/Vector2';
import { Event, EventDispatcher } from 'ver/events';
import { math as Math, delay } from 'ver/helpers';
import { Animation } from 'ver/Animation';

import { touches, viewport } from 'src/canvas.js';
import { init, process, render } from './state.js';

import { main_anim } from './animations/index.js';


init.on(() => void main_anim.run());

process.on(dt => main_anim.tick(dt));


export const anims = new class extends EventDispatcher {
	public anims: Animation<any>[] = [];

	public async run<const Args extends any[]>(gen: Animation.Generator<Args>, ...args: Args): Promise<Animation<Args>> {
		const anim = new Animation(gen);
		this.anims.push(anim);

		await anim.run(...args);
		this.del(gen);

		return anim;
	}
	public del<T extends any[]>(gen: Animation.Generator<T>): void {
		const l = this.anims.findIndex(it => it.generator === gen);
		if(!~l) return;
		this.anims.splice(l, 1);
	}
}

process.on(dt => { for(const anim of anims.anims) anim.tick(dt); }, -1000);
