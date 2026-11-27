import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type PointerEvent as ReactPointerEvent,
  type RefObject,
} from 'react';
import { GAME_CONSTANTS, lyToCanvasPx } from '@/engine/constants';
import type { StarNode, ViewportTransform } from '@/engine/mapTypes';

/** Options passed to the hook. */
export interface UseStarMapViewportOptions {
  /** Nodes to render on the map. */
  nodes: Record<string, StarNode>;
  /** The id of the current/active ship location. */
  currentLocationId: string;
  /** Optional initial zoom; defaults to 1.0. */
  initialZoom?: number;
}

/** API surface returned by the hook. */
export interface StarMapViewportApi {
  /** Ref attached to the outer container div. */
  containerRef: RefObject<HTMLDivElement | null>;
  /** Current viewport size in CSS pixels (updated on ResizeObserver). */
  viewportSize: { width: number; height: number };
  /** Current pan/zoom transform. */
  transform: ViewportTransform;
  /** Whether labels are shown (based on zoom threshold). */
  showLabels: boolean;
  /** Counter-scaled minimum touch target size in px. */
  hitSlopSize: number;
  /** Re-center the viewport on the ship. */
  recenterOnShip: () => void;
  /** Zoom the viewport by a delta (clamped to min/max). */
  zoomBy: (delta: number) => void;
  /** Pointer down handler — start panning / pinch. */
  handlePointerDown: (e: ReactPointerEvent<HTMLDivElement>) => void;
  /** Pointer move handler — pan or pinch. */
  handlePointerMove: (e: ReactPointerEvent<HTMLDivElement>) => void;
  /** Pointer up / cancel handler. */
  handlePointerUp: (e: ReactPointerEvent<HTMLDivElement>) => void;
  /** True when the pointer moved more than the tap threshold (pan gesture). */
  shouldIgnoreTap: () => boolean;
}

/** Initial viewport size used before the container is measured. */
const INITIAL_VIEWPORT_SIZE = { width: 390, height: 560 };
const TAP_TOLERANCE_PX = 8;

/** Simple bounds for clamping panning. */
interface WorldBounds {
  minX: number;
  maxX: number;
  minY: number;
  maxY: number;
}

function computeWorldBounds(nodes: Record<string, StarNode>): WorldBounds {
  const list = Object.values(nodes);
  if (list.length === 0) return { minX: -200, maxX: 200, minY: -200, maxY: 200 };
  let minX = Infinity;
  let maxX = -Infinity;
  let minY = Infinity;
  let maxY = -Infinity;
  for (const n of list) {
    const px = lyToCanvasPx(n.x);
    const py = lyToCanvasPx(n.y);
    if (px < minX) minX = px;
    if (px > maxX) maxX = px;
    if (py < minY) minY = py;
    if (py > maxY) maxY = py;
  }
  return { minX, maxX, minY, maxY };
}

/**
 * Interactive Star Map viewport: pan / pinch-to-zoom, bounding-box clamp,
 * initial auto-centering on the ship, label visibility threshold, and
 * counter-scaled minimum touch hitboxes.
 */
export function useStarMapViewport({
  nodes,
  currentLocationId,
  initialZoom = 1,
}: UseStarMapViewportOptions): StarMapViewportApi {
  const containerRef = useRef<HTMLDivElement>(null);
  const [viewportSize, setViewportSize] = useState(INITIAL_VIEWPORT_SIZE);
  const [transform, setTransform] = useState<ViewportTransform>({
    x: INITIAL_VIEWPORT_SIZE.width / 2,
    y: INITIAL_VIEWPORT_SIZE.height * 0.45,
    scale: initialZoom,
  });

  const hasInitializedCenter = useRef(false);
  const activePointers = useRef(new Map<number, { x: number; y: number }>());
  const lastPinchDist = useRef<number | null>(null);
  const pointerMovedDistance = useRef<number>(0);

  // ── World bounds ───────────────────────────────────────────────────────
  const worldBounds = useMemo(() => computeWorldBounds(nodes), [nodes]);

  // ── Clamp transform within pan bounds ───────────────────────────────────
  const clampTransform = useCallback(
    (next: ViewportTransform): ViewportTransform => {
      const scale = Math.min(
        Math.max(next.scale, GAME_CONSTANTS.MIN_MAP_ZOOM),
        GAME_CONSTANTS.MAX_MAP_ZOOM
      );
      const pad = GAME_CONSTANTS.PAN_PADDING_PX;
      const minTranslateX = viewportSize.width - pad - worldBounds.maxX * scale;
      const maxTranslateX = pad - worldBounds.minX * scale;
      const minTranslateY = viewportSize.height - pad - worldBounds.maxY * scale;
      const maxTranslateY = pad - worldBounds.minY * scale;

      const x =
        minTranslateX <= maxTranslateX
          ? Math.min(Math.max(next.x, minTranslateX), maxTranslateX)
          : (minTranslateX + maxTranslateX) / 2;
      const y =
        minTranslateY <= maxTranslateY
          ? Math.min(Math.max(next.y, minTranslateY), maxTranslateY)
          : (minTranslateY + maxTranslateY) / 2;

      return { x, y, scale };
    },
    [viewportSize, worldBounds]
  );

  // ── Re-center on ship ──────────────────────────────────────────────────
  const recenterOnShip = useCallback(() => {
    const shipNode = nodes[currentLocationId];
    if (!shipNode) return;
    setTransform(
      clampTransform({
        x: viewportSize.width / 2 - lyToCanvasPx(shipNode.x) * transform.scale,
        y: viewportSize.height * 0.45 - lyToCanvasPx(shipNode.y) * transform.scale,
        scale: transform.scale,
      })
    );
  }, [nodes, currentLocationId, viewportSize, transform, clampTransform]);

  const zoomBy = useCallback(
    (delta: number) => {
      setTransform((t) => clampTransform({ ...t, scale: t.scale + delta }));
    },
    [clampTransform]
  );

  // ── ResizeObserver: measure container + initial centering ───────────────
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const ro = new ResizeObserver((entries) => {
      const entry = entries[0];
      if (entry.contentRect.width > 0 && entry.contentRect.height > 0) {
        setViewportSize({
          width: entry.contentRect.width,
          height: entry.contentRect.height,
        });
      }
      if (!hasInitializedCenter.current) {
        hasInitializedCenter.current = true;
        const shipNode = nodes[currentLocationId];
        if (shipNode) {
          setTransform({
            x: entry.contentRect.width / 2 - lyToCanvasPx(shipNode.x),
            y: entry.contentRect.height * 0.45 - lyToCanvasPx(shipNode.y),
            scale: initialZoom,
          });
        }
      }
    });
    ro.observe(el);
    return () => ro.disconnect();
  }, [nodes, currentLocationId, initialZoom]);

  // ── Derived display values ─────────────────────────────────────────────
  const showLabels = transform.scale >= GAME_CONSTANTS.LABEL_HIDE_ZOOM_THRESHOLD;
  const hitSlopSize = Math.max(
    GAME_CONSTANTS.MIN_TOUCH_TARGET_PX,
    Math.ceil(GAME_CONSTANTS.MIN_TOUCH_TARGET_PX / transform.scale)
  );

  // ── Pointer handlers ───────────────────────────────────────────────────
  const handlePointerDown = useCallback((e: ReactPointerEvent<HTMLDivElement>) => {
    (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
    activePointers.current.set(e.pointerId, { x: e.clientX, y: e.clientY });
    pointerMovedDistance.current = 0;
  }, []);

  const handlePointerMove = useCallback(
    (e: ReactPointerEvent<HTMLDivElement>) => {
      if (!activePointers.current.has(e.pointerId)) return;
      const prev = activePointers.current.get(e.pointerId)!;
      const dx = e.clientX - prev.x;
      const dy = e.clientY - prev.y;
      pointerMovedDistance.current += Math.hypot(dx, dy);
      activePointers.current.set(e.pointerId, { x: e.clientX, y: e.clientY });

      if (activePointers.current.size === 1) {
        setTransform((t) => clampTransform({ ...t, x: t.x + dx, y: t.y + dy }));
      } else if (activePointers.current.size === 2) {
        const pts = Array.from(activePointers.current.values());
        const dist = Math.hypot(pts[0].x - pts[1].x, pts[0].y - pts[1].y);
        if (lastPinchDist.current !== null && lastPinchDist.current > 0) {
          const factor = dist / lastPinchDist.current;
          setTransform((t) => clampTransform({ ...t, scale: t.scale * factor }));
        }
        lastPinchDist.current = dist;
      }
    },
    [clampTransform]
  );

  const handlePointerUp = useCallback((e: ReactPointerEvent<HTMLDivElement>) => {
    activePointers.current.delete(e.pointerId);
    if (activePointers.current.size < 2) {
      lastPinchDist.current = null;
    }
  }, []);

  const shouldIgnoreTap = useCallback(() => pointerMovedDistance.current > TAP_TOLERANCE_PX, []);

  return {
    containerRef,
    viewportSize,
    transform,
    showLabels,
    hitSlopSize,
    recenterOnShip,
    zoomBy,
    handlePointerDown,
    handlePointerMove,
    handlePointerUp,
    shouldIgnoreTap,
  };
}
