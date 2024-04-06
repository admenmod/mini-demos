import type { FunctionComponent as FC } from 'preact';
import { useEffect, useState } from 'preact/hooks';
import { useStore } from '@nanostores/preact';

import { $followTarget, $selectData, $selected_data, dataset, type ITastMapData } from './state.js';
import { NAME } from './index.js';

export const GUI: FC = () => {
	useEffect(() => void (document.title = NAME), []);

	const selected_data = useStore($selected_data);
	const [searchedList, setSearchedList] = useState<ITastMapData[]>([]);


	return <div theme-custom class='GUI' style={{
		alignSelf: 'start', 
		justifySelf: 'start'
	}}>
		<div style={{
			margin: '10px',
			fontSize: '15px',
			fontWeight: 'bold'
		}}>{ NAME }</div>

		<input inputmode='search' onInput={e => {
			setSearchedList(dataset.filter(it => ~it.name.search(e.currentTarget.value)));
		}} />

		{ searchedList.map(i => <div>
			<div style={{
				margin: '5px 10px',
				padding: '5px 10px',
				background: '#00000080'
			}} onClick={() => {
				$followTarget(i.position);
				$selectData(i);
			}}>{ i.name }</div>
		</div>) }

		{ selected_data ? <div style={{
			alignSelf: 'start',
			justifySelf: 'end',
			padding: '10px 15px',
			maxWidth: '50vw',
			height: '100%',
			fontFamily: 'arkhip',
			background: '#00000080',
		}}>
			<div>Имя: "{ selected_data.name }"</div>
			<div>Позиция: ({ selected_data.position.x.toFixed(0) }, { selected_data.position.y.toFixed(0) })</div>
		</div> : '' }
	</div>
}
