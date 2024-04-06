import { Vector2 } from 'ver/Vector2';
import { Event } from 'ver/events';
import type { Viewport } from 'ver/Viewport';
import { Loader } from 'ver/Loader';
import { Node2D } from './Node2D.js';


type Image = InstanceType<typeof Image>;


export class Sprite extends Node2D {
	public image?: Image;

	public get src() { return this.image?.src || ''; }
	public get width() { return this.image?.naturalWidth || 0; }
	public get height() { return this.image?.naturalHeight || 0; }

	public offset = new Vector2();
	public offset_angle: number = 0;
	public size: Vector2 = new Vector2(0, 0, (x, y) => (this.draw_distance = this.globalScale.inc(this.size).module));

	public async load(...args: Parameters<Loader['loadImage']>): Promise<void> {
		this.image = await Loader.instance().loadImage(...args);
		this.size.set(this.width, this.height);
	}

	public frame: [] | [x: number, y: number, w: number, h: number] = [];

	public invertX: boolean = false;
	public invertY: boolean = false;

	protected _draw({ ctx }: Viewport): void {
		if(!this.image) return;

		if(this.invertX) ctx.scale(-1, 1);
		if(this.invertY) ctx.scale(1, -1);

		if(this.offset_angle !== 0) ctx.rotate(this.offset_angle);

		if(!this.frame.length) ctx.drawImage(this.image,
			this.offset.x - this.size.x/2, this.offset.y -this.size.y/2,
			this.size.x, this.size.y);
		else ctx.drawImage(this.image, ...this.frame,
			this.offset.x - this.frame[2]/2, this.offset.y - this.frame[3]/2,
			this.frame[2], this.frame[3]);
	}
}
