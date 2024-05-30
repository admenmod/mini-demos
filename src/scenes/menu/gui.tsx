import type { FunctionComponent as FC } from 'preact';
import { useState } from 'preact/hooks';
import { useStore } from '@nanostores/preact';
import { $is_fullscreen, $start } from 'src/state.js';
import { $connected, $connect } from 'src/socket.js';


const buttonStyle = {
	padding: '5px 15px',
	minWidth: '20vw',
	fontSize: '15px',
	fontFamily: 'arkhip, monospace'
} satisfies Partial<CSSStyleDeclaration>;


export const GUI: FC = () => {
	const is_fullscreen = useStore($is_fullscreen);
	const connected = useStore($connected);
	const [connecting, setConnecting] = useState(false);

	return <>
		<div theme-custom class='GUI' style={{
			zIndex: 2,
			padding: '10px 20px',
			textAlign: 'center',
			fontFamily: 'arkhip, monospace',
			background: '#00000020',

			alignSelf: 'start',
			justifySelf: 'end',
			gridArea: '1/1/1/1'
		}} onClick={() => {
			if(!connecting) {
				$connect();
				setConnecting(true);
			}
		}}>
			{ connected ? <div>connected</div> : connecting ? <div>connecting...</div> : <>
				<span style={{ fontSize: '1.2rem' }}>connect</span><br />
				<span style={{ fontSize: '0.7rem' }}>to mini server</span>
			</> }
		</div>

		<div theme-custom class='GUI' style={{
			zIndex: 1,
			display: 'grid',
			gap: '10px',
			alignContent: 'center',
			justifyContent: 'center',
			gridTemplate: 'repeat(4, max-content) / repeat(2, max-content)',
			gridAutoFlow: 'column dense',
			padding: '20px',
			width: '100vw',
			height: '100dvh',
			overflow: 'hidden',

			alignSelf: 'center',
			justifySelf: 'center',
			gridArea: '1/1/1/1'
		}}>
			<button style={buttonStyle} onClick={() => $start('Test')}>Test</button>
			<button style={buttonStyle} onClick={() => $start('Mini')}>Mini</button>
			<button style={buttonStyle} onClick={() => $start('Cats')}>Cats</button>
			<button style={buttonStyle} onClick={() => $start('Shipz')}>Shipz</button>
			<button style={buttonStyle} onClick={() => $start('Animation')}>Animation</button>
			<button style={buttonStyle} onClick={() => $start('Input_code')}>Input code</button>
			<button style={buttonStyle} onClick={() => $start('Targets_captured')}>Targets captured</button>
			<button style={buttonStyle} onClick={() => $start('Mini_shooter')}>mini shooter</button>
		</div>

		{ !is_fullscreen ? <div theme-custom class='GUI' style={{
			paddingBottom: '5px',
			opacity: 0.5,
			fontSize: '0.7rem',
			fontFamily: 'arkhip, monospace',

			alignSelf: 'end',
			gridArea: '1/1/1/1'
		}}>Двойной клик - полноэкранный режим</div> : '' }
	</>
}
