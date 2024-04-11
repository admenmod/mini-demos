import { NAME } from './index.js';
import type { FunctionComponent as FC } from 'preact';
import { useEffect } from 'preact/hooks';
import { useStore } from '@nanostores/preact';
import { $is_fullscreen } from 'src/state.js';

import { $screen } from './state.js';


export const GUI: FC = () => {
	useEffect(() => void (document.title = NAME), []);


	const screen = useStore($screen);
	const is_fullscreen = useStore($is_fullscreen);

	return <div theme-custom class='GUI' style={{
		alignSelf: 'start', 
		justifySelf: 'center'
	}}>
		<div style={{
			margin: '10px',
			fontSize: '15px',
			fontWeight: 'bold'
		}}>{ NAME } x: { screen.x }, y: { screen.y }</div>
	</div>
}
