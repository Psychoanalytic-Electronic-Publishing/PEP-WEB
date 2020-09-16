import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { render } from '@ember/test-helpers';
import hbs from 'htmlbars-inline-precompile';

module('Integration | Component | modal-dialogs/publisher-info', function(hooks) {
    setupRenderingTest(hooks);

    test('it renders', async function(assert) {
        // Set any properties with this.set('myProperty', 'value');
        // Handle any actions with this.set('myAction', function(val) { ... });

        await render(hbs`{{modal-dialogs/publisher-info}}`);

        assert.equal(this.element.textContent?.trim(), '');

        // Template block usage:
        await render(hbs`
      {{#modal-dialogs/publisher-info}}
        template block text
      {{/modal-dialogs/publisher-info}}
    `);

        assert.equal(this.element.textContent?.trim(), 'template block text');
    });
});
