import test from 'node:test'; import assert from 'node:assert/strict'; import { reconcile } from './core.mjs';
test('100 ordered, 40 + 3x10 received leaves 30', () => { const r = reconcile([{ id: 'o', item: 'T', quantity: 100 }], [{ batchId: 'a', item: 'T', quantity: 40, unit: 'unit' }, { batchId: 'b', item: 'T', quantity: 3, unit: 'box' }], { T: { box: 10 } }); assert.equal(r.orders[0].remaining, 30); assert.equal(r.totals.allocated, 70); });
test('same batch de-duplicated; conflicting reuse rejected', () => {
  const o = [{ id: 'o', item: 'T', quantity: 100 }], r = { batchId: 'a', item: 'T', quantity: 10, unit: 'unit' };
  assert.equal(reconcile(o, [r, r]).totals.received, 10); assert.throws(() => reconcile(o, [r, { ...r, quantity: 11 }]), /reused/);
});
test('unknown package conversion is unresolved', () => { assert.equal(reconcile([{ id: 'o', item: 'T', quantity: 10 }], [{ batchId: 'a', item: 'T', quantity: 1, unit: 'box' }]).receipts[0].status, 'needs-unit-conversion'); });
test('split allocations conserve quantities; reissuing a shorter allocation undoes distribution', () => {
  const orders = [{ id: 'a', item: 'T', quantity: 10 }, { id: 'b', item: 'T', quantity: 10 }], receipts = [{ batchId: 'r', item: 'T', quantity: 10, unit: 'unit' }];
  const r = reconcile(orders, receipts, {}, [{ batchId: 'r', orderId: 'a', quantity: 4 }, { batchId: 'r', orderId: 'b', quantity: 3 }]); assert.equal(r.totals.unallocated, 3); assert.equal(r.totals.received, r.totals.allocated + r.totals.unallocated);
  assert.throws(() => reconcile(orders, receipts, {}, [{ batchId: 'r', orderId: 'a', quantity: 11 }]), /excessive/);
});
