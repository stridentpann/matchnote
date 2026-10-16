# Matchnote

Purchase and receipt reconciliation with quantity conservation. It supports explicit unit aliases, batch de-duplication, traceable allocations, and remaining quantities.

This is a synthetic public evaluation project for testing developer indexing. It does not perform OCR, accounting, tax decisions, payments, inventory writes, claim Electric Capital acceptance, or contain supplier data. The account owner must review changes before any external submission.

## Run

```sh
npm test
npm start
```

Open `http://localhost:3000`. A duplicate batch is ignored; an unknown package conversion is left unresolved rather than guessed.
