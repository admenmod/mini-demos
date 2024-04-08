import type { FunctionComponent as FC } from 'preact';
import { useStore } from '@nanostores/preact';
import { $is_fullscreen, $start } from 'src/state.js';


const buttonStyle = {
	padding: '5px 50px',
	fontSize: '15px',
	fontFamily: 'arkhip, monospace'
} satisfies Partial<CSSStyleDeclaration>;


export const GUI: FC = () => {
	const is_fullscreen = useStore($is_fullscreen);

	return <>
		<div theme-custom class='GUI' style={{
			display: 'grid',
			gap: '10px',
			width: 'max-content',

			alignSelf: 'center',
			justifySelf: 'center',
			gridArea: '1/1/1/1'
		}}>
			<button style={buttonStyle} onClick={() => $start('Mini')}>Mini</button>
			<button style={buttonStyle} onClick={() => $start('Cats')}>Cats</button>
			<button style={buttonStyle} onClick={() => $start('Shipz')}>Shipz</button>
		</div>

		{ !is_fullscreen ? <div theme-custom class='GUI' style={{
			margin: '5px',
			opacity: 0.5,
			fontFamily: 'arkhip, monospace',

			alignSelf: 'end',
			gridArea: '1/1/1/1'
		}}>Двойной клик - полноэкранный режим</div> : '' }
	</>
}
