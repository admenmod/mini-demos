import type { FunctionComponent as FC } from 'preact';
import { useEffect } from 'preact/hooks';
import { NAME } from './index.js';

import { codeShell } from 'ver/codeShell';
import { tag } from 'ver/helpers';


const env = {
	t: (str: TemplateStringsArray, ...args: any[]): string => {
		for(let i = 0; i < args.length; i++) {
			const arg = args[i];
			if(typeof arg === 'number') args[i] = String.fromCodePoint(arg);
		}

		return tag.str(str, ...args);
	}
};

export const GUI: FC = () => {
	useEffect(() => void (document.title = NAME), []);


	let input: HTMLTextAreaElement | null = null;
	let output: HTMLTextAreaElement | null = null;

	return <div theme-custom class='GUI' style={{
		alignSelf: 'start',
		justifySelf: 'center'
	}}>

		<textarea ref={$ => input = $}
			onBlur={({ currentTarget: { value } }) => console.log(value.codePointAt(0), value.length, value.split(''))}
			onInput={() => output!.value = codeShell<() => string>(`return t\`${input!.value}\`;`, env).call(null)}
		></textarea>

		<textarea ref={$ => output = $} onKeyUp={e => {
			if(e.ctrlKey && e.key === 'Enter') navigator.clipboard.writeText(output!.value);
		}}></textarea>

		<div style={{
			margin: '10px',
			fontSize: '15px',
			fontWeight: 'bold'
		}}>{ NAME }</div>
	</div>
}
