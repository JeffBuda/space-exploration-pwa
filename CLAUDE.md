# Agent Instructions — Space Exploration PWA

## Code Quality Principles

All code MUST adhere to these principles:

### SOLID

- **Single Responsibility**: Each component, hook, function, or class does one thing. Split large components into smaller, focused ones.
- **Open/Closed**: Extend behavior via composition/new code, not by modifying existing working code.
- **Liskov Substitution**: Subtypes must be substitutable for their base types; prefer interfaces over concrete types.
- **Interface Segregation**: Many small, specific interfaces > one large interface. Props/state split by consumer needs.
- **Dependency Inversion**: Depend on abstractions (interfaces, hooks), not concretions. Inject dependencies via props/context.

### DRY (Don't Repeat Yourself)

- Extract repeated logic into shared hooks, utilities, or components.
- Avoid copy-pasted JSX/CSS/className patterns — create reusable UI primitives.
- Centralize constants, type definitions, and configuration in `src/lib/`.

### Small Single-Purpose Components

- Components render one conceptual UI piece. Target ≤ 60 lines per component function.
- Prefer many small components over few large ones.
- Co-locate related small components in the same file/directory.
- Use `src/components/ui/` for shared primitives (Button, Drawer, etc.).
- Use `src/components/` feature folders for domain-specific components.

### Enforced Budgets (ESLint)

- Shared UI primitives (`src/components/**`): ≤ 60 lines / complexity ≤ 10 / depth ≤ 4 per function.
- App & lib functions (excluding stories): ≤ 200 lines / complexity ≤ 20 / depth ≤ 5 per function.
- Storybook demo files: ≤ 400 lines / complexity ≤ 30 / depth ≤ 6 (refactor demos toward shared patterns).
- No `any`, no duplicate imports, no unstable nested components, required `jsx-key`.

## Mandatory Pre-Completion Checklist

Before declaring work complete, **every agent MUST run** and pass:

```bash
npm run lint      # ESLint (must exit 0, no errors)
npm run format    # Prettier (must exit 0, no changes)
npm run typecheck # TypeScript (must exit 0, no errors)
```

- Fix all lint errors and formatting issues before finishing.
- CI/CD (`.github/workflows/ci.yml`) runs these exact checks on every PR to `main` — a failing check blocks merge.
- If you modify code, run the checklist locally first.

## Project Structure Reference

```
src/
├── components/
│   ├── ui/           # Shared primitives (Button, Drawer, etc.) — small, single-purpose
│   └── game/         # Game feature components (TopHudBar, CommandDrawer, CargoHoldList, ElementSelector, MiningControls, CodexProgress, StarMapBackground) — small, presentational
├── hooks/
│   ├── useGame.ts        # React binding for pure game state (useReducer + bound actions)
│   └── useCadenceClicker.ts # Shared cadence-scaling clicker hook for demos
├── lib/
│   ├── elements.ts       # Periodic table data (constants only)
│   ├── game.ts           # Pure game logic (types, constants, pure functions)
│   ├── gameState.ts      # Pure state shape + reducer + selectors (no React)
│   └── utils.ts          # Shared utilities (cn, etc.)
├── stories/              # Storybook stories (isolated component demos)
├── App.tsx               # Thin shell — wires useGame hook + composes components
└── main.tsx              # Entry point
```

## Adding New Components

1. Create small, single-purpose components in `src/components/ui/` or feature folder.
2. Export from the component file; import where needed.
3. Write a Storybook story in `src/stories/<feature>/ComponentName.stories.tsx`.
4. Run the pre-completion checklist.

## TypeScript Standards

- Strict mode enabled (`tsconfig.json`).
- No `any` — use proper types, generics, or `unknown`.
- Prefer `interface` for object shapes; `type` for unions/primitives.
- Use `readonly` for immutable data structures.
