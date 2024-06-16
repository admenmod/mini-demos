import { Vector2 } from 'ver/Vector2';
import { EventAsFunction, FunctionIsEvent } from 'ver/events';
import type { Viewport } from 'ver/Viewport';
import { loadImage } from 'ver/helpers';

import { AudioContorller } from 'engine/AudioController.js';

import { atom } from 'nanostores';
import { canvas, mainloop, touches, viewport } from 'src/canvas.js';
import { NAME } from './index.js';

import { Menu } from './components/Menu.js';
import { StringBuilder } from './components/StringBuilder.js';
import { ImageConverter } from './components/ImageConverter.js';


const tools = { Menu, StringBuilder, ImageConverter };

export const $toolId = atom<keyof typeof tools>('Menu');
export const $currentToolComponent = atom<typeof tools[keyof typeof tools]>(tools[$toolId.get()]);

$toolId.listen(value => $currentToolComponent.set(tools[value]));


export let currentImage: Image | null = null;

export const selectImage: FunctionIsEvent<null, [img: Image, name: string], (file: File) => Promise<void>> =
new FunctionIsEvent(null, async file => {
	const url = URL.createObjectURL(file);
	currentImage = await loadImage(url);
	URL.revokeObjectURL(url);

	selectImage.emit(currentImage, file.name);
});

export const saveImage: FunctionIsEvent<null, [], () => Promise<void>> =
new FunctionIsEvent(null, () => saveImage.emit());

export const resetTranform: FunctionIsEvent<null, [], () => Promise<void>> =
new FunctionIsEvent(null, () => resetTranform.emit());

export const configNewImage: FunctionIsEvent<null, [size: Vector2, scale: number, format: string],
(size: Vector2, scale: number, format: string) => Promise<void>> =
new FunctionIsEvent(null, (size, scale, format) => configNewImage.emit(size, scale, format));


export const process = new EventAsFunction<null, [dt: number]>(null);
export const render = new EventAsFunction<null, [viewport: Viewport]>(null);

export const audioContorller = new AudioContorller();

export const init: FunctionIsEvent<null, [], () => Promise<void>> = new FunctionIsEvent(null, async () => {
	await init.await();

	mainloop.on('update', dt => {
		process(dt);
		render(viewport);
		canvas.render();
		touches.nullify(dt);
	}, 0, NAME);

	mainloop.start();
});
export const exit: FunctionIsEvent<null, [], () => Promise<void>> = new FunctionIsEvent(null, async () => {
	await exit.await();

	mainloop.stop();

	mainloop.off('update', NAME);
});
