import { Vector2 } from 'ver/Vector2';
import { FunctionIsEvent } from 'ver/events';
import { Animation } from 'ver/Animation';
import { Loader } from 'ver/Loader';

import { Node2D } from 'engine/scenes/Node2D.js';
import { Sprite } from 'engine/scenes/Sprite.js';

import shipz from 'src/water_units.json';


export const animations = {
	water_opasity: function* (ship: Ship) {
		yield 0; while(true) { yield 100;
			ship.$water.alpha = ship.velosity.module/3;
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
		Body: Sprite
	}}
	public get $water() { return this.get('Water'); }
	public get $body() { return this.get('Body'); }


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

	public water_anim = new Animation(animations.running);
	public water_opasity_anim = new Animation(animations.water_opasity);

	protected async _init(): Promise<void> {
		this.$body.image = Ship.atlas;
		this.$body.frame = shipz.frames['ship_small_body.png'].frame;

		this.$water.image = Ship.atlas;
		this.$water.frame = shipz.frames['water_ripple_small_000.png'].frame;


		this.state.on(value => {
			if(value === 'running') this.water_anim.reset().run(this);
			else if(value === 'idle') this.water_anim.reset();
		});

		this.water_opasity_anim.run(this);


		// this.scale.set(0.5);

		this.$water.offset_angle = this.$body.offset_angle = Math.PI/2;

		this.$water.position.x -= 15;
	}

	protected _process(dt: number): void {
		this.water_anim.tick(dt * this.velosity.module);
		this.water_opasity_anim.tick(dt);

		this.velosity.inc(0.97);
		this.position.add(this.velosity);

		this.angular_velosity *= 0.9;
		this.rotation += this.angular_velosity * this.velosity.module / 5;
	}
}
