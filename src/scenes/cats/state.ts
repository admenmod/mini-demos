import { EventAsFunction, FunctionIsEvent } from 'ver/events';
import type { Viewport } from 'ver/Viewport';

import { AudioContorller } from 'engine/AudioController.js';

import { atom } from 'nanostores';
import { canvas, mainloop, touches, viewport } from 'src/canvas.js';
import { NAME } from './index.js';


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
