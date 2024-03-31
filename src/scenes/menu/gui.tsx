import type { FunctionComponent as FC } from 'preact';
import { $start } from 'src/state.js';


const buttonStyle = {
	padding: '5px 50px',
	fontSize: '15px',
	fontFamily: 'arkhip, monospace'
} satisfies Partial<CSSStyleDeclaration>;

export const GUI: FC = () => {
	return <div theme-custom class='GUI' style={{
		display: 'grid',
		gap: '10px'
	}}>
		<button style={buttonStyle} onClick={() => $start('Mini')}>mini</button>
		<button style={buttonStyle} onClick={() => $start('Maps')}>maps</button>
	</div>
}
