import {
	getHorizontalStepKeys,
	getStepForKey,
	getVerticalStepKeys,
	isArrowKey,
} from '../../../common/controller/ui';
import {ValueController} from '../../../common/controller/value';
import {findNextTarget, supportsTouch} from '../../../common/dom-util';
import {Foldable} from '../../../common/model/foldable';
import {Point2d} from '../../../common/model/point-2d';
import {Value} from '../../../common/model/value';
import {mapRange} from '../../../common/number-util';
import {
	PointerData,
	PointerHandler,
	PointerHandlerEvents,
} from '../../../common/view/pointer-handler';
import {Point2dPadView} from '../view/point-2d-pad';

interface Config {
	invertsY: boolean;
	maxValue: number;
	value: Value<Point2d>;
	xBaseStep: number;
	yBaseStep: number;
}

/**
 * @hidden
 */
export class Point2dPadController implements ValueController<Point2d> {
	public readonly foldable: Foldable;
	public readonly value: Value<Point2d>;
	public readonly view: Point2dPadView;
	public triggerElement: HTMLElement | null = null;
	private readonly ptHandler_: PointerHandler;
	private readonly invertsY_: boolean;
	private readonly maxValue_: number;
	private readonly xBaseStep_: number;
	private readonly yBaseStep_: number;

	constructor(doc: Document, config: Config) {
		this.onFocusableElementBlur_ = this.onFocusableElementBlur_.bind(this);
		this.onKeyDown_ = this.onKeyDown_.bind(this);
		this.onPadKeyDown_ = this.onPadKeyDown_.bind(this);
		this.onPointerDown_ = this.onPointerDown_.bind(this);
		this.onPointerMove_ = this.onPointerMove_.bind(this);
		this.onPointerUp_ = this.onPointerUp_.bind(this);

		this.value = config.value;
		this.foldable = new Foldable();

		this.maxValue_ = config.maxValue;
		this.invertsY_ = config.invertsY;

		this.xBaseStep_ = config.xBaseStep;
		this.yBaseStep_ = config.yBaseStep;

		this.view = new Point2dPadView(doc, {
			foldable: this.foldable,
			invertsY: this.invertsY_,
			maxValue: this.maxValue_,
			value: this.value,
		});

		this.ptHandler_ = new PointerHandler(doc, this.view.padElement);
		this.ptHandler_.emitter.on('down', this.onPointerDown_);
		this.ptHandler_.emitter.on('move', this.onPointerMove_);
		this.ptHandler_.emitter.on('up', this.onPointerUp_);

		this.view.padElement.addEventListener('keydown', this.onPadKeyDown_);

		this.view.element.addEventListener('keydown', this.onKeyDown_);
		this.view.allFocusableElements.forEach((elem) => {
			elem.addEventListener('blur', this.onFocusableElementBlur_);
		});
	}

	private handlePointerEvent_(d: PointerData): void {
		const max = this.maxValue_;
		const px = mapRange(d.px, 0, 1, -max, +max);
		const py = mapRange(this.invertsY_ ? 1 - d.py : d.py, 0, 1, -max, +max);
		this.value.rawValue = new Point2d(px, py);
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

	private onPadKeyDown_(ev: KeyboardEvent): void {
		if (isArrowKey(ev.keyCode)) {
			ev.preventDefault();
		}

		this.value.rawValue = new Point2d(
			this.value.rawValue.x +
				getStepForKey(this.xBaseStep_, getHorizontalStepKeys(ev)),
			this.value.rawValue.y +
				getStepForKey(this.yBaseStep_, getVerticalStepKeys(ev)) *
					(this.invertsY_ ? 1 : -1),
		);
	}

	private onFocusableElementBlur_(ev: FocusEvent): void {
		const elem = this.view.element;
		const nextTarget = findNextTarget(ev);
		if (nextTarget && elem.contains(nextTarget)) {
			// Next target is in the picker
			return;
		}
		if (
			nextTarget &&
			nextTarget === this.triggerElement &&
			!supportsTouch(elem.ownerDocument)
		) {
			// Next target is the trigger button
			return;
		}

		this.foldable.expanded = false;
	}

	private onKeyDown_(ev: KeyboardEvent): void {
		if (ev.keyCode === 27) {
			this.foldable.expanded = false;
		}
	}
}
