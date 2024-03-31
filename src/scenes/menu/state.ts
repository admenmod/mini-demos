import { atom } from 'nanostores';
import { EventAsFunction } from 'ver/events';
import type { Viewport } from 'ver/Viewport';

import { canvas, mainloop, touches, viewport } from 'src/canvas.js';
import { NAME } from './index.js';


export const process = new EventAsFunction<null, [dt: number]>(null);
export const render = new EventAsFunction<null, [viewport: Viewport]>(null);


export const start = () => {
	mainloop.on('update', dt => {
		process(dt);

		viewport.clear();
		viewport.ctx.save();
		viewport.use();
		render(viewport);
		viewport.ctx.restore();

		canvas.render();

		touches.nullify(dt);
	}, 0, NAME);
};

export const stop = () => {
	mainloop.off('update', NAME);
};
