import { Vector2 } from 'ver/Vector2';
import type { Viewport } from 'ver/Viewport';
import { PhysicsItem, ShapeRect } from 'engine/scenes/PhysicsItem.js';


export class Platform extends PhysicsItem {
	declare shape: ShapeRect;
	public size: Vector2 = new Vector2(1, 1, vec => (this.draw_distance = this.shape.size.set(this.size).module, vec));

	constructor() {
		super();

		this.type_body = 'static';
		this.shape = new ShapeRect(new Vector2(1, 1));
	}

	protected override _draw({ ctx }: Viewport): void {
		const size = this.size;

		ctx.fillStyle = '#337733';
		ctx.fillRect(-size.x/2, -size.y/2, size.x, size.y);
	}
}
