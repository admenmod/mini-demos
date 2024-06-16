import { Vector2 } from 'ver/Vector2';
import { Animation } from 'ver/Animation';
import type { Viewport } from 'ver/Viewport';


export const resetTranformAnim = new Animation(function* (viewport: Viewport, target: Viewport) {
	yield 0; while(
		viewport.position.getDistance(target.position) > 0.5
		|| viewport.scale.getDistance(target.scale) > 0.02
	) { yield 10;
		viewport.position.moveTime(target.position, 7);
		viewport.scale.moveTime(target.scale, 9);
	}

	viewport.position.set(target.position);
	viewport.scale.set(target.scale);
});
