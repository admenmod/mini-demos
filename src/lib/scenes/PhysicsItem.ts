import { Vector2 } from 'ver/Vector2';
import { Event } from 'ver/events';
import { math as Math } from 'ver/helpers';
import { System } from 'ver/System';
import { Node2D } from './Node2D.js';


const deleteFromArray = (arr: any[], o: any) => {
	const l = arr.indexOf(o);
	if(!~l) return;
	return arr.splice(l, 1)[0];
};

type UID = string;
const generateUID = (): UID => `${Math.randomInt(0, 1e16)+1}`.padStart(16, '0');


interface Contact {
	a: PhysicsItem;
	b: PhysicsItem;
}
interface Manifold {}
interface ContactImpulse {}


export class ShapeBase {
	public readonly type = 'ShapeBase' as string;
	constructor(public offset: Vector2, public bulk: number) {}
}

export class ShapeCircle extends ShapeBase {
	public readonly type = 'ShapeCircle';
	public mass: number;

	constructor(
		offset: Vector2,
		bulk: number,
		public radius: number
	) {
		super(offset, bulk);

		this.mass = radius ** 2 * Math.PI;
	}
}

export class ShapeRect extends ShapeBase {
	public readonly type = 'ShapeRect';
	public mass: number;

	constructor(
		offset: Vector2,
		bulk: number,
		public size: Vector2
	) {
		super(offset, bulk);

		this.mass = size.x * size.y;
	}
}


type Shape = ShapeRect | ShapeCircle;


export class PhysicsSystem extends System<typeof PhysicsItem> {
	public '@BeginContact' = new Event<PhysicsSystem, [Contact]>(this);
	public '@EndContact' = new Event<PhysicsSystem, [Contact]>(this);
	public '@PostSolve' = new Event<PhysicsSystem, [Contact, ContactImpulse]>(this);
	public '@PreSolve' = new Event<PhysicsSystem, [Contact, Manifold]>(this);

	public '@end' = new Event<PhysicsSystem, []>(this);

	public items: PhysicsItem[] = [];

	constructor(public gravity = new Vector2()) {
		super(PhysicsItem);

		this['@add'].on(item => this.createItem(item));
		this['@removing'].on(item => this.destroyItem(item));


		const PREORITY = -100;

		this['@BeginContact'].on(c => {
			for(let i = 0; i < this._items.length; i++) this._items[i]['@BeginContact'].emit(c);
		}, PREORITY);
		this['@EndContact'].on(c => {
			for(let i = 0; i < this._items.length; i++) this._items[i]['@EndContact'].emit(c);
		}, PREORITY);
		this['@PostSolve'].on((c, ci) => {
			for(let i = 0; i < this._items.length; i++) this._items[i]['@PostSolve'].emit(c, ci);
		}, PREORITY);
		this['@PreSolve'].on((c, m) => {
			for(let i = 0; i < this._items.length; i++) this._items[i]['@PreSolve'].emit(c, m);
		}, PREORITY);
	}

	public createItem<T extends PhysicsItem>(item: T): T {
		this.items.push(item);
		item['@Physics:init'].emit();
		return item;
	}

	public destroyItem<T extends PhysicsItem>(item: T): T {
		const l = this.items.indexOf(item);
		if(!~l) throw new Error('item not fined');

		item['@Physics:destroy'].emit();
		this.items.splice(l, 1);

		item['@Physics:destroyed'].emit();

		return item;
	}


	public rect_rect(a: PhysicsItem, b: PhysicsItem): boolean {
		if(a.shape.type !== 'ShapeRect' || b.shape.type !== 'ShapeRect') throw new Error('invalid params');

		const apos = a.position, bpos = b.position;
		const asize = a.shape.size.buf().inc(a.globalScale), bsize = b.shape.size.buf().inc(b.globalScale);

		if(apos.y > bpos.y - (bsize.y/2 + asize.y/2)) {
			if(a.type_body === 'dynamic') {
				apos.y = bpos.y - (bsize.y/2 + asize.y/2);

				const force = new Vector2(1, -1).inc(1, b.restitution);
				a.velosity.inc(force);
			}
			if(b.type_body === 'dynamic') {
				const force = new Vector2(1, -1).inc(1, b.restitution);
				b.velosity.inc(force);
			}
		}

		return false;
	}

	public circle_circle(a: PhysicsItem, b: PhysicsItem): boolean {
		if(a.shape.type !== 'ShapeCircle' || b.shape.type !== 'ShapeCircle') throw new Error('invalid params');

		let diff = a.position.getDistance(b.position) - (a.shape.radius + b.shape.radius);
		if(diff < 0) {
			diff = Math.abs(diff);
			if(a.shape.mass > b.shape.mass) [a, b] = [b, a];
			const c = b.shape.mass/a.shape.mass;
			a.position.moveAngle(diff - diff/c, b.position.getAngleRelative(a.position));
			b.position.moveAngle(diff/c, a.position.getAngleRelative(b.position));

			return true;
		}

		return false;
	}

	public circle_rect(a: PhysicsItem, b: PhysicsItem): boolean {
		if(a.shape.type !== 'ShapeCircle' || b.shape.type !== 'ShapeRect') throw new Error('invalid params');

		const p = new Vector2(
			Math.max(b.position.x-b.shape.size.x/2, Math.min(a.position.x, b.position.x+b.shape.size.x/2)),
			Math.max(b.position.y-b.shape.size.y/2, Math.min(a.position.y, b.position.y+b.shape.size.y/2))
		);

		if(a.position.getDistance(p) < a.shape.radius) {
			if(Math.abs(b.position.x-a.position.x) > Math.abs(b.position.y-a.position.y)) {
				if(a.position.x < b.position.x) a.position.x += (b.position.x - b.shape.size.x/2) - (a.position.x+a.shape.radius);
				else a.position.x += (b.position.x + b.shape.size.x/2) - (a.position.x-a.shape.radius);
			} else {
				if(a.position.y < b.position.y) a.position.y += (b.position.y - b.shape.size.y/2) - (a.position.y+a.shape.radius);
				else a.position.y += (b.position.y + b.shape.size.y/2) - (a.position.y-a.shape.radius);
			}

			return true;
		}

		return false;
	}


	public step(dt: number): void {
		for(let i = 0; i < this.items.length; i++) {
			const item = this.items[i];

			if(item.type_body === 'dynamic') {
				item.velosity.add(this.gravity);
				item.velosity.inc(0.95);
				item.position.add(item.velosity);
			}
		}

		for(let i = 0; i < this.items.length; i++) {
			const a = this.items[i];
			for(let j = i+1; j < this.items.length; j++) {
				const b = this.items[j];

				if(a.shape.type === 'ShapeRect' && b.shape.type === 'ShapeRect') {
					this.rect_rect(a, b);
				} else if(a.shape.type === 'ShapeCircle' && b.shape.type === 'ShapeCircle') {
					this.circle_circle(a, b);
				} else if(a.shape.type === 'ShapeCircle' && b.shape.type === 'ShapeRect') {
					this.circle_rect(a, b);
				} else if(a.shape.type === 'ShapeRect' && b.shape.type === 'ShapeCircle') {
					this.circle_rect(b, a);
				}
			}
		}
	}

	public clearForces(): void {}

	public update(dt: number) {
		this.step(dt);
		this.clearForces();
		this['@end'].emit();
	}
}


const PARENT_CACHE = Symbol('PARENT_CACHE');

export class PhysicsItem extends Node2D {
	protected [PARENT_CACHE]: PhysicsItem[] = [];

	public '@Physics:init' = new Event<PhysicsItem, []>(this);
	public '@Physics:destroy' = new Event<PhysicsItem, []>(this);
	public '@Physics:destroyed' = new Event<PhysicsItem, []>(this);

	public '@BeginContact' = new Event<PhysicsItem, [Contact]>(this);
	public '@EndContact' = new Event<PhysicsItem, [Contact]>(this);
	public '@PostSolve' = new Event<PhysicsItem, [Contact, ContactImpulse]>(this);
	public '@PreSolve' = new Event<PhysicsItem, [Contact, Manifold]>(this);


	public velosity = new Vector2();
	public rotation_velocity: number = 0;

	public density = 1;
	public friction = 0.2;
	public restitution = 0.2;

	public shape!: Shape;
	public type_body: 'dynamic' | 'static' = 'static';

	constructor() {
		super();

		const ontree = () => {
			this[PARENT_CACHE].length = 0;
			this[PARENT_CACHE].push(...this.getChainParentsOf(PhysicsItem));
		};

		this['@tree_entered'].on(ontree);
		this['@tree_exiting'].on(ontree);
	}

	protected async _init(): Promise<void> {
		await super._init();

		this.density = 1;
		this.friction = 0.2;
		this.restitution = 0.2;

		this.shape = this.shape || new ShapeRect(new Vector2(), 1, new Vector2(1, 1));
	}
}
