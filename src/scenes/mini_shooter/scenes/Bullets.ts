import { Vector2 } from 'ver/Vector2';
import { math as Math } from 'ver/helpers';
import type { Viewport } from 'ver/Viewport';

import { Container } from 'engine/modules/Container.js';
import { Node2D } from 'engine/scenes/Node2D.js';
import { PhysicsItem } from 'engine/scenes/PhysicsItem.js';
import { ShapeCircle } from 'engine/scenes/CollisionShape.js';


export const MAX_BULLET_DAMAGE = 10000;
export const MAX_BULLET_RECOVERY = -10000;


export class Bullet extends PhysicsItem {
	public id!: string;
	public shooterID!: string;

	public life_timer: number = 30000;
	public radius: number = 2;


	public _damage: number = 10;
	public get damage() { return this._damage; }
	public set damage(v) { this._damage = Math.clamp(MAX_BULLET_RECOVERY, v, MAX_BULLET_DAMAGE); }


	protected override async _init(): Promise<void> {
		await super._init();

		this.type_body = 'dynamic';

		this.density = 0.1;
		this.restitution = 0.9;
		this.shape = new ShapeCircle(this.radius);
	}

	protected override _draw({ ctx }: Viewport): void {
		ctx.fillStyle = '#aa7777';
		ctx.beginPath();
		ctx.arc(0, 0, this.radius, 0, Math.TAU);
		ctx.fill();
	}
}

export class BulletContainer extends Node2D {
	protected static override async _load(scene: typeof this): Promise<void> {
		await super._load(scene);
		await Bullet.load();
	}


	public c = new Container<typeof Bullet, {
		id: string;
		position: Vector2,
		velocity: Vector2,
		rotation: number,
		angular_velocity: number
	}>(Bullet, 30, async (item, data) => {
		this.c.assign(item, data);

		item.id = data.id;
		item.name = `Bullet${data.id}`;
		item.rotation = data.rotation;
		item.position.set(data.position);
		item.velocity.set(data.velocity);

		if(item.isInited) return;

		item.init().then(() => this.addChild(item));
	});


	protected override _process(dt: number): void {
		for(const item of this.c.items) {
			item.life_timer -= dt;
			if(item.life_timer <= 0) this.c.delete(item.id);

			item.process(dt);
		}
	}

	protected override _render(viewport: Viewport): void {
		for(const item of this.c.items) item.render(viewport);
	}
}
