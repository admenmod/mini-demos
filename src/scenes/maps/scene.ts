import { Vector2 } from 'ver/Vector2';
import { Event, EventDispatcher } from 'ver/events';
import { math as Math, loadImage } from 'ver/helpers';
import { Animation } from 'ver/Animation';
import type { Touch } from 'ver/TouchesController';

import { Node } from 'engine/scenes/Node.js';
import { ProcessSystem } from 'engine/scenes/Node.js';
import { RenderSystem } from 'engine/scenes/CanvasItem.js';
import { ControllersSystem } from 'engine/scenes/Control.js';

import * as ANIM from 'src/animations.js';
import { touches, viewport } from 'src/canvas.js';
import { $selectData, init, process, render } from './state.js';

import { MainScene } from './scenes/MainScene.js';


export const processSystem = new ProcessSystem();
export const renderSystem = new RenderSystem();
export const controllersSystem = new ControllersSystem(touches, viewport);

process.on(dt => {
	controllersSystem.update(dt);
	processSystem.update(dt);
});

render.on(viewport => {
	renderSystem.update(viewport);
});


init.on(async () => {
	await Node.load();
	const root_node = new Node();
	await root_node.init();

	processSystem.addRoot(root_node);
	renderSystem.addRoot(root_node);
	controllersSystem.addRoot(root_node);

	await MainScene.load();
	const main_scene = new MainScene();
	await main_scene.init();

	root_node.addChild(main_scene);
});


export const anims = new class extends EventDispatcher {
	public anims: Animation<any>[] = [];

	public async run<const Args extends any[]>(gen: Animation.Generator<Args>, ...args: Args): Promise<Animation<Args>> {
		const anim = new Animation(gen);
		this.anims.push(anim);

		await anim.run(...args);
		this.del(gen);

		return anim;
	}
	public del<T extends any[]>(gen: Animation.Generator<T>): void {
		const l = this.anims.findIndex(it => it.generator === gen);
		if(!~l) return;
		this.anims.splice(l, 1);
	}
}

process.on(dt => { for(const anim of anims.anims) anim.tick(dt); }, -1000);


const t = new Vector2();
const rect_pos = new Vector2().set(viewport.size.buf().div(2));

let touch: Touch | null = null;
let current_item = 0;

render.on(({ ctx }) => {
	ctx.save();
	viewport.use();

	if(touch = touches.findTouch() || touch) {
		if(touch.isPress()) {
			current_item += 1;
			current_item %= arr.length;

			$selectData({
				name: (current_item + 1).toString(),
				position: arr[current_item].movement!.position.buf()
			});

			rect_pos.set(viewport.transformFromScreenToViewport(touch.pos.buf()));
			anims.run(ANIM.moveTime, viewport.size, t.set());

			arr.forEach(({ movement }) => movement!.effect = v => v.buf().div(10));
		}

		const b = arr[current_item].movement!.position.buf();
		const pos = arr[current_item].movement!.position.buf().add(touch.d);

		if(touch.isUp()) {
			arr.forEach(({ movement }) => movement!.effect = null);

			arr[current_item].movement?.velosity.add(touch.d.buf().div(100));
			touch = null;
		}


		ctx.beginPath();
		ctx.strokeStyle = '#eeeeee';
		ctx.moveTo(b.x, b.y);
		ctx.lineTo(pos.x, pos.y);
		ctx.stroke();
	}

	ctx.font = `${20}px monospace`;
	ctx.textAlign = 'center';
	ctx.textBaseline = 'middle';

	const size = t.buf().div(4);
	const m = size.module;
	ctx.setLineDash([m/100*4, m/100, m/100*4]);
	ctx.strokeStyle = '#eeeeee';
	ctx.strokeRect(rect_pos.x -size.x/2, rect_pos.y -size.y/2, size.x, size.y);

	ctx.restore();
});


interface IMovement {
	position: Vector2;
	velosity: Vector2;
	rotation: number;
	effect: ((velosity: Vector2) => Vector2) | null;
}

interface IItem {
	movement?: IMovement;
}


const GRAVITY = 0.01;

const $movement = {
	D: 0.97 as const,

	is(item: IItem): item is { movement: IMovement } { return 'movement' in item; },

	setup(v = Vector2.ZERO): IMovement { return {
		position: new Vector2().set(v),
		velosity: new Vector2().set(v),
		effect: null,
		rotation: 0
	}},

	update(dt: number, { movement }: { movement: IMovement }) {
		movement.velosity.add(0, GRAVITY).buf();
		movement.position.add((movement.effect?.(movement.velosity) || movement.velosity.inc(this.D)).buf().inc(dt));
	}
};


const arr: IItem[] = [{
	movement: $movement.setup()
}, {
	movement: $movement.setup()
}];


process.on(dt => {
	for(const item of arr) {
		if($movement.is(item)) {
			$movement.update(dt, item);

			const { position, velosity } = item.movement;
			const screen = viewport.scale.buf().inc(viewport.size).sub(6);
			const pos = viewport.position.buf();

			if(position.x < pos.x + -screen.x/2) {
				position.x = pos.x + -screen.x/2;
				velosity.x *= -1;
			}
			if(position.x > pos.x + screen.x/2) {
				position.x = pos.x + screen.x/2;
				velosity.x *= -1;
			}
			if(position.y < pos.y + -screen.y/2) {
				position.y = pos.y + -screen.y/2;
				velosity.y *= -1;
			}
			if(position.y > pos.y + screen.y/2) {
				position.y = pos.y + screen.y/2;
				velosity.y *= -1;
			}
		}
	}
});

render.on(({ ctx }) => {
	ctx.save();
	viewport.use();

	for(const item of arr) {
		if(!$movement.is(item)) continue;

		const { position } = item.movement;

		ctx.beginPath();
		ctx.fillStyle = '#ee9292';
		ctx.arc(position.x, position.y, 3, 0, Math.TAU);
		ctx.fill();
		ctx.closePath();
	}

	ctx.restore();
});
