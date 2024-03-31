import type { FunctionComponent as FC } from 'preact';
import { useEffect } from 'preact/hooks';
import { NAME } from './index.js';


export const GUI: FC = () => {
	useEffect(() => void (document.title = NAME), []);

	return <div theme-custom class='GUI' style={{
		alignSelf: 'start', 
		justifySelf: 'start'
	}}>
		<div style={{
			margin: '10px',
			fontSize: '15px',
			fontWeight: 'bold'
		}}>{ NAME }</div>
	</div>
}
