import { module, test } from 'qunit';
import { setupTest } from 'ember-qunit';

module('Unit | Route | browse/journal/volume', function(hooks) {
  setupTest(hooks);

  test('it exists', function(assert) {
    let route = this.owner.lookup('route:browse/journal/volume');
    assert.ok(route);
  });
});