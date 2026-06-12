# Gironimo 🦒

A static, single-page website that showcases an **AI model leaderboard** with a
philosophy explorer, an interactive workflow, and a state-driven giraffe mascot.

The site is built per the **Gironimo Bench specification**: it runs entirely
client-side, fetches its data from a CSV at runtime, and uses a single
centralized store as the only source of truth.

---

## Deployment

This site is built to deploy to **GitHub Pages** as a static site.

### File structure (after deployment)

```
/ (GitHub Pages root)
├── index.html         ← optional landing redirect
├── minimax-m3/        ← this implementation
│   ├── index.html
│   ├── app.js
│   ├── styles.css
│   ├── imgs/
│   │   └── favicon.svg
│   └── README.md
└── results/
    └── leaderboard.csv    ← loaded at runtime
```

### GitHub Pages setup

1. Push this repository to GitHub.
2. Go to **Settings → Pages**.
3. Set the source to **Deploy from a branch** → `main` (or default) →
   **`/docs`** folder.
4. GitHub Pages will serve `/docs` at
   `https://<user>.github.io/<repo>/`.
5. The app's CSV will be reachable at
   `https://<user>.github.io/<repo>/results/leaderboard.csv`,
   which is exactly the path the app fetches (`/results/leaderboard.csv`).

### Runtime CSV loading

The app **never** inlines the leaderboard data. On boot it issues

```js
fetch('/results/leaderboard.csv', { cache: 'no-store' })
```

The CSV is parsed with a small RFC 4180-compatible parser. Invalid rows are
dropped, missing numeric fields default to `0`, and missing model names cause
the row to be discarded. If the file is missing, corrupted, or empty, the UI
shows a graceful "Could not load leaderboard" message — it never crashes.

### CSV format

```csv
model,date,video_url,result_url,speed,one_shot_attempts,design,architecture,code_quality,feature_complete,performance,accessibility,best_practices,value,overall_score
```

The first row must be the header (in this order). Numeric fields may be left
blank (treated as `0`). The `model` column is required; rows with a blank
`model` are skipped.

---

## Architecture

### Build tooling

**None.** This project uses plain HTML, CSS, and JavaScript — no bundler, no
transpiler, no package manager. Everything is hand-written to be readable and
auditable. To make a change, edit the file and refresh the page.

### Store design

There is exactly one global store, exposed as a closure-private object inside
`app.js` (also reachable from dev tools via `window.__gironimo.store` for
debugging).

```
                 ┌──────────────────────────────────────────────┐
   UI events ──▶ │  store.dispatch(action)                      │
                 │     └─ queues action; schedules a microtask   │
                 ├──────────────────────────────────────────────┤
                 │  microtask: flush                           │
                 │     └─ runs all queued actions through       │
                 │        the reducer → produces nextState     │
                 │     └─ persists the persisted slice          │
                 │     └─ notifies subscribers                  │
                 ├──────────────────────────────────────────────┤
                 │  render() (the only subscriber)              │
                 │     └─ reads store.getState()                │
                 │     └─ does ONE DOM commit                   │
                 └──────────────────────────────────────────────┘
```

**Key properties:**

* **Single source of truth.** No module owns its own copy of `theme`,
  `selectedModel`, `selectedPhilosophyStatements`, `workflowState`, or
  `leaderboardData`. Components receive data via the render function, which
  reads from the store on every commit.
* **Reducer-based updates.** State transitions are pure functions of
  `(state, action) → state`. The reducer never reads from the DOM, from
  `localStorage`, or from the network.
* **Subscription-based UI updates.** `render()` is the only subscriber. It
  re-runs after every state change.
* **Atomic update rule.** All actions dispatched in the same JS tick are
  batched and applied in a single `queueMicrotask` flush, producing exactly
  one render. There are no intermediate render states visible to the user.
* **Derived state rule.** Sorting, filtering, philosophy highlighting, the
  workflow progress cap, and the top-performer badge are all computed inside
  `render()` (via small `derive*` helpers). They are never stored, so the
  store cannot drift out of sync with the data.
* **Isolation rule.** Features do not call each other. The mascot does not
  poke the leaderboard; the leaderboard does not push to the workflow. They
  all subscribe to the same store. Cross-feature effects happen because one
  action causes a new state, which the next render of every feature observes.
* **Persistence.** A subset of the state (`theme`, selection, model,
  workflow, category filter) is saved to `localStorage` under
  `gironimo-state-v1`. Reads and writes are wrapped in `try/catch` and the
  data is JSON-validated; if it is missing or corrupt, the store falls back
  to defaults silently.

### Trigger → Effect Map (integration through the store)

| Trigger              | Action                            | Effects (computed in render)                                          |
| -------------------- | --------------------------------- | ---------------------------------------------------------------------- |
| Philosophy selection | `philosophy/toggle`               | mascot → `orienting_philosophy`; leaderboard row highlighting          |
| Model selection      | `model/select`                    | workflow progress cap derived; mascot → `orienting_model`; notification|
| Theme change         | `theme/set`                       | mascot → `theme_changing` (briefly); data-theme attribute on `<html>`  |
| Stage click          | `workflow/openModal`              | modal renders model metadata + philosophy context                      |

### Mascot state machine

The mascot is always visible. Its behavior is determined by a finite-state
machine whose current state lives in `state.mascotBehavior`:

| State                  | Trigger                                       | Visual                                       |
| ---------------------- | --------------------------------------------- | -------------------------------------------- |
| `idle`                 | default                                       | subtle sway                                  |
| `orienting_philosophy` | philosophy selected                           | tilts toward philosophy list                 |
| `orienting_model`      | model selected                                | tilts toward the selected row                |
| `theme_changing`       | theme toggle                                  | brief brightness pulse                       |
| `workflow_hover`       | hovering/focusing a workflow stage            | tilts toward the workflow panel              |

Transitions are driven entirely by store actions; the mascot code never reads
DOM positions from other features.

### Error handling

The app degrades — it does not crash — under all of the following:

* Missing CSV → status text explains the failure; table is empty; the rest of
  the app remains usable.
* Corrupted CSV → same as missing CSV (parser throws are caught).
* Empty dataset → leaderboard shows "No data yet".
* Corrupted `localStorage` → ignored; defaults are used.
* Rapid state updates → coalesced into a single render per tick.
* Subscription throws → caught and logged so a single broken feature cannot
  freeze the page.

### Accessibility

* WCAG AA color contrast in both light and dark themes.
* Visible focus rings on every interactive element (`*:focus-visible`).
* Skip-link to main content.
* ARIA: `role="dialog"`, `aria-modal`, `aria-pressed`, `aria-selected`,
  `role="status"` for notifications, `aria-live` for the philosophy counter
  and mascot state.
* Full keyboard support: tab through statements, leaderboard rows, stages,
  modal close, theme toggle; `Enter`/`Space` activates leaderboard rows.
* `prefers-reduced-motion` disables the idle sway and reduces transitions.

### Performance

* Sorting/filtering happens in-memory over at most 20+ rows.
* The single render is a `replaceChildren` of precomputed nodes — no
  string-based template regeneration, no per-cell event listener churn.
* The leaderboard table is virtualized in spirit: only the visible rows are
  mounted, and the CSV is parsed once on load.

---

## Local development

You can open `index.html` directly in a browser **only if** the `/results/`
path is served from the same origin. The simplest local server is:

```bash
cd docs
python3 -m http.server 8000
# then open http://localhost:8000/minimax-m3/
```

For GitHub Pages, no server is needed; the static files are served as-is.

---

## License

The spec is evaluator-provided. This implementation is released as part of
the Gironimo benchmark submission.
