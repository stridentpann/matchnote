import { fileURLToPath } from 'node:url';
import { start } from './lib/server.mjs';
import { run, validate } from './core.mjs';
export * from './core.mjs';
export const spec = { ...{
  "slug": "matchnote",
  "repo": "matchnote",
  "owner": "stridentpann",
  "title": "Matchnote",
  "purpose": "Reconcile purchase and receipt quantities with source traceability",
  "workflow": "A Kite purchasing agent can buy a reconciliation ledger; no payment to suppliers or inventory mutation occurs.",
  "colors": [
    "#f7f5f0",
    "#30383a",
    "#983b2c"
  ],
  "required": [
    "orders",
    "receipts"
  ],
  "sample": {
    "orders": [
      {
        "id": "PO-027",
        "item": "shirt",
        "quantity": 100
      }
    ],
    "receipts": [
      {
        "batchId": "A",
        "item": "shirt",
        "quantity": 40,
        "unit": "unit",
        "sourceRow": 12
      },
      {
        "batchId": "B",
        "item": "shirt",
        "quantity": 3,
        "unit": "box",
        "sourceRow": 19
      }
    ],
    "conversions": {
      "shirt": {
        "box": 10
      }
    }
  },
  "changed": "Conflicting batch IDs are rejected, conversions are explicit, manual split allocations are validated, and received = allocated + unallocated is enforced.",
  "limits": "No OCR, accounting, tax judgment, inventory writes or persistent multi-user ledger. Editing rules creates a new immutable task.",
  "version": "0.2.0",
  "inputSchema": {
    "type": "object",
    "required": [
      "orders",
      "receipts"
    ],
    "properties": {
      "orders": {
        "type": "array"
      },
      "receipts": {
        "type": "array"
      },
      "conversions": {
        "type": "object"
      }
    }
  }
}, run, validate };
if (process.argv[1] === fileURLToPath(import.meta.url)) start(spec);

