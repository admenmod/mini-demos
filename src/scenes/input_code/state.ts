import { NAME } from './index.js';
import { map } from 'nanostores';

import { Vector2 } from 'ver/Vector2';
import { EventAsFunction, FunctionIsEvent } from 'ver/events';
import type { Viewport } from 'ver/Viewport';

import { AudioContorller } from 'engine/AudioController.js';
import { canvas, mainloop, touches, viewport } from 'src/canvas.js';


export const $screen = map(new Vector2());

viewport.on('resize', size => {
	$screen.setKey(0, size[0]);
	$screen.setKey(1, size[1]);
}).call(viewport, viewport.size);


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
