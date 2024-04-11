import { Vector2 } from 'ver/Vector2';
import { State } from 'ver/State';
import { math as Math } from 'ver/helpers';
import { Animation } from 'ver/Animation';
import type { Viewport } from 'ver/Viewport';

import { Node2D } from 'engine/scenes/Node2D.js';


export class Enemy extends Node2D {
	public path: Vector2[] = [];
	public radius: number = 10;

	public state = new State<'await' | 'moveing'>('await');

	public set_target_anim = new Animation(function* (enemy: Enemy) {
		yield 0; while(true) {
			enemy.path.unshift(enemy.position.new().add(Math.randomInt(-100, 100), Math.randomInt(-100, 100)));
		yield 1000; }
	});

	protected async _init(this: Enemy): Promise<void> {
		this.state.on(value => {
			if(value === 'moveing') {
				this.set_target_anim.reset().run(this);
			} else if(value === 'await') {
				this.set_target_anim.reset();
			}
		});
	}

	protected _process(dt: number): void {
		this.set_target_anim.tick(dt);

		if(this.path.length) {
			const target = this.path[this.path.length-1];

			if(this.position.getDistance(target) > 1) { 
				this.position.moveTo(target, 1);
			} else this.path.pop();
		}
	}

	protected _draw({ ctx }: Viewport): void {
		ctx.beginPath();
		ctx.fillStyle = '#288e81';
		ctx.arc(0, 0, this.radius, 0, Math.TAU);
		ctx.fill();
		ctx.closePath();
	}
}
