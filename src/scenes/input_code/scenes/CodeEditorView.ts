import type { Viewport } from 'ver/Viewport';
import { Control } from 'engine/scenes/Control.js';
import { Caret, CodeEditor } from 'engine/CodeEditor.js';


export const FONT_SIZE = 15;
export const CHAR_SIZE = 8;
export const LINE_GAP = 5;
export const CHAR_GAP = 1;


const rerender = (ctx: OffscreenCanvasRenderingContext2D, lines: string[]) => {
	ctx.save();
	ctx.globalAlpha = 0.2;
	ctx.fillStyle = '#22222250';
	ctx.fillRect(0, 0, ctx.canvas.width, ctx.canvas.height);

	ctx.globalAlpha = 1;
	ctx.font = `${FONT_SIZE}px monospace`;
	ctx.textAlign = 'start';
	ctx.textBaseline = 'top';

	ctx.fillStyle = '#eeeeee';

	for(let i = 0; i < lines.length; i++) ctx.fillText(lines[i], 0, i * (FONT_SIZE + LINE_GAP));

	ctx.restore();
};


const renderCarets = (ctx: OffscreenCanvasRenderingContext2D, carets: Caret[], mode: string) => {
	for(let i = 0; i < carets.length; i++) {
		const caret = carets[i];
		const pos = caret.new().inc(CHAR_SIZE + CHAR_GAP, FONT_SIZE + LINE_GAP);

		ctx.fillStyle = '#ffff00';

		if(mode === 'normal') ctx.fillRect(pos.x, pos.y, CHAR_SIZE, FONT_SIZE);
		if(mode === 'insert') ctx.fillRect(pos.x, pos.y, 2, FONT_SIZE);
	}
};


export class CodeEditorView extends Control {
	public editor: CodeEditor | null = null;

	protected override async _init(): Promise<void> {
		this.editor?.init();
	}

	protected override _draw({ ctx }: Viewport): void {
		if(!this.editor) return;

		rerender(ctx, this.editor.lines);
		if(typeof this.editor.mode === 'string') renderCarets(ctx, this.editor.carets, this.editor.mode);
	}
}
