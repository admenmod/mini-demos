import type { FunctionComponent as FC } from 'preact';

import { Vector2 } from 'ver/Vector2';
import { math as Math, regexp } from 'ver/helpers';
import { codeShell } from 'ver/codeShell';

import { selectImage, resetTranform, configNewImage, saveImage } from '../state.js';


export let input: HTMLInputElement | null = null;
export let inputSize: HTMLInputElement | null = null;

export const ImageConverter: FC = () => {
	return <>
		<input ref={$ => input = $} type='file' accept='image/*'
		style={{ display: 'none' }}
		onChange={e => selectImage(e.currentTarget.files![0])} />

		<input ref={$ => inputSize = $} inputmode='search' onKeyUp={e => {
			if(e.key !== 'Enter') return;

			const code = e.currentTarget.value;

			const data = code.match(regexp`(.+)x(.+):(.+);(.+)`());

			if(!data || data.length !== 5) {
				console.error('invalid code');
				e.currentTarget.value = 'invalid code';
				return;
			}

			const x = codeShell<() => number>(`return (${data[1].trim()})`, { ...Math }).call(null);
			const y = codeShell<() => number>(`return (${data[2].trim()})`, { ...Math }).call(null);
			const s = codeShell<() => number>(`return (${data[3].trim()})`, { ...Math }).call(null);
			const f = codeShell<() => string>(`return (${data[4].trim()})`, { ...Math }).call(null);

			configNewImage(new Vector2().set(x, y), s, f);
		}} />

		<button onClick={() => resetTranform()}>Reset</button>
		<button onClick={() => saveImage()}>Save</button>
	</>
};
