# Capstone Evaluation Readiness — Review Checklist

**Review date:** 9 November 2026. A checked source observation is not a verified runtime test.

## Documentation and explanation

- [x] Source-derived architecture narrative added in `docs/architecture/evaluator-walkthrough.md`.
- [x] Retrospective provenance log added in `docs/development-provenance.md`, using actual commit links.
- [ ] Confirm academic supervisor's policy on previously developed commercial software and allowed disclosure.
- [ ] Produce an entity-relationship diagram from current Drizzle schema.
- [ ] Add justified sequence diagrams for stock adjustment and checkout.
- [ ] Capture screenshots and descriptions of real completed features.
- [ ] Map each capstone rubric item to concrete source evidence and a test/demo.

## Security / engineering

- [x] Static source review identified missing explicit access checks on dashboard orders endpoints; the evaluation-readiness branch adds checks.
- [ ] Run authenticated and unauthenticated integration checks for all dashboard API endpoints.
- [ ] Check every write operation for permission enforcement, input validation and correct failure codes.
- [ ] Remove or strictly isolate test authentication bypass from any deployed build.
- [ ] Replace the simulated card flow with a properly isolated demo payment mode; never collect real payment card details.
- [ ] Review stock reservation and order-confirmation atomicity, idempotency and insufficient-stock behavior.
- [ ] Check for uncommitted secrets, client data and external storage references.

## Reproducibility / tests

- [ ] Verify `pnpm install`, migration, demo seed and first login on a clean machine.
- [ ] Record the actual output of `pnpm typecheck`, `pnpm lint`, `pnpm build`.
- [ ] Add automated unit/integration tests for inventory and permission checks.
- [ ] Verify end-to-end happy path and failure path with **test-only** data.
- [ ] Document limitations separately from successfully tested behavior.

## Git / progression evidence

- [x] Observed imported baseline and historical dates documented without altering existing history.
- [ ] Obtain redacted pre-import evidence if sharing is allowed: original Git logs, tickets, designs, and approvals.
- [ ] Use separate task branches and accurately dated commits for *new* work.
- [ ] Merge after review and verification, preserving the original history.

**Not a claim of completion:** Items above that are pending should remain pending until evidence exists.
