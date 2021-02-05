import { run } from '@ember/runloop';

import { setupTest } from 'ember-qunit';

import { module, test } from 'qunit';

module('Unit | Model | journal', function(hooks) {
    setupTest(hooks);

    // Replace this with your real tests.
    test('it exists', function(assert) {
        const store = this.owner.lookup('service:store');
        const model = run(() => store.createRecord('journal', {}));
        assert.ok(model);
    });
});
