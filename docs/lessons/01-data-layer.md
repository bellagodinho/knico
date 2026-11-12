# Lesson 1: The data layer

**1. Repository boundary.** Screens never talk to IndexedDB directly; they go through `src/db/`. Swap the storage engine later and only that folder changes.

**2. Schema versions are append-only.** A shipped version is frozen. A change becomes version 2 with a migration, because real data already exists on real devices. Same rule as database migrations at any company.

**3. Canonical units.** Store metric, convert at the edges (display and input). One truth in the database, many presentations. Converting in storage creates rounding drift and bugs.

**4. UI is a function of the database.** `useLiveQuery` re-renders when data changes, so there is no manual "refresh" code. Fewer states to keep in sync means fewer bugs.

**5. Backups are your sync.** Local-first means no cloud safety net, so the export is a core feature. Version the file format, validate before restoring, and make restore atomic (one transaction: all or nothing).

**6. Destructive actions.** Restore replaces data, so it asks first and fails safely. Whenever an action can lose data, ask what happens if it dies halfway.

**7. Event logs.** Rather than only storing "row 42", log every tap. State is derivable from events; the reverse is impossible. That is why the activity tracker will be cheap later.
