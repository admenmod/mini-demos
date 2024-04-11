import { Vector2 } from 'ver/Vector2';
import { State } from 'ver/State';
import { math as Math } from 'ver/helpers';
import { Animation } from 'ver/Animation';
import type { Viewport } from 'ver/Viewport';

import { ShapeRect } from 'engine/scenes/CollisionShape.js';
import { PhysicsItem } from 'engine/scenes/PhysicsItem.js';


export class Box extends PhysicsItem {
	declare public shape: ShapeRect;

	public color = `rgb(50, ${Math.randomInt(100, 255)}, ${Math.randomInt(100, 255)})`;

	public size = new Vector2(0, 0, vec => {
		this.draw_distance = vec.module;
		this.shape.size.set(vec);
	});

	protected async _init(this: Box): Promise<void> {
		this.type_body = 'dynamic';
		this.shape = new ShapeRect(new Vector2(0, 0));
		this.size.set(200, 100);
	}

	protected _draw(viewport: Viewport): void {
		const { ctx } = viewport;

		ctx.globalAlpha = 1;
		ctx.fillStyle = this.color;
		ctx.fillRect(-this.shape.size.x/2, -this.shape.size.y/2, this.shape.size.x, this.shape.size.y);

		ctx.save();
		ctx.resetTransform();
		viewport.scalePixelRatio();
		viewport.use();
		ctx.globalAlpha = 0.5;

		const aabb = this.getAABB();
		const pos = aabb.min.new();
		const size = aabb.size();

		// ctx.globalAlpha = 0.3;
		// ctx.fillStyle = this.color;
		// ctx.fillRect(pos.x, pos.y, size.x, size.y);

		ctx.globalAlpha = 1;
		ctx.strokeStyle = this.color;
		ctx.strokeRect(pos.x, pos.y, size.x, size.y);
		ctx.restore();
	}
}
