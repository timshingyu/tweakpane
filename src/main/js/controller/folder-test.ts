import {assert} from 'chai';
import {describe, it} from 'mocha';

import {TestUtil} from '../misc/test-util';
import {ButtonController} from './button';
import {FolderController} from './folder';

describe(FolderController.name, () => {
	it('should toggle expanded by clicking title', (done) => {
		const doc = TestUtil.createWindow().document;
		const c = new FolderController(doc, {
			title: 'Push',
		});

		assert.strictEqual(c.folder.expanded, true);

		c.folder.emitter.on('change', () => {
			assert.strictEqual(c.folder.expanded, false);
			done();
		});

		c.view.titleElement.click();
	});

	it('should remove list item after disposing child view', () => {
		const doc = TestUtil.createWindow().document;
		const c = new FolderController(doc, {
			title: 'Push',
		});
		const cc = new ButtonController(doc, {
			title: 'Foobar',
		});
		c.uiControllerList.append(cc);

		assert.strictEqual(c.uiControllerList.items.length, 1);
		cc.dispose();
		assert.strictEqual(c.uiControllerList.items.length, 0);
	});
});
