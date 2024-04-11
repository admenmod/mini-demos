import { Vector2 } from 'ver/Vector2';
import { State } from 'ver/State';
import { Animation } from 'ver/Animation';

import { Sprite } from 'engine/scenes/Sprite.js';
import { PhysicsItem, ShapeRect } from 'engine/scenes/PhysicsItem.js';


const w = 400, h = 199;

export const framelists = {
	move: Array(12).fill(0).map((_, i) => [w*0, h*i, w, h]),
	sit: Array(6).fill(0).map((_, i) => [w*1, h*i, w, h]),
	join_speend_move: Array(12).fill(0).map((_, i) => [w*2, h*i, w, h]),
	speed_move: Array(13).fill(0).map((_, i) => [w*3, h*i, w, h])
} satisfies Record<string, [x: number, y: number, w: number, h: number][]>;

export const animations = {
	move: function* (sprite: Sprite, time: number) {
		const frames = framelists.move;

		for(let i = 0; i < frames.length; i++) { yield time;
			sprite.frame = frames[i];
		}
	},
	sit: function* (sprite: Sprite, time: number) {
		const frames = framelists.sit;

		yield 0; for(let i = 0; i < frames.length; i++) { yield time;
			sprite.frame = frames[i];
		}
	},
	up: function* (sprite: Sprite, time: number) {
		const frames = framelists.sit;

		for(let i = frames.length-1; i >= 0; i--) { yield time;
			sprite.frame = frames[i];
		}
	},
	speed_move: function* (sprite: Sprite, time: number) {
		const frames = framelists.speed_move;

		for(let i = 0; i < frames.length; i++) { yield time;
			sprite.frame = frames[i];
		}
	},
	start_speend_move: function* (sprite: Sprite, time: number) {
		const frames = framelists.join_speend_move;

		for(let i = 0; i < frames.length; i++) { yield time;
			sprite.frame = frames[i];
		}
	},
	end_speend_move: function* (sprite: Sprite, time: number) {
		const frames = framelists.join_speend_move;

		for(let i = frames.length-1; i >= 0; i--) { yield time;
			sprite.frame = frames[i];
		}
	},
	running: function* (sprite: Sprite) {
		while(true) {
			yield* animations.speed_move(sprite, 50);
		}
	}
};


export class Cat extends PhysicsItem {
	public TREE() { return { Sprite }}
	// aliases
	public get $sprite() { return this.get('Sprite'); }


	declare shape: ShapeRect;
	public size: Vector2 = new Vector2(1, 1, vec => (this.draw_distance = this.shape.size.set(this.size).module, vec));


	public state = new State<'idle' | 'running'>('idle');

	public idle_anim = new Animation(function* (sprite: Sprite) {
		yield 0;

		yield* animations.sit(sprite, 50);
	});
	public running_anim = new Animation(function* (sprite: Sprite) {
		yield 0; while(true) yield* animations.speed_move(sprite, 50);
	});

	protected async _init(): Promise<void> {
		await super._init();

		this.type_body = 'dynamic';
		this.shape = new ShapeRect(new Vector2(1, 1));

		await this.$sprite.load('assets/anim/cat-black.png');
		this.$sprite.frame = framelists.sit[5];

		this.$sprite.scale.set(0.3);
		this.size.set(this.$sprite.size).sub(100, 50).inc(0.3);


		this.state.on(next => {
			if(next === 'running') {
				this.idle_anim.reset();
				this.running_anim.reset().run(this.$sprite);
			} else if(next === 'idle') {
				this.running_anim.reset();
				this.idle_anim.reset().run(this.$sprite);
			}
		});
	}

	protected _process(dt: number): void {
		this.idle_anim.tick(dt);
		this.running_anim.tick(dt);
	}
}
