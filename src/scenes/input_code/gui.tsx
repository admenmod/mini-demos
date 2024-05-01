import { NAME } from './index.js';
import type { FunctionComponent as FC } from 'preact';
import { useEffect } from 'preact/hooks';
import { useStore } from '@nanostores/preact';
import { $addInput, $inputs } from './state.js';
import { $connected, addenv, buildTask, execute } from 'src/socket.js';


addenv('inputs', { $inputs });

const log_hello = buildTask('inputs', (arg: string) => console.log($inputs, arg));


export const GUI: FC = () => {
	useEffect(() => void (document.title = NAME), []);
	const connected = useStore($connected);

	const inputs = useStore($inputs);


	return <>
		{ connected ? <input theme-custom class='GUI' inputmode='search' style={{}} onKeyPress={e => {
			if(e.key === 'Enter') log_hello(e.currentTarget.value);
		}} /> : ''}

		<div theme-custom class='GUI' style={{
			margin: '10px',
			fontSize: '15px',
			fontWeight: 'bold',
			textAlign: 'center',

			alignSelf: 'start', 
			justifySelf: 'center'
		}}><div>{ NAME }</div></div>

		<div class='GUI' style={{
			margin: '10px',
			fontSize: '15px',
			fontWeight: 'bold',

			alignSelf: 'center', 
			justifySelf: 'center'
		}}></div>

		<div class='GUI' style={{
			margin: '10px',
			fontSize: '15px',
			fontWeight: 'bold',

			alignSelf: 'start', 
			justifySelf: 'end'
		}}>
			{ inputs.map(it => <div>
				<span>{ it.name }</span>: <input inputmode='search'
					value={it.value.value} onInput={e => it.value.value = e.currentTarget.value} />
				<br />
			</div>) }
		</div>
	</>
}
