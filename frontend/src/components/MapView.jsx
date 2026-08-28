import { useState } from 'react';
import { Map } from 'lucide-react';
import { cameras } from '../services/mockData';

// Map coordinates translator to scale lat/lng to SVG space
const MAP_WIDTH = 500;
const MAP_HEIGHT = 300;

// Coordinate bounds
const MIN_LAT = 40.69;
const MAX_LAT = 40.73;
const MIN_LNG = -74.025;
const MAX_LNG = -73.985;

function scaleLatLng(lat, lng) {
  const x = ((lng - MIN_LNG) / (MAX_LNG - MIN_LNG)) * MAP_WIDTH;
  // Invert Y because SVG coordinates start from top-left
  const y = MAP_HEIGHT - ((lat - MIN_LAT) / (MAX_LAT - MIN_LAT)) * MAP_HEIGHT;
  return { x, y };
}

export default function MapView({ data, onInteraction }) {
  const { title = 'GIS Live Tracking Map', markers = [], route = [], compareRoute = [], isHeatmap = false, activeCameraId = null } = data;
  const [hoveredNode, setHoveredNode] = useState(null);

  // Translate all cameras coordinates for drawing roads & grid
  const cameraNodes = cameras.map(cam => {
    const coords = scaleLatLng(cam.lat, cam.lng);
    const markerData = markers.find(m => m.id === cam.id);
    return {
      ...cam,
      ...coords,
      isActive: markerData !== undefined,
      color: markerData?.color || '#aa3bff',
      density: markerData?.density || 0
    };
  });

  // Calculate route lines
  const getPathString = (routePoints) => {
    if (routePoints.length < 2) return '';
    return routePoints.map((pt, idx) => {
      const { x, y } = scaleLatLng(pt.lat, pt.lng);
      return `${idx === 0 ? 'M' : 'L'} ${x} ${y}`;
    }).join(' ');
  };

  const routePath = getPathString(route);
  const compareRoutePath = getPathString(compareRoute);

  return (
    <div className="card-container map-view-card">
      <div className="card-header">
        <div className="header-left">
          <Map size={16} className="text-accent" />
          <span className="card-title">{title}</span>
        </div>
        <div className="header-actions">
          <span className="badge badge-secondary">GIS MODE</span>
        </div>
      </div>

      <div className="map-body-container">
        <div className="map-vector-wrapper">
          <svg
            viewBox={`0 0 ${MAP_WIDTH} ${MAP_HEIGHT}`}
            className="map-vector-svg"
            width="100%"
            height="100%"
          >
            {/* Grid backgrounds */}
            <defs>
              <pattern id="grid" width="25" height="25" patternUnits="userSpaceOnUse">
                <path d="M 25 0 L 0 0 0 25" fill="none" stroke="rgba(255,255,255,0.03)" strokeWidth="1" />
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#grid)" />

            {/* City Grid - Main Roads */}
            <g className="city-roads" stroke="rgba(255,255,255,0.08)" strokeWidth="6" fill="none">
              {/* Main Vertical road */}
              <line x1="80" y1="0" x2="80" y2="300" />
              <line x1="250" y1="0" x2="250" y2="300" />
              <line x1="420" y1="0" x2="420" y2="300" />

              {/* Main Horizontal road */}
              <line x1="0" y1="80" x2="500" y2="80" />
              <line x1="0" y1="200" x2="500" y2="200" />
            </g>

            {/* City Grid - Road Center Dashed Lines */}
            <g className="city-roads-dashed" stroke="rgba(0,0,0,0.4)" strokeWidth="1" strokeDasharray="5,5" fill="none">
              <line x1="80" y1="0" x2="80" y2="300" />
              <line x1="250" y1="0" x2="250" y2="300" />
              <line x1="420" y1="0" x2="420" y2="300" />
              <line x1="0" y1="80" x2="500" y2="80" />
              <line x1="0" y1="200" x2="500" y2="200" />
            </g>

            {/* Heatmap Layer if requested */}
            {isHeatmap && cameraNodes.map(node => {
              if (node.density === 0) return null;
              const radius = Math.min(node.density / 10, 45);
              return (
                <circle
                  key={`heat-${node.id}`}
                  cx={node.x}
                  cy={node.y}
                  r={radius}
                  fill="rgba(239, 68, 68, 0.25)"
                  className="heatmap-glow"
                />
              );
            })}

            {/* Primary Route Path */}
            {routePath && (
              <path
                d={routePath}
                fill="none"
                stroke="#aa3bff"
                strokeWidth="3.5"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="route-line-primary"
              />
            )}

            {/* Primary Route Path Dash Animation */}
            {routePath && (
              <path
                d={routePath}
                fill="none"
                stroke="#d8b4fe"
                strokeWidth="3.5"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeDasharray="10, 15"
                className="route-line-primary-dash"
              />
            )}

            {/* Comparison Route Path */}
            {compareRoutePath && (
              <path
                d={compareRoutePath}
                fill="none"
                stroke="#3b82f6"
                strokeWidth="3.5"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="route-line-secondary"
              />
            )}

            {/* Comparison Route Path Dash */}
            {compareRoutePath && (
              <path
                d={compareRoutePath}
                fill="none"
                stroke="#93c5fd"
                strokeWidth="3.5"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeDasharray="10, 15"
                className="route-line-secondary-dash"
              />
            )}

            {/* Camera Nodes */}
            {cameraNodes.map(node => {
              const isCameraActive = activeCameraId === node.id || node.isActive;
              return (
                <g
                  key={node.id}
                  className="camera-node"
                  transform={`translate(${node.x}, ${node.y})`}
                  onMouseEnter={() => setHoveredNode(node)}
                  onMouseLeave={() => setHoveredNode(null)}
                  onClick={() => onInteraction('zoom_camera', { cameraId: node.id })}
                >
                  {/* Outer active pulse ring */}
                  {isCameraActive && (
                    <circle
                      r="12"
                      fill="none"
                      stroke={node.color}
                      strokeWidth="1.5"
                      className="ping-ring"
                    />
                  )}
                  {/* Camera body circle */}
                  <circle
                    r={isCameraActive ? "6.5" : "4.5"}
                    fill={node.status === 'offline' ? '#4b5563' : isCameraActive ? node.color : '#1e1b4b'}
                    stroke={node.status === 'offline' ? '#9ca3af' : isCameraActive ? '#ffffff' : '#aa3bff'}
                    strokeWidth="1.5"
                    className="camera-dot-inner"
                  />
                  {/* Micro label for zoom */}
                  {isCameraActive && (
                    <text y="-10" textAnchor="middle" fill="#ffffff" fontSize="8" fontFamily="monospace" className="map-node-label">
                      {node.id}
                    </text>
                  )}
                </g>
              );
            })}
          </svg>

          {/* Map Hover Details Box */}
          {hoveredNode && (
            <div
              className="map-tooltip"
              style={{
                left: `${(hoveredNode.x / MAP_WIDTH) * 100}%`,
                top: `${(hoveredNode.y / MAP_HEIGHT) * 100 - 15}%`
              }}
            >
              <div className="tooltip-title">{hoveredNode.name}</div>
              <div className="tooltip-row">
                <span>Status:</span>
                <span className={hoveredNode.status === 'online' ? 'text-success' : 'text-muted'}>
                  {hoveredNode.status.toUpperCase()}
                </span>
              </div>
              <div className="tooltip-row">
                <span>Coordinates:</span>
                <span>{hoveredNode.lat.toFixed(4)}, {hoveredNode.lng.toFixed(4)}</span>
              </div>
            </div>
          )}
        </div>

        {/* Legend Panel */}
        <div className="map-legend">
          <div className="legend-title">MAP GIS LEGEND</div>
          <div className="legend-items">
            <div className="legend-item">
              <span className="dot dot-purple"></span>
              <span>Primary Trace ({route.length > 0 ? 'MH12AB1234' : 'N/A'})</span>
            </div>
            {compareRoute.length > 0 && (
              <div className="legend-item">
                <span className="dot dot-blue"></span>
                <span>Compare Trace (DL3CAQ5678)</span>
              </div>
            )}
            <div className="legend-item">
              <span className="dot dot-hollow"></span>
              <span>CCTV Grid Node</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
