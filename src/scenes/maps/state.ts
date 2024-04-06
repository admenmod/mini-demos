import { Vector2 } from 'ver/Vector2';
import { EventAsFunction, FunctionIsEvent } from 'ver/events';
import type { Viewport } from 'ver/Viewport';

import { AudioContorller } from 'engine/AudioController.js';

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
