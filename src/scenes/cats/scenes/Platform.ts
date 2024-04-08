import { Vector2 } from 'ver/Vector2';
import type { Viewport } from 'ver/Viewport';
import { PhysicsItem, ShapeRect } from 'engine/scenes/PhysicsItem.js';


export class Platform extends PhysicsItem {
	declare shape: ShapeRect;
	public size: Vector2 = new Vector2(1, 1, () => this.draw_distance = this.shape.size.set(this.size).module);

	constructor() {
		super();

		this.type_body = 'static';
		this.shape = new ShapeRect(new Vector2(), 1, new Vector2(1, 1));
	}

	protected _draw({ ctx }: Viewport): void {
		const size = this.size;

		ctx.fillRect(-size.x/2, -size.y/2, size.x, size.y);
	}
}
