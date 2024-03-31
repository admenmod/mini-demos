import { render } from 'preact';
import { GUI } from './GUI.js';
import './canvas.js';
import './style.css';

const app = document.querySelector<HTMLDivElement>('#app')!;
//@ts-ignore
app.ondblclick = e => (e.currentTarget as HTMLDivElement).webkitRequestFullscreen();

render(<GUI />, document.querySelector<HTMLDivElement>('#GUI')!);
