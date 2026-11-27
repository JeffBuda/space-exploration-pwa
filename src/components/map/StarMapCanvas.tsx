/* eslint-disable react-hooks/refs */
import { useMemo, type RefObject } from 'react';
import { useStarMapViewport } from '@/hooks/useStarMapViewport';
import { lyToCanvasPx } from '@/engine/constants';
import type {
  ActiveTransitVisual,
  MapInteractionMode,
  RouteEdge,
  StarNode,
  ViewportTransform,
} from '@/engine/mapTypes';
import { MapModeSwitcher } from './MapModeSwitcher';
import { ZoomControls } from './ZoomControls';
import { RouteEdgeLayer } from './RouteEdgeLayer';
import { StarNodeView } from './StarNodeView';
import { TransitMarker } from './TransitMarker';
import { RecenterButton } from './RecenterButton';

export interface StarMapCanvasProps {
  nodes: Record<string, StarNode>;
  edges: RouteEdge[];
  currentLocationId: string;
  activeRoute: string[];
  mode: MapInteractionMode;
  inspectedNodeId: string | null;
  activeTransit?: ActiveTransitVisual | null;
  onModeChange: (mode: MapInteractionMode) => void;
  onEditModeNodeTap: (nodeId: string) => void;
  onInfoModeNodeTap: (nodeId: string) => void;
  initialZoom?: number;
}

/** Interactive Star Map: pan/pinch, zoom, auto-center, mode switcher, re-center button. */
// eslint-disable-next-line max-lines-per-function
export function StarMapCanvas(props: StarMapCanvasProps) {
  const {
    nodes,
    edges,
    currentLocationId,
    activeRoute,
    mode,
    inspectedNodeId,
    activeTransit = null,
    onModeChange,
    onEditModeNodeTap,
    onInfoModeNodeTap,
    initialZoom = 1,
  } = props;

  const viewport = useStarMapViewport({ nodes, currentLocationId, initialZoom });
  const anchoredChain = useMemo(
    () => [currentLocationId, ...activeRoute],
    [currentLocationId, activeRoute]
  );

  const handleNodeTap = (nodeId: string) => {
    if (viewport.shouldIgnoreTap()) return;
    if (mode === 'info') {
      onInfoModeNodeTap(nodeId);
    } else {
      onEditModeNodeTap(nodeId);
    }
  };

  const showLabels = viewport.showLabels;

  const transitMarker = useMemo(() => {
    if (!activeTransit) return null;
    const from = nodes[activeTransit.fromNodeId];
    const to = nodes[activeTransit.toNodeId];
    if (!from || !to) return null;
    const prog = Math.min(1, Math.max(0, activeTransit.progressRatio));
    const transform: ViewportTransform = {
      x: lyToCanvasPx(from.x + (to.x - from.x) * prog),
      y: lyToCanvasPx(from.y + (to.y - from.y) * prog),
      scale: 1,
    };
    return {
      x: transform.x,
      y: transform.y,
      fromNodeId: activeTransit.fromNodeId,
      toNodeId: activeTransit.toNodeId,
    };
  }, [activeTransit, nodes]);

  const onPointerDown = viewport.handlePointerDown;
  const onPointerMove = viewport.handlePointerMove;
  const onPointerUp = viewport.handlePointerUp;
  const onPointerCancel = viewport.handlePointerUp;
  const zoomBy = viewport.zoomBy;
  const recenterOnShip = viewport.recenterOnShip;

  return (
    <div
      ref={viewport.containerRef as unknown as RefObject<HTMLDivElement>}
      data-testid="star-map-canvas"
      className="relative h-full w-full touch-none select-none overflow-hidden bg-background font-sans text-foreground"
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={onPointerUp}
      onPointerCancel={onPointerCancel}
    >
      <MapModeSwitcher mode={mode} onModeChange={onModeChange} />
      <ZoomControls scale={viewport.transform.scale} onZoom={zoomBy} />
      <svg className="h-full w-full">
        <g
          transform={`translate(${viewport.transform.x}, ${viewport.transform.y}) scale(${viewport.transform.scale})`}
        >
          <RouteEdgeLayer
            edges={edges}
            nodes={nodes}
            anchoredChain={anchoredChain}
            showLabels={showLabels}
          />
          {Object.values(nodes).map((node) => {
            const isCurrent = node.id === currentLocationId;
            const isSelected = activeRoute.includes(node.id);
            const isInspected = node.id === inspectedNodeId;
            return (
              <StarNodeView
                key={node.id}
                node={node}
                isCurrent={isCurrent}
                isSelected={isSelected}
                isInspected={isInspected}
                showLabels={showLabels}
                hitSlopSize={viewport.hitSlopSize}
                onNodeTap={handleNodeTap}
                showShipAura={transitMarker === null}
              />
            );
          })}
          {transitMarker && <TransitMarker transit={activeTransit!} nodes={nodes} />}
        </g>
      </svg>
      <RecenterButton onClick={recenterOnShip} />
    </div>
  );
}
