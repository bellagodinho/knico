# Relational design (the SQL view)

Dexie stores these shapes as JSON objects, but thinking in tables teaches the concepts.

```sql
CREATE TABLE pattern (id INTEGER PRIMARY KEY, title TEXT NOT NULL, designer TEXT, craft TEXT NOT NULL,
  source TEXT NOT NULL, ravelry_id INTEGER, file_id INTEGER REFERENCES file(id), notes TEXT, created_at INTEGER);

-- One pattern, many projects (one-to-many): the foreign key lives on the "many" side.
CREATE TABLE project (id INTEGER PRIMARY KEY, name TEXT NOT NULL, craft TEXT NOT NULL, status TEXT NOT NULL,
  pattern_id INTEGER REFERENCES pattern(id), notes TEXT, created_at INTEGER, updated_at INTEGER);

CREATE TABLE counter (id INTEGER PRIMARY KEY, project_id INTEGER NOT NULL REFERENCES project(id),
  label TEXT, value INTEGER, step INTEGER, target INTEGER);

-- Append-only event log: never updated, only added. Activity stats are queries over it.
CREATE TABLE counter_event (id INTEGER PRIMARY KEY, counter_id INTEGER, project_id INTEGER, delta INTEGER, at INTEGER);

-- Day 2. Projects use many yarns and a yarn serves many projects (many-to-many): a junction table.
CREATE TABLE project_yarn (project_id INTEGER REFERENCES project(id), yarn_id INTEGER REFERENCES yarn(id),
  meters_used REAL, PRIMARY KEY (project_id, yarn_id));
```

Indexes (the fields listed in `db.ts`) make lookups and sorting fast; each one costs write time and space, so index only what you query.
