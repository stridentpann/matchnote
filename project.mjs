import { field, table, column, view, metric, item, csvArtifact, summary } from './lib/product-kit.mjs';
export const product = {
  category:'Procurement operations',projectNoun:'Reconciliation project',runLabel:'Reconcile delivery ledger',
  outcome:'Track orders and delivery batches, set unit conversions, review allocations and export traceable reconciliation sheets.',
  fields:[table('orders','Purchase orders',[column('id','Order ID'),column('item','Item'),column('quantity','Ordered units','number')]),
    table('receipts','Delivery batches',[column('batchId','Batch ID'),column('item','Item'),column('quantity','Quantity','number'),column('unit','Unit'),column('sourceRow','Source row','number')]),
    field('conversions','Unit conversions','conversions',{help:'Each row maps an item and receipt unit to a positive number of base units.'}),
    table('allocations','Manual split allocations',[column('batchId','Batch ID'),column('orderId','Order ID'),column('quantity','Base units','number')],{help:'Leave empty for automatic allocation. Any row switches the whole ledger to manual allocation.'})],
  describe(result) {
    const missing=result.receipts.filter(r=>r.status);
    return summary([metric('Received base units',result.totals.received),metric('Allocated',result.totals.allocated),metric('Unallocated',result.totals.unallocated),metric('Orders still open',result.orders.filter(o=>o.remaining>0).length)],[
      view('Purchase order balance',[column('id','Order'),column('item','Item'),column('quantity','Ordered'),column('remaining','Outstanding')],result.orders),
      view('Allocation ledger',[column('batchId','Batch'),column('orderId','Order'),column('quantity','Allocated units'),column('sourceRow','Source row')],result.allocations),
      view('Receipt balances',[column('batchId','Batch'),column('quantity','Converted units'),column('unallocated','Unallocated'),column('status','Issue')],result.receipts),
    ],[...missing.map(r=>item(`unit:${r.batchId}`,`Missing unit conversion: ${r.batchId}`,`${r.item} / ${r.unit}`,true)),...result.receipts.filter(r=>r.unallocated>0).map(r=>item(`leftover:${r.batchId}`,`Unallocated receipt ${r.batchId}`,`${r.unallocated} units need an allocation or a corrected receipt.`,true)),...result.orders.map(o=>item(`order:${o.id}`,`Review order ${o.id}`,`${o.remaining} units outstanding; this can remain an explicitly reviewed partial delivery.`))]);
  },
  artifacts(result) {
    return [csvArtifact('allocations','Allocation ledger',[column('batchId','Batch'),column('orderId','Order'),column('quantity','Allocated units'),column('sourceRow','Source row')],result.allocations),csvArtifact('balances','Order balances',[column('id','Order'),column('item','Item'),column('quantity','Ordered'),column('remaining','Outstanding')],result.orders)];
  },
};
