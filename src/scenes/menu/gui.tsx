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
			gridTemplate: 'repeat(4, auto) / repeat(2, auto)',
			gridAutoColumns: 'max-content',
			gridAutoFlow: 'column dense',
			padding: '20px',
			zIndex: 1,

			alignSelf: 'center',
			justifySelf: 'center'
		}}>
			<button style={buttonStyle} onClick={() => $start('Test')}>Test</button>
			<button style={buttonStyle} onClick={() => $start('Mini')}>Mini</button>
			<button style={buttonStyle} onClick={() => $start('Cats')}>Cats</button>
			<button style={buttonStyle} onClick={() => $start('Shipz')}>Shipz</button>
			<button style={buttonStyle} onClick={() => $start('Animation')}>Animation</button>
			<button style={buttonStyle} onClick={() => $start('Input_code')}>Input code</button>
			<button style={buttonStyle} onClick={() => $start('Targets_captured')}>Targets captured</button>
		</div>

		{ !is_fullscreen ? <div theme-custom class='GUI' style={{
			paddingBottom: '5px',
			opacity: 0.5,
			fontSize: '0.7rem',
			fontFamily: 'arkhip, monospace',

			alignSelf: 'end'
		}}>Двойной клик - полноэкранный режим</div> : '' }
	</>
}
