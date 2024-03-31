import type { FunctionComponent as FC } from 'preact';
import { useEffect, useState } from 'preact/hooks';

import { mainloop } from './canvas.js';


export const GUI: FC = () => {
	const [isStart, setIsStart] = useState(false);

	if(!isStart) {
		return <div theme-custom onClick={() => {
			mainloop.start();
			setIsStart(true);
		}}>
			<button>mini</button>
		</div>
	}


	return <div theme-custom></div>;
};
