/**
 * Central game constants and coordinate helpers for the Space Exploration PWA.
 *
 * These values are shared by the Star Map renderer, the anchored route
 * engine, and the Storybook demos. Keep this file free of React or DOM
 * dependencies so it can be used by pure logic tests as well.
 */

export const GAME_CONSTANTS = {
  // ── Economy / energy ──────────────────────────────────────────────────
  ENERGY_PER_LY: 1,
  SECONDS_PER_LY: 60,
  PASSIVE_SOLAR_REGEN_PER_MIN: 1.0,
  INITIAL_CREDITS: 100,
  INITIAL_ENERGY: 100,
  MAX_ENERGY: 100,

  // ── Frontier charting ────────────────────────────────────────────────
  FRONTIER_SCAN_ENERGY_COST: 5,
  FRONTIER_SCAN_DURATION_SECONDS: 120,
  FRONTIER_NODES_PER_SCAN: 2,
  MIN_NODE_SPACING_LY: 1.5,

  // ── Exponential time-skip clicker ────────────────────────────────────
  CLICKER_COMBO_BASE: 1.35,
  CLICKER_DECAY_MS: 800,

  // ── Map viewport ─────────────────────────────────────────────────────
  MIN_MAP_ZOOM: 0.5,
  MAX_MAP_ZOOM: 2.5,
  LABEL_HIDE_ZOOM_THRESHOLD: 0.7,
  PIXELS_PER_LY: 24,
  MIN_TOUCH_TARGET_PX: 44,
  PAN_PADDING_PX: 160,
} as const;

export type GameConstants = typeof GAME_CONSTANTS;

/** Convert light-years to canvas pixels at the canonical map scale. */
export function lyToCanvasPx(lightYears: number): number {
  return lightYears * GAME_CONSTANTS.PIXELS_PER_LY;
}

/** Convert canvas pixels back to light-years at the canonical map scale. */
export function canvasPxToLy(pixels: number): number {
  return pixels / GAME_CONSTANTS.PIXELS_PER_LY;
}
