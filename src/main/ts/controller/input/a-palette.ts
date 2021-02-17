import {PointerHandler, PointerHandlerEvents} from '../../misc/pointer-handler';
import {PointerData} from '../../misc/pointer-handler';
import {Color} from '../../model/color';
import {Value} from '../../model/value';
import {ViewModel} from '../../model/view-model';
import {APaletteView} from '../../view/value/a-palette';
import * as UiUtil from '../ui-util';
import {ValueController} from './value';

interface Config {
	value: Value<Color>;
	viewModel: ViewModel;
}

/**
 * @hidden
 */
export class APaletteController implements ValueController<Color> {
	public readonly viewModel: ViewModel;
	public readonly value: Value<Color>;
	public readonly view: APaletteView;
	private ptHandler_: PointerHandler;

	constructor(document: Document, config: Config) {
		this.onKeyDown_ = this.onKeyDown_.bind(this);
		this.onPointerDown_ = this.onPointerDown_.bind(this);
		this.onPointerMove_ = this.onPointerMove_.bind(this);
		this.onPointerUp_ = this.onPointerUp_.bind(this);

		this.value = config.value;

		this.viewModel = config.viewModel;
		this.view = new APaletteView(document, {
			model: this.viewModel,
			value: this.value,
		});

		this.ptHandler_ = new PointerHandler(document, this.view.element);
		this.ptHandler_.emitter.on('down', this.onPointerDown_);
		this.ptHandler_.emitter.on('move', this.onPointerMove_);
		this.ptHandler_.emitter.on('up', this.onPointerUp_);

		this.view.element.addEventListener('keydown', this.onKeyDown_);
	}

	private handlePointerEvent_(d: PointerData): void {
		const alpha = d.px;

		const c = this.value.rawValue;
		const [h, s, v] = c.getComponents('hsv');
		this.value.rawValue = new Color([h, s, v, alpha], 'hsv');
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
		const step = UiUtil.getStepForKey(
			UiUtil.getBaseStepForColor(true),
			UiUtil.getHorizontalStepKeys(ev),
		);
		const c = this.value.rawValue;
		const [h, s, v, a] = c.getComponents('hsv');
		this.value.rawValue = new Color([h, s, v, a + step], 'hsv');
	}
}
