import { Vector2 } from 'ver/Vector2';
import { EventAsFunction, FunctionIsEvent } from 'ver/events';
import type { Viewport } from 'ver/Viewport';

import { atom } from 'nanostores';
import { canvas, mainloop, touches, viewport } from 'src/canvas.js';
import { NAME } from './index.js';


export interface ITastMapData {
	name: string;
	position: Vector2;
}


export const dataset: ITastMapData[] = [{
	name: 'Место 1',
	position: new Vector2(2, 4)
}, {
	name: 'Место 2',
	position: new Vector2(292, 42)
}];


export const $selected_data = atom<ITastMapData | void>();
$selected_data.listen(value => $selectData.emit(value));

export const $selectData: FunctionIsEvent<null, [value: ITastMapData | void], (value: ITastMapData | void) => unknown> =
new FunctionIsEvent(null, value => $selected_data.set(value));


export const $camera_target = atom<Vector2 | void>();
$camera_target.listen(value => $followTarget.emit(value));

export const $followTarget: FunctionIsEvent<null, [pos: Readonly<Vector2> | void], (pos: Vector2 | void) => unknown> =
new FunctionIsEvent(null, pos => $camera_target.set(pos));


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

	mainloop.start();
};

export const stop = () => {
	mainloop.stop();

	mainloop.off('update', NAME);
};
