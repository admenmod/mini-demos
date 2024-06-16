import { Node } from 'engine/scenes/Node.js';
import { ProcessSystem } from 'engine/scenes/Node.js';
import { RenderSystem } from 'engine/scenes/CanvasItem.js';
import { ControllersSystem } from 'engine/scenes/Control.js';
import { PhysicsSystem } from 'engine/scenes/PhysicsItem.js';

import { AnimationManager } from 'src/animations.js';
import { canvas, touches, viewport } from 'src/canvas.js';
import { exit, init, process, render } from './state.js';

import { NAME } from './index.js';
import { MainScene } from './scenes/MainScene.js';


init.on(() => {
	canvas.on('resize', size => viewport.size.set(size), 1000, NAME)
	.call(canvas, canvas.size, canvas.pixelRatio);
});
exit.on(() => canvas.off('resize', NAME));


export const processSystem = new ProcessSystem();
export const renderSystem = new RenderSystem();
export const controllersSystem = new ControllersSystem(touches, viewport);
export const physicsSystem = new PhysicsSystem();

process.on(dt => {
	controllersSystem.update(dt);
	processSystem.update(dt);
	physicsSystem.update(dt);
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
	physicsSystem.addRoot(root_node);

	await MainScene.load();
	const main_scene = new MainScene();
	await main_scene.init();

	root_node.addChild(main_scene);
});


export const anims = new AnimationManager();

process.on(dt => { for(const anim of anims.anims) anim.tick(dt); }, -1000);
