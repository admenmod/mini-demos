import { Vector2, vec2 } from 'ver/Vector2';
import { math as Math, delay } from 'ver/helpers';
import { Animation } from 'ver/Animation';

import { viewport } from 'src/canvas.js';
import { audioContorller } from '../state.js';
import { anims, draws } from '../scene.js';
import { c, pipe } from 'src/animations.js';


const Rect = (pos: Vector2, size: Vector2, color: string) => {
	const o = {
		pos, size, color,
		drop: () => {
			const l = draws.indexOf(draw);
			if(!~l) return;
			draws.splice(l, 1);
		}
	};

	const draw = ({ ctx } = viewport) => {
		ctx.save();
		ctx.beginPath();
		ctx.fillStyle = color;
		ctx.fillRect(o.pos.x, o.pos.y, o.size.x, o.size.y);
		ctx.restore();
	};

	draws.push(draw);

	return o;
};

const Text = (text: string, pos: Vector2, color: string, alpha = 1) => {
	const o = {
		text, pos, color, alpha,
		drop: () => {
			const l = draws.indexOf(draw);
			if(!~l) return;
			draws.splice(l, 1);
		}
	};

	const draw = ({ ctx } = viewport) => {
		ctx.save();
		ctx.beginPath();
		ctx.globalAlpha = o.alpha;
		ctx.textAlign = 'center';
		ctx.textBaseline = 'middle'
		ctx.fillStyle = color;
		ctx.fillText(o.text, o.pos.x, o.pos.y);
		ctx.restore();
	};

	draws.push(draw);

	return o;
};

const log = (v: any) => {
	console.log(v);
	return v;
};

// const cc = (c: number) => c**4;
const cc = (c: number) => Math.sin(c/2 * Math.PI) **4;


export async function main() {
	await audioContorller.load('shot', 'assets/audio/lazer-shot.mp3');

	const rect = Rect(vec2(100, 0), vec2(100, 100), '#aa7777');
	const text = Text('box', rect.pos.ref().accessors({
		get: (n, i) => n + rect.size[i] / 2,
		set: (n, i) => n - rect.size[i] / 2
	}), '#eeeeee');


	const box_anim = anims.reg(new Animation(function* () {
		const d = viewport.size.new().sub(rect.size);

		yield* c(c => rect.pos.x = d.x*c, 1000, 5, cc);
		yield* c(c => rect.pos.y = d.y*c, 1000, 5, cc);
		yield* c(c => rect.pos.x = d.x * -c + d.x, 1000, 5, cc);
		yield* c(c => rect.pos.y = d.y * -c + d.y, 1000, 5, cc);
	}));

	pipe(box_anim, box_anim);
}
