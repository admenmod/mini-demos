import { Vector2 } from 'ver/Vector2';
import { FunctionIsEvent } from 'ver/events';
import { math as Math } from 'ver/helpers';
import { Animation } from 'ver/Animation';
import { Loader } from 'ver/Loader';

import { Node2D } from 'engine/scenes/Node2D.js';
import { Sprite } from 'engine/scenes/Sprite.js';

import shipz from 'src/water_units.json';


export const animations = {
	shoot: function* (ship: Ship, fix_pos: Vector2, diff: number) {
		const gun = ship.$gun;
		gun.position.set(fix_pos.buf().moveAngle(diff, gun.rotation - Math.PI));

		yield 0; while(gun.position.getDistance(fix_pos) > 1) { yield 10;
			gun.position.moveTime(fix_pos, 10);
		}
	},
	water_opasity: function* (ship: Ship) {
		yield 0; while(true) { yield 100;
			const module = ship.velosity.module;

			ship.$water.alpha = Math.clamped(0.5, module/2, 1);
			ship.water_blur = Math.clamped(0, 1/(module/10)-2, 10);
		}
	},
	running: function* (ship: Ship) {
		let index: 0 | 1 | 2 | 3 | 4 = 0;

		yield 0; while(ship.current_state === 'running') { yield 500;
			index = (index + 1) % 5 as 0 | 1 | 2 | 3 | 4;
			ship.$water.frame = shipz.frames[`water_ripple_small_00${index}.png`].frame;
		}
	}
};


type state = 'idle' | 'running';

export class Ship extends Node2D {
	public static atlas: Image;
	protected static async _load(scene: typeof this): Promise<void> {
		await super._load(scene);
		this.atlas = await Loader.instance().loadImage(`assets/shipz/${shipz.meta.image}`);
	}

	public TREE() { return {
		Water: Sprite,
		Body: Sprite,
		Gun: Sprite
	}}
	public get $water() { return this.get('Water'); }
	public get $body() { return this.get('Body'); }
	public get $gun() { return this.get('Gun'); }


	public prev_state: state = 'idle';
	public current_state: state = 'idle';

	public state: FunctionIsEvent<null, [next: state, prev: state], (value: state) => unknown> =
	new FunctionIsEvent(null, value => {
		if(value === this.prev_state) return;

		this.prev_state = this.current_state;
		this.current_state = value;

		this.state.emit(this.current_state, this.prev_state);
	});


	public velosity = new Vector2();
	public angular_velosity: number = 0;

	public shoot_anim = new Animation(animations.shoot);
	public water_anim = new Animation(animations.running);
	public water_opasity_anim = new Animation(animations.water_opasity);

	public water_blur = 0;

	protected async _init(this: Ship): Promise<void> {
		this.$water.image = Ship.atlas;
		this.$water.frame = shipz.frames['water_ripple_small_000.png'].frame;

		this.$body.image = Ship.atlas;
		this.$body.frame = shipz.frames['ship_small_body.png'].frame;

		this.$gun.image = Ship.atlas;
		this.$gun.frame = shipz.frames['ship_gun_gray.png'].frame;

		this.$water.position.x -= 15;
		this.$water.offset_angle = this.$body.offset_angle = Math.PI/2;
		this.$gun.offset_angle = -Math.PI/2;

		this.state.on(value => {
			if(value === 'running') this.water_anim.reset().run(this);
			else if(value === 'idle') this.water_anim.reset();
		});

		this.water_opasity_anim.run(this);

		this.$water.on('PreRender', ({ ctx }) => ctx.filter = `blur(${this.water_blur}px)`);
	}

	public gun_target: Vector2 | null = null;
	public shoot(target: Vector2) {
		this.gun_target = target;
		this.shoot_anim.reset().run(this, new Vector2(0, 0), 5);
	}

	protected _process(dt: number): void {
		this.shoot_anim.tick(dt);
		this.water_anim.tick(dt * this.velosity.module);
		this.water_opasity_anim.tick(dt);

		this.velosity.inc(0.97);
		this.position.add(this.velosity);

		this.angular_velosity *= 0.9;
		this.rotation += this.angular_velosity * this.velosity.module / 5;

		if(this.gun_target) {
			const angle = this.position.getAngleRelative(this.gun_target);
			this.$gun.rotation = angle - this.rotation;
		}
	}
}
