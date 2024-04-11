import { EventAsFunction } from 'ver/events';
import { MainLoop } from 'ver/MainLoop';
import { Viewport } from 'ver/Viewport';
import { CanvasLayers } from 'ver/CanvasLayers';
import { TouchesController } from 'ver/TouchesController';


export interface IBoundingRect {
	x: number, y: number, width: number, height: number,
	left: number, right: number, top: number, bottom: number
}
const virtualKeyboard = (navigator as any).virtualKeyboard;
export const virtualKeyboard_geometrychange = new EventAsFunction<null, [boundingRect: IBoundingRect]>(null);

if(virtualKeyboard) {
	virtualKeyboard.overlaysContent = true;
	virtualKeyboard.addEventListener('geometrychange', () => {
		virtualKeyboard_geometrychange(virtualKeyboard.boundingRect.toJSON());
	});
}

export const mainloop = new MainLoop();
export const canvas = new CanvasLayers().init(document.querySelector('#canvas')!);
export const viewport = new Viewport(canvas.create('main').canvas.getContext('2d')!);
canvas.on('resize', size => viewport.size.set(size), 1000);

const GUIElement = document.querySelector<HTMLDivElement>('#GUI')!;
export const touches = new TouchesController(GUIElement, e => e.currentTarget === GUIElement);
