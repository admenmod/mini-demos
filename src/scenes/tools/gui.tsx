import type { FunctionComponent as FC } from 'preact';
import { useEffect } from 'preact/hooks';
import { useStore } from '@nanostores/preact';
import { NAME } from './index.js';

import { $toolId, $currentToolComponent } from './state.js';


export const GUI: FC = () => {
	useEffect(() => void (document.title = `${NAME} - ${toolId}`), []);

	const toolId = useStore($toolId);
	const currentToolComponent = useStore($currentToolComponent);

	const Tool = currentToolComponent;


	return <div theme-custom class='GUI' style={{
		alignSelf: 'start',
		justifySelf: 'center'
	}}>
		<div style={{
			margin: '10px',
			fontSize: '15px',
			fontWeight: 'bold'
		}}>{ `${NAME} - ${toolId}` }</div>

		<Tool />
	</div>
}
