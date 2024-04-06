import { render } from 'preact';
import { atom } from 'nanostores';
import { FunctionIsEvent } from 'ver/events';

import * as Menu from './scenes/menu/index.js';
import * as Mini from './scenes/mini/index.js';
import * as Maps from './scenes/maps/index.js';


export type scene_name = keyof typeof scenes;
export const scenes = { Menu, Mini, Maps } as const;

export const $selected_scene_name = atom<scene_name>('Menu');

$selected_scene_name.listen((value, prev) => {
	$stop.emit(prev);
	$start.emit(value);
});

export const $start: FunctionIsEvent<null, [name: scene_name], (name: scene_name) => unknown> =
new FunctionIsEvent(null, name => {
	const GUI = scenes[name].GUI;
	render(<GUI />, document.querySelector<HTMLDivElement>('#GUI')!);
	$selected_scene_name.set(name);
});

export const $stop: FunctionIsEvent<null, [name: scene_name], (name: scene_name) => unknown> =
new FunctionIsEvent(null, name => $stop.emit(name));


$stop.on(name => scenes[name].exit());
$start.on(name => scenes[name].init());
