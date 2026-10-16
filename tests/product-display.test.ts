import assert from 'node:assert/strict';
import test from 'node:test';
import { displayProductName } from '../lib/product-display';
test('display titles hide only the internal demo suffix', () => {
  assert.equal(displayProductName('CONNECTA Câble USB-C (TEST)'), 'CONNECTA Câble USB-C');
  assert.equal(displayProductName('CONNECTA Chargeur 20W (test)'), 'CONNECTA Chargeur 20W');
  assert.equal(displayProductName('Hoco EW75'), 'Hoco EW75');
  assert.equal(displayProductName('TEST AUDIO'), 'TEST AUDIO');
});
