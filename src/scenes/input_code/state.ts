import { NAME } from './index.js';
import { atom } from 'nanostores';

import { EventAsFunction, FunctionIsEvent } from 'ver/events';
import type { Viewport } from 'ver/Viewport';

import { Value } from 'engine/Value.js';
import { AudioContorller } from 'engine/AudioController.js';
import { canvas, mainloop, touches, viewport } from 'src/canvas.js';
import { CodeEditor } from 'engine/CodeEditor.js';


export interface IInput {
	name: Value<string>;
	value: Value<string>;
	dep: Value<string>[];
}

type priValues<T extends Record<string, any>> = { [K in keyof T]: T[K] extends Value<infer R, any> ? R : T[K]; };

export const $inputs = atom<IInput[]>([]);

export const $addInput: FunctionIsEvent<null, [input: IInput], (input: priValues<IInput>) => void> =
new FunctionIsEvent(null, input => {
	const new_input: IInput = {
		name: new Value(input.name),
		value: new Value(input.value),
		dep: input.dep
	};
	$inputs.set([...$inputs.get(), new_input]);
	$addInput.emit(new_input);
});


export const editor = new CodeEditor();


export const audioContorller = new AudioContorller();

export const process = new EventAsFunction<null, [dt: number]>(null);
export const render = new EventAsFunction<null, [viewport: Viewport]>(null);

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
