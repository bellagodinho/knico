# Lesson 2: Projects and counters (concepts, not syntax)

**1. Repository functions are the app's vocabulary.** `createProject`, `bump`, `deleteProject`: screens say what they want, not how storage works. Rules like "never below zero" and "when do reminders fire" live in one place, so they can be tested and changed once.

**2. Atomic read-modify-write.** `bump` reads the value inside the transaction. Two fast taps can't overwrite each other, and the counter and its event log can never disagree. Any "read, change, write" on shared data should be one transaction.

**3. Append-only history.** Undo is a tap in the other direction, not a deleted row. The log keeps the full story, and the activity tracker later needs no new data.

**4. Derived beats stored.** Reminders are computed from the value and the rules. There is no "already fired" flag to get out of sync. If you can compute it, don't store it.

**5. Optional fields vs migrations.** `reminders` is new, but it isn't indexed, so no schema version bump is needed. Old records simply lack it, so code reads `?? []`. Only changes to indexes need a new version.

**6. Platform limits shape the design.** No vibration on iPhone, so reminders use a banner and a beep. Audio must be unlocked inside a tap. The browser drops the screen lock when the page is hidden, so we re-acquire it. Check the platform before you design the feature.

**7. Cascades.** Deleting a project deletes its counters and events in one transaction: all or nothing, no orphans.
