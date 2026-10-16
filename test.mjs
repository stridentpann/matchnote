import assert from 'node:assert/strict';
import { reconcile } from './app.mjs';
const result = reconcile([{ id: 'PO-027', item: 'T', quantity: 100 }], [{ batchId: 'A', item: 'T', quantity: 40, unit: '件' }, { batchId: 'B', item: 'T', quantity: 3, unit: '包' }], { T: { 包: 10 } });
assert.equal(result.totals.allocated, 70);
assert.equal(result.orders[0].remaining, 30);
const duplicate = reconcile([{ id: 'PO', item: 'T', quantity: 10 }], [{ batchId: 'A', item: 'T', quantity: 10, unit: '件' }, { batchId: 'A', item: 'T', quantity: 10, unit: '件' }]);
assert.equal(duplicate.totals.allocated, 10);
console.log('matchnote: ok');
