# Gironimo Website

## Deployment
- Deployed to GitHub Pages.
- CSV loaded at runtime from `/results/leaderboard.csv`.

## Architecture
- **Store**: Single global state, reducer-based updates, localStorage persistence.
- **Features**: Isolated, communicate only via store.
- **Error Handling**: Graceful degradation for missing/corrupt data.

## Features
- Philosophy Explorer: Multi-select, category filtering.
- Leaderboard: CSV-driven, sortable, row selection.
- Workflow System: Stage-based, modal integration.
- Mascot: State-driven, behavior tree.

## Build
- No build tooling required.
