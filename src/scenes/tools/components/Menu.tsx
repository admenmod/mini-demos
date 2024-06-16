import type { FunctionComponent as FC } from 'preact';
import { $toolId } from '../state.js';


const buttonStyle = {
	padding: '5px 15px',
	minWidth: '20vw',
	fontSize: '15px',
	fontFamily: 'arkhip, monospace'
} satisfies Partial<CSSStyleDeclaration>;


export const Menu: FC = () => {
	return <>
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
			<button style={buttonStyle} onClick={() => $toolId.set('StringBuilder')}>String builder</button>
			<button style={buttonStyle} onClick={() => $toolId.set('ImageConverter')}>Image converter</button>
		</div>
	</>
};
