import './canvas.js';
import './style.css';
import { $start } from './state.js';
import { NAME as NAME_MENU } from './scenes/menu/index.js';

const app = document.querySelector<HTMLDivElement>('#app')!;
//@ts-ignore
app.ondblclick = e => (e.currentTarget as HTMLDivElement).webkitRequestFullscreen();

$start(NAME_MENU);
