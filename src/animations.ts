import type { Vector2 } from 'ver/Vector2';


export const moveTime = function* (target: Vector2, value: Vector2) {
	yield 0; while(value.getDistance(target) > 1) { value.moveTime(target, 10); yield 10; }
};
