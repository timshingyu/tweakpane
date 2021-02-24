import {TpError} from '../../common/tp-error';
import {InputBindingPlugin} from '../../input-binding';
import {ColorSwatchTextController} from './controller/color-swatch-text';
import {
	colorFromString,
	CompositeColorParser,
	getColorNotation,
	getColorStringifier,
	hasAlphaComponent,
} from './converter/color-string';
import {Color} from './model/color';
import {createColorStringWriter} from './writer/color';

/**
 * @hidden
 */
export const StringColorInputPlugin: InputBindingPlugin<Color, string> = {
	id: 'input-color-string',
	binding: {
		accept: (value, params) => {
			if (typeof value !== 'string') {
				return null;
			}
			if ('input' in params && params.input === 'string') {
				return null;
			}
			const notation = getColorNotation(value);
			if (!notation) {
				return null;
			}
			return value;
		},
		reader: (_args) => colorFromString,
		writer: (args) => {
			const notation = getColorNotation(args.initialValue);
			if (!notation) {
				throw TpError.shouldNeverHappen();
			}
			return createColorStringWriter(notation);
		},
		equals: Color.equals,
	},
	controller: (args) => {
		const notation = getColorNotation(args.initialValue);
		if (!notation) {
			throw TpError.shouldNeverHappen();
		}

		const stringifier = getColorStringifier(notation);
		return new ColorSwatchTextController(args.document, {
			formatter: stringifier,
			parser: CompositeColorParser,
			supportsAlpha: hasAlphaComponent(notation),
			value: args.binding.value,
		});
	},
};