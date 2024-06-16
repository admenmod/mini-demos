import { NAME } from './index.js';
import { exit, init } from './state.js';
import { canvas, viewport } from 'src/canvas.js';


init.on(() => {
	canvas.on('resize', size => viewport.size.set(size), 1000, NAME)
	.call(canvas, canvas.size, canvas.pixelRatio);
});
exit.on(() => canvas.off('resize', NAME));
