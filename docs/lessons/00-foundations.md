# Lesson 0: Foundations (concepts, not syntax)

**1. Layers.** UI, state, data, platform. Each layer talks only to the one below it. That is why we can swap the database later (SQLite or IndexedDB) by changing one layer, not every screen.

**2. Local-first.** Your data lives on the device: private, free, works offline. The price: no automatic sync, and browsers can evict storage. So backups are a core feature, not an extra.

**3. Spikes.** Before building on an assumption (can iPhone keep the screen awake? can the browser call Ravelry?), run a small throwaway test on the real device. The Diagnostics tab is that. A day of spikes beats a week of rework.

**4. Secrets in front-end apps.** Anything shipped to the browser is public. So no keys in the code or repo. Users type their own key in a settings screen. Use the least powerful key that does the job (read-only for patterns).

**5. CI/CD.** Push to GitHub, a workflow builds and deploys. The workflow file is the contract for how the app ships. The lockfile (`package-lock.json`, created by your first `npm install`) makes builds reproducible: commit it.

**6. Design tokens.** Colors and fonts are named variables (`--bg`, `--accent`). A theme is just a different set of values, so dark mode is cheap and consistent.

**7. Working with AI.** The AI writes code; you own the decisions and the verification. Habits that matter: state constraints up front, ask for the trade-offs, run it on the real device, and read diffs before committing.
