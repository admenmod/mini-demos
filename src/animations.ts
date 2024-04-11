import { math as Math } from 'ver/helpers';
import type { Animation } from 'ver/Animation';


export function* repeat(cb: (dt: number) => unknown, count: number, timeout: number) {
	for(let i = 0; i < count; i++) cb(yield timeout);
}

export function* c(cb: (c: number) => unknown, time: number, step: number, m = (c: number) => c): Animation.Iterator {
	let t = 0;

	cb(0);
	while(t < time) {
		cb(Math.clamp(-1, m(t / time), 1));
		t += yield step;
	}
	cb(1);
}
