import { EventAsFunction } from 'ver/events';
import { MainLoop } from 'ver/MainLoop';
import { Viewport } from 'ver/Viewport';
import { CanvasLayers } from 'ver/CanvasLayers';
import { TouchesController } from 'ver/TouchesController';


const virtualKeyboard = (navigator as any).virtualKeyboard;
export const virtualKeyboard_geometrychange = new EventAsFunction<null, [boundingRect: {
	x: number, y: number, width: number, height: number
}]>(null);

if(virtualKeyboard) {
	virtualKeyboard.overlaysContent = true;
	virtualKeyboard.addEventListener('geometrychange', () => {
		const { x, y, width, height } = virtualKeyboard.boundingRect;
		virtualKeyboard_geometrychange({ x, y, width, height });
	});
}

export const canvas = new CanvasLayers().init(document.querySelector('#canvas')!);
export const mainloop = new MainLoop();
export const viewport = new Viewport(canvas.create('main').canvas.getContext('2d')!);
canvas.on('resize', size => viewport.size.set(size));

const GUIElement = document.querySelector<HTMLDivElement>('#GUI')!;
export const touches = new TouchesController(GUIElement, e => e.currentTarget === GUIElement);


export const process = new EventAsFunction<null, [dt: number]>(null);
export const render = new EventAsFunction<null, [viewport: Viewport]>(null);


mainloop.on('update', dt => {
	process(dt);

	viewport.clear();

	viewport.ctx.save();
	viewport.use();
	render(viewport);
	viewport.ctx.restore();

	canvas.render();

	touches.nullify(dt);
});


import('./main-scene.js');
