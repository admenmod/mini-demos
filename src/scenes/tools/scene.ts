import { Vector2 } from 'ver/Vector2';
import { Viewport } from 'ver/Viewport';

import { SensorCamera } from 'engine/SensorCamera.js';
import { AnimationManager } from 'src/animations.js';
import { canvas, touches, viewport } from 'src/canvas.js';
import { init, process, render, resetTranform, configNewImage, saveImage, selectImage } from './state.js';

import { input, inputSize } from './components/ImageConverter.js';
import { resetTranformAnim } from './animations.js';


const sensor_camera = new SensorCamera({ pixelRatio: 2, maxspeed: 0 });
sensor_camera.isMovingOnScaling = false;
const viewport_back = new Viewport(canvas.create('back').canvas.getContext('2d')!);


class Sprite {
	public position = new Vector2();
	public scale = new Vector2(1, 1);

	constructor(public image: Image) {}

	public draw({ ctx }: Viewport) {
		const pos = this.position.new();
		const size = this.scale.new().inc(this.image.naturalWidth, this.image.naturalHeight);

		ctx.save();
		ctx.translate(pos.x, pos.y);
		ctx.drawImage(this.image, -size.x/2, -size.y/2, size.x, size.y);
		ctx.restore();
	}

	public draw_border({ ctx, scale, pixelRatio, size: vsize }: Viewport) {
		const size = newImageSize.new();

		ctx.save();
		ctx.lineWidth = scale.x/pixelRatio;
		ctx.setLineDash([2, 5].map(it => it*scale.x));
		ctx.strokeStyle = '#eeee11';
		ctx.strokeRect(-size.x/2, -size.y/2, size.x, size.y);

		ctx.font = `${15*pixelRatio}px Arial`;
		ctx.textAlign = 'center';
		ctx.textBaseline = 'bottom';
		ctx.fillStyle = '#eeeeee';
		ctx.fillText(`${filename}`, 0, vsize.y/2 - 5);
		ctx.restore();
	}
}


let filename: string;
let sprite: Sprite;

const imagesize = new Vector2();
const newImageSize = new Vector2().new(vec => {
	phantom.canvas.width = vec.x;
	phantom.canvas.height = vec.y;
});

init.on(() => {
	viewport.auto_scale_pixel_ratio = false;
	viewport_back.auto_scale_pixel_ratio = false;

	canvas.on('resize', (size, pixelRatio) => {
		viewport.size.set(size).inc(pixelRatio);
		viewport_back.size.set(size).inc(pixelRatio);
	}, 1000).call(canvas, canvas.size, canvas.pixelRatio);

	viewport.on('resize', () => {
		if(sprite) return void viewport.off('resize', 'start');

		const text = `Намите на экран чтобы выбрать изображение`;

		const pos = viewport.size.new().inc(viewport.scale).div(2);

		const ctx = canvas.ctx!;
		ctx.font = `7vw Arial`;
		ctx.textAlign = 'center';
		ctx.textBaseline = 'middle';
		ctx.fillStyle = '#eeeeee';
		ctx.fillText(text, pos.x, pos.y);
	}, 0, 'start').call(viewport, viewport.size);
});
init.on(() => new Promise<void>(res => {
	window.onclick = () => {
		if(!input) return;
		input?.click();
		window.onclick = null;
		res();
	};
}));
init.on(() => new Promise<void>(res => {
	selectImage.once((img, name) => {
		filename = name;
		imagesize.set(img.naturalWidth, img.naturalHeight);
		sprite = new Sprite(img);
		res();
	});
}));
init.on(() => {
	newImageSize.set(imagesize);
	inputSize!.value = `${sprite.image.naturalWidth}x${sprite.image.naturalHeight}:1;png`;

	anims.reg(resetTranformAnim);
});


let formatType: string;
let formatQuality: number | undefined;
configNewImage.on((size, scale, format) => {
	if(1/scale !== viewport_back.scale.x) {
		viewport_back.scale.set(1/scale);
		viewport.scale.set(1/scale);
	}

	newImageSize.set(size);

	const data = format.split(',');
	formatType = data[0];
	formatQuality = +data[1];
	if(isNaN(formatQuality)) formatQuality = void 0;
});


const draw_new = (ctx: OffscreenCanvasRenderingContext2D) => {
	const size = newImageSize.new();
	const scale = viewport.scale.new().div(viewport_back.scale).inverse();

	ctx.save();
	ctx.clearRect(0, 0, size.x, size.y);
	ctx.translate(size.x/2, size.y/2);
	ctx.scale(scale.x, scale.y);

	ctx.imageSmoothingEnabled = false;
	ctx.drawImage(sprite.image, -viewport.position.x-(imagesize.x)/2, -viewport.position.y-(imagesize.y)/2);

	ctx.restore();
};


saveImage.on(() => {
	phantom.canvas.convertToBlob({ type: `image/${formatType}`, quality: formatQuality }).then(blob => {
		const url = URL.createObjectURL(blob);
		const a = document.createElement('a');
		a.href = url;
		a.download = `${filename}.${blob.type.split('/')[1]}`;
		a.click();
		URL.revokeObjectURL(url);
	});
});
resetTranform.on(() => {
	if(resetTranformAnim.done) resetTranformAnim.run(viewport, viewport_back);
});
touches.on('touchstart', () => resetTranformAnim.reset());


export const anims = new AnimationManager();

process.on(dt => {
	sensor_camera.update(dt, touches, viewport);
	for(const anim of anims.anims) anim.tick(dt);
}, -1000);


const phantom = new OffscreenCanvas(1, 1).getContext('2d')!;

render.on(viewport => {
	viewport.ctx.imageSmoothingEnabled = false;

	viewport.clear();
	viewport.ctx.save();
	viewport.use();

	viewport.ctx.globalAlpha = 0.3;
	sprite.draw(viewport);

	viewport.ctx.restore();


	viewport_back.clear();
	viewport_back.ctx.save();
	viewport_back.use();

	sprite.draw_border(viewport_back);

	viewport_back.ctx.restore();


	draw_new(phantom);


	viewport.ctx.save();
	const size = newImageSize.new().div(viewport_back.scale);
	const pos = viewport.size.new().sub(size).div(2);

	viewport.ctx.drawImage(phantom.canvas, pos.x, pos.y, size.x, size.y);
	viewport.ctx.restore();
}, -1000);
