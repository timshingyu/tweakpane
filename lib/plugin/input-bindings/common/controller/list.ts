import {forceCast} from '../../../../misc/type-util';
import {ListItem} from '../../../common/constraint/list';
import {ValueController} from '../../../common/controller/value';
import {Value} from '../../../common/model/value';
import {ListView} from '../../../monitor-bindings/common/view/list';

interface Config<T> {
	listItems: ListItem<T>[];
	stringifyValue: (value: T) => string;
	value: Value<T>;
}

/**
 * @hidden
 */
export class ListController<T> implements ValueController<T> {
	public readonly value: Value<T>;
	public readonly view: ListView<T>;
	private listItems_: ListItem<T>[];

	constructor(doc: Document, config: Config<T>) {
		this.onSelectChange_ = this.onSelectChange_.bind(this);

		this.value = config.value;

		this.listItems_ = config.listItems;
		this.view = new ListView(doc, {
			options: this.listItems_,
			stringifyValue: config.stringifyValue,
			value: this.value,
		});
		this.view.selectElement.addEventListener('change', this.onSelectChange_);
	}

	private onSelectChange_(e: Event): void {
		const selectElem: HTMLSelectElement = forceCast(e.currentTarget);
		const optElem = selectElem.selectedOptions.item(0);
		if (!optElem) {
			return;
		}

		const itemIndex = Number(optElem.dataset.index);
		this.value.rawValue = this.listItems_[itemIndex].value;

		this.view.update();
	}
}
