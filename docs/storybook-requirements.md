# Storybook Sub-URL Requirement

## Overview

The game will be deployed to the root of the GitHub Pages site. A separate sub-URL will host Storybook, which serves as the canonical reference for the look and feel of the app.

## URL Layout

| Asset | URL |
|-------|-----|
| Game | `/` |
| Storybook | `/storybook/` |

## Tech Stack

Storybook is based on:

- **shadcn/ui** — unstyled, Tailwind-first component primitives copied
  directly into the repository rather than locking you into a heavy
  dependency.
- **Tailwind CSS** — utility-first styling; 100% freedom to style a dark
  sci-fi HUD.
- **Vaul** — drawer component with iOS draggable bottom-sheet physics and
  explicit snap points.

## Drawer Snap Points

The itinerary drawer must support three explicit snap points matching
the app's itinerary states:

- 15%
- 30%
- 50%

## Why this stack

- shadcn/ui copies clean, unstyled/Tailwind source code directly into
  your repository rather than locking you into a heavy dependency.
- Its Drawer component uses Vaul, which replicates iOS draggable
  bottom-sheet physics and supports explicit snap points (matching your
  15%, 30%, and 50% itinerary states).
- Because it uses standard Tailwind classes, you have 100% freedom to
  style a dark sci-fi HUD, and AI agents write it fluently.

## Future Deployment

When Storybook is configured, the build step must publish the built
Storybook static site to the `/storybook/` path on GitHub Pages so it
is available alongside (but independent of) the game at `/`.
