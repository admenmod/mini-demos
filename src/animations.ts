import type { Vector2 } from 'ver/Vector2';
import { Animation } from 'ver/Animation';

const typeing = <const Args extends any[]>(fn: Animation.Generator<Args>) => fn;

export const moveTime = typeing<[target: Vector2, value: Vector2]>(function* (target, value) {
	yield 0; while(value.getDistance(target) > 1) { value.moveTime(target, 10); yield 10; }
});
