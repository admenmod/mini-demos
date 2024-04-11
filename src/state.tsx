import { render } from 'preact';
import { atom } from 'nanostores';
import { FunctionIsEvent } from 'ver/events';

import * as Menu from './scenes/menu/index.js';
import * as Mini from './scenes/mini/index.js';
import * as Cats from './scenes/cats/index.js';
import * as Shipz from './scenes/shipz/index.js';
import * as Targets_captured from './scenes/targets_captured/index.js';
import * as Animation from './scenes/animation/index.js';
import * as Test from './scenes/test/index.js';
import * as Input_code from './scenes/input_code/index.js';


export const $is_fullscreen = atom(false);
setInterval(() => $is_fullscreen.set(Boolean(document.fullscreenElement)), 3000);

const app = document.querySelector<HTMLDivElement>('#app')!;
//@ts-ignore
app.ondblclick = e => (e.currentTarget as HTMLDivElement).webkitRequestFullscreen();


export type scene_name = keyof typeof scenes;
export const scenes = { Menu, Mini, Cats, Shipz, Targets_captured, Animation, Test, Input_code } as const;

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
