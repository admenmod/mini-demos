import { Vector2 } from 'ver/Vector2';
import { FunctionIsEvent } from 'ver/events';
import { Sprite } from 'engine/scenes/Sprite.js';
import { PhysicsItem, ShapeRect } from 'engine/scenes/PhysicsItem.js';


const w = 400, h = 199;

export const cat_frames = {
	move: Array(12).fill(0).map((_, i) => [w*0, h*i, w, h]),
	sit: Array(6).fill(0).map((_, i) => [w*1, h*i, w, h]),
	join_speend_move: Array(12).fill(0).map((_, i) => [w*2, h*i, w, h]),
	speed_move: Array(13).fill(0).map((_, i) => [w*3, h*i, w, h])
} satisfies Record<string, [x: number, y: number, w: number, h: number][]>;

export const cat_anims = {
	move: function* (sprite: Sprite, time: number) {
		const frames = cat_frames.move;

		yield 0; for(let i = 0; i < frames.length; i++) { yield time;
			sprite.frame = frames[i];
		}
	},
	sit: function* (sprite: Sprite, time: number) {
		const frames = cat_frames.sit;

		yield 0; for(let i = 0; i < frames.length; i++) { yield time;
			sprite.frame = frames[i];
		}
	},
	up: function* (sprite: Sprite, time: number) {
		const frames = cat_frames.sit;

		yield 0; for(let i = frames.length-1; i >= 0; i--) { yield time;
			sprite.frame = frames[i];
		}
	},
	speed_move: function* (sprite: Sprite, time: number) {
		const frames = cat_frames.speed_move;

		yield 0; for(let i = 0; i < frames.length; i++) { yield time;
			sprite.frame = frames[i];
		}
	},
	start_speend_move: function* (sprite: Sprite, time: number) {
		const frames = cat_frames.join_speend_move;

		yield 0; for(let i = 0; i < frames.length; i++) { yield time;
			sprite.frame = frames[i];
		}
	},
	end_speend_move: function* (sprite: Sprite, time: number) {
		const frames = cat_frames.join_speend_move;

		yield 0; for(let i = frames.length-1; i >= 0; i--) { yield time;
			sprite.frame = frames[i];
		}
	},
	running: function* (sprite: Sprite) {
		yield* cat_anims.start_speend_move(sprite, 50);

		yield 0; while(true) {
			yield* cat_anims.speed_move(sprite, 50);
		}

		// yield* cat_anims.end_speend_move(cat, 50);
	}
};

type state = 'idle' | 'running';

export class Cat extends PhysicsItem {
	public TREE() { return { Sprite }}
	// aliases
	public get $sprite() { return this.get('Sprite'); }


	public current_anim: keyof typeof cat_anims | '' = '';

	public prev_state: state = 'idle';
	public current_state: state = 'idle';

	public state: FunctionIsEvent<null, [next: state, prev: state], (value: state) => unknown> =
	new FunctionIsEvent(null, value => {
		if(value === this.prev_state) return;

		this.prev_state = this.current_state;
		this.current_state = value;

		this.state.emit(this.current_state, this.prev_state);
	});

	declare shape: ShapeRect;
	public size: Vector2 = new Vector2(1, 1, () => this.draw_distance = this.shape.size.set(this.size).module);

	protected async _init(): Promise<void> {
		await super._init();

		this.type_body = 'dynamic';
		this.shape = new ShapeRect(new Vector2(), 1, new Vector2(1, 1));


		await this.$sprite.load('assets/anim/cat-black.png');
		this.$sprite.frame = cat_frames.sit[5];

		this.$sprite.scale.set(0.3);
		this.size.set(this.$sprite.size).inc(0.3);
	}
}
