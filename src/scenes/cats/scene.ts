import { Vector2 } from 'ver/Vector2';
import { Event, EventDispatcher } from 'ver/events';
import { math as Math, loadImage } from 'ver/helpers';
import { Animation } from 'ver/Animation';

import { Node } from 'engine/scenes/Node.js';
import { ProcessSystem } from 'engine/scenes/Node.js';
import { RenderSystem } from 'engine/scenes/CanvasItem.js';
import { ControllersSystem } from 'engine/scenes/Control.js';

import { touches, viewport } from 'src/canvas.js';
import { init, process, render } from './state.js';

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
