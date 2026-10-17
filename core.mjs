import { insist, list, unique, integer } from './lib/validation.mjs';
export function reconcile(orders, receipts, conversions = {}, explicit = []) {
  list(orders, 'orders'); list(receipts, 'receipts'); unique(orders);
  const remaining = orders.map(o => { integer(o.quantity, 'order quantity', 1); return { ...o, remaining: o.quantity }; });
  const byBatch = new Map(), usable = [], duplicates = [];
  for (const r of receipts) {
    insist(typeof r.batchId === 'string' && r.batchId.length > 0, 'batchId required'); integer(r.quantity, 'receipt quantity', 1);
    const fingerprint = JSON.stringify([r.item, r.quantity, r.unit]);
    if (byBatch.has(r.batchId)) { insist(byBatch.get(r.batchId) === fingerprint, 'Batch ID reused with different content'); duplicates.push(r.batchId); continue; }
    byBatch.set(r.batchId, fingerprint);
    const factor = r.unit === '件' || r.unit === 'unit' ? 1 : conversions[r.item]?.[r.unit];
    if (factor === undefined) { usable.push({ ...r, status: 'needs-unit-conversion' }); continue; }
    integer(factor, 'conversion factor', 1, 1000000);
    insist(Number.isSafeInteger(r.quantity * factor), 'Quantity overflow');
    usable.push({ ...r, originalQuantity: r.quantity, quantity: r.quantity * factor, unallocated: r.quantity * factor });
  }
  const allocations = [];
  const allocate = (r, o, quantity) => {
    insist(r && o && !r.status, 'Allocation source not usable'); integer(quantity, 'allocation', 1);
    insist(r.item === o.item && quantity <= r.unallocated && quantity <= o.remaining, 'Invalid or excessive allocation');
    r.unallocated -= quantity; o.remaining -= quantity;
    allocations.push({ batchId: r.batchId, orderId: o.id, quantity, sourceRow: r.sourceRow });
  };
  for (const a of list(explicit, 'allocations')) allocate(usable.find(r => r.batchId === a.batchId), remaining.find(o => o.id === a.orderId), a.quantity);
  // Supplying explicit allocations puts the ledger into manual mode.
  if (!explicit.length) for (const r of usable.filter(r => !r.status)) for (const o of remaining.filter(o => o.item === r.item && o.remaining > 0)) {
    const n = Math.min(o.remaining, r.unallocated); if (n) allocate(r, o, n);
  }
  const received = usable.filter(r => !r.status).reduce((s, r) => s + r.quantity, 0), allocated = allocations.reduce((s, a) => s + a.quantity, 0), unallocated = usable.filter(r => !r.status).reduce((s, r) => s + r.unallocated, 0);
  insist(received === allocated + unallocated, 'Quantity conservation failure');
  return { orders: remaining, receipts: usable, allocations, duplicateBatchIds: duplicates, totals: { received, allocated, unallocated }, ruleVersion: '0.2.0' };
}
export function run(x) { return reconcile(x.orders, x.receipts, x.conversions, x.allocations); }
export function validate(x) { run(x); }
