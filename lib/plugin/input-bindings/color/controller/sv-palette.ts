import {ValueController} from '../../../common/controller/value';
import {Value} from '../../../common/model/value';
import {mapRange} from '../../../common/number-util';
import {
	getHorizontalStepKeys,
	getStepForKey,
	getVerticalStepKeys,
	isArrowKey,
} from '../../../common/ui';
import {
	PointerData,
	PointerHandler,
	PointerHandlerEvents,
} from '../../../common/view/pointer-handler';
import {Color} from '../model/color';
import {getBaseStepForColor} from '../util';
import {SvPaletteView} from '../view/sv-palette';

interface Config {
	value: Value<Color>;
}

/**
 * @hidden
 */
export class SvPaletteController implements ValueController<Color> {
	public readonly value: Value<Color>;
	public readonly view: SvPaletteView;
	private ptHandler_: PointerHandler;

	constructor(doc: Document, config: Config) {
		this.onKeyDown_ = this.onKeyDown_.bind(this);
		this.onPointerDown_ = this.onPointerDown_.bind(this);
		this.onPointerMove_ = this.onPointerMove_.bind(this);
		this.onPointerUp_ = this.onPointerUp_.bind(this);

		this.value = config.value;

		this.view = new SvPaletteView(doc, {
			value: this.value,
		});

		this.ptHandler_ = new PointerHandler(this.view.element);
		this.ptHandler_.emitter.on('down', this.onPointerDown_);
		this.ptHandler_.emitter.on('move', this.onPointerMove_);
		this.ptHandler_.emitter.on('up', this.onPointerUp_);

		this.view.element.addEventListener('keydown', this.onKeyDown_);
	}

	private handlePointerEvent_(d: PointerData): void {
		const saturation = mapRange(d.x, 0, d.bounds.width, 0, 100);
		const value = mapRange(d.y, 0, d.bounds.height, 100, 0);

		const [h, , , a] = this.value.rawValue.getComponents('hsv');
		this.value.rawValue = new Color([h, saturation, value, a], 'hsv');
		this.view.update();
	}

	private onPointerDown_(ev: PointerHandlerEvents['down']): void {
		this.handlePointerEvent_(ev.data);
	}

	private onPointerMove_(ev: PointerHandlerEvents['move']): void {
		this.handlePointerEvent_(ev.data);
	}

	private onPointerUp_(ev: PointerHandlerEvents['up']): void {
		this.handlePointerEvent_(ev.data);
	}

	private onKeyDown_(ev: KeyboardEvent): void {
		if (isArrowKey(ev.keyCode)) {
			ev.preventDefault();
		}

		const [h, s, v, a] = this.value.rawValue.getComponents('hsv');
		const baseStep = getBaseStepForColor(false);

		this.value.rawValue = new Color(
			[
				h,
				s + getStepForKey(baseStep, getHorizontalStepKeys(ev)),
				v + getStepForKey(baseStep, getVerticalStepKeys(ev)),
				a,
			],
			'hsv',
		);
	}
}
