# Gironimo Website

## Deployment
- Deployed to GitHub Pages.
- CSV loaded at runtime from `/results/leaderboard.csv`.

## Architecture
- **Store**: Single global state, reducer-based updates, localStorage persistence.
- **Features**: Isolated, communicate only via store.
- **Error Handling**: Graceful degradation for missing/corrupt data.

## Features
- **Philosophy Explorer**: Multi-select, category filtering.
- **Leaderboard**: CSV-driven, sortable, row selection.
- **Workflow System**: Stage-based, modal integration.
- **Mascot**: State-driven, behavior tree.

## Build
- No build tooling required.
- All assets are inline or referenced locally.

## How to Run
1. Place all files in `/docs/<model-name>/` on your GitHub repo.
2. Enable GitHub Pages for the `docs` folder.
3. Ensure `/results/leaderboard.csv` is accessible at runtime.
