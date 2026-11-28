---
name: pr-audit-handoff
description: Post-implementation audit and Principal Dev handoff generator. Invoke after completing any feature or bugfix in T3 Code to verify zero AI slop, enforce architectural rules, run all quality gates, and produce a clean, copy-pasteable audit bundle for the Principal Dev (Hydrogen) to cross-check against the Living Design & Architecture Bible.
---

# Post-Implementation Audit & Principal Dev Handoff

Execute this workflow **immediately after finishing implementation** and **before** concluding your turn or opening a PR. Do not skip any step.

---

## Step 1: Automated Quality & Anti-Slop Gates

Run the repository's verification commands sequentially and fix any failures before proceeding:

1. **TypeScript Strict Check:**

   ```bash
   npx tsc --noEmit
   ```

2. **Unit & Component Tests (Vitest):**

   ```bash
   npm run test -- --run
   ```

3. **Dead Code & Unused Export Check (Knip, if configured):**

   ```bash
   npx knip || true
   ```

4. **Build Verification:**

   ```bash
   npm run build
   ```

---

## Step 2: Hard Exclusion ("AI Slop") Grep Audit

Scan all modified and newly created files (`git diff --name-only HEAD`) to verify **zero** unapproved mechanics or stack drift were introduced. Fail and remove immediately if any of the following appear in `src/`:

- **Forbidden Frameworks:** SolidJS (`solid-js`), Kobalte (`@kobalte`), or Corvu (`corvu`)
- **Forbidden Mechanics:** Ship upgrades (engine, hull, shield, weapon, scanner, or cargo upgrades), alien relics, synthetic/refined alloys, Dark Matter, Overflow Reserve Energy, consumable time-skip chips
- **Forbidden Storage/Timers:** `localStorage` for game save data (must use IndexedDB `space_idle_db`), `setInterval` for core game progression timers
- **Forbidden Data Rules:** Cargo capacity caps (Cargo Hold is unlimited), fractional/decimal Credits (Credits must use integer `Math.floor`)
- **Architectural Boundary Check:** Verify `src/engine/` contains zero React imports (`react`, `react-dom`, `vaul`, `lucide-react`) and mutates zero input state objects.

---

## Step 3: Inspect Git Diff & Working Tree

Gather exact evidence of every change made in this branch/worktree:

```bash
git status -s
git diff --stat
git diff src/engine/ src/types/
```

If any new files were created in `src/engine/`, `src/types/`, or `src/components/`, read their full contents so they can be included in the handoff report.

---

## Step 4: Output the Principal Dev Handoff Bundle

Format your final response using the exact structure below so the Designer can paste it directly to the Principal Dev (Hydrogen) for line-by-line verification against the **Living Design & Architecture Bible**:

```markdown
## 🔍 Principal Dev Audit Bundle

### 1. Verification Gate Results

- `tsc --noEmit`: [PASS / FAIL]
- `vitest`: [PASS (X/Y tests) / FAIL]
- `build`: [PASS / FAIL]
- **Anti-Slop Audit:** [CLEAN — 0 forbidden mechanics, 0 engine/UI boundary leaks]

### 2. Changed & Created Files (`git diff --stat`)

<paste exact git status -s and git diff --stat output>

### 3. Engine & Type Diffs (`src/engine/` & `src/types/`)

<paste full git diff or full contents of new files in src/engine/ and src/types/>

### 4. UI / Component Summary (`src/components/` & `src/stories/`)

- **Files touched:** <list files>
- **State consumed:** <list exact GameState fields read>
- **Actions dispatched:** <list exact pure engine functions called>
- **Intentional omissions / edge cases deferred:** <explicitly list anything not implemented>
```

**Strict Rule:** Never summarize code changes vaguely ("updated engine logic and added UI"). Always include the verbatim diffs/code for `src/engine/` and `src/types/` so the Principal Dev can audit every line against the Google Doc specification.
