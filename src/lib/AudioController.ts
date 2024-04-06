import { Event, EventDispatcher } from 'ver/events';


export class AudioContorller extends EventDispatcher {
	public ctx = new AudioContext();
	public gain = this.ctx.createGain();

	public audio_buffers: Record<string, AudioBuffer> = {};

	constructor() {
		super();

		this.gain.connect(this.ctx.destination);
	}

	public async load(id: string, src: string): Promise<AudioBuffer> {
		const buffer = await fetch(src).then(data => data.arrayBuffer())
		const audio_buffer = await this.ctx.decodeAudioData(buffer);
		this.audio_buffers[id] = audio_buffer;
		return audio_buffer;
	}

	public play(id: string) {
		const sound = this.ctx.createBufferSource();
		sound.buffer = this.audio_buffers[id];
		sound.connect(this.gain);

		sound.start(this.ctx.currentTime);
	}
}
