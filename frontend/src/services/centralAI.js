import { vehicles, cameras, alerts, trafficStats } from './mockData';

// Helper to find plate in text
function extractPlate(text) {
  const cleanText = text.toUpperCase().replace(/[^A-Z0-9]/g, '');
  
  // Try matching our exact mock plates
  if (cleanText.includes('MH12AB1234') || text.toUpperCase().includes('MH12') || text.toUpperCase().includes('1234')) {
    return 'MH12AB1234';
  }
  if (cleanText.includes('DL3CAQ5678') || text.toUpperCase().includes('DL3') || text.toUpperCase().includes('5678')) {
    return 'DL3CAQ5678';
  }

  // Generic regex fallback
  const match = text.match(/[A-Z]{2}[0-9]{2}[A-Z]{1,2}[0-9]{4}/i);
  return match ? match[0].toUpperCase() : null;
}

export const initialContext = {
  activeEntity: null,
  activeTimeRange: null,
  comparisonEntity: null,
  focusedComponent: null,
  history: []
};

// Generates the layout based on the intent and current context state
export function generateLayout(intent, context) {
  const activeVehicle = vehicles[context.activeEntity] || vehicles['MH12AB1234'];
  const compVehicle = context.comparisonEntity ? vehicles[context.comparisonEntity] : null;

  let components = [];

  switch (intent) {
    case 'vehicle_search':
      // Default plate search: ProfileCard + MapView (large); DataTable + EventTimeline (small)
      components = [
        {
          id: 'profile-card',
          type: 'ProfileCard',
          size: 'large',
          position: { row: 1, col: 1 },
          data: {
            plate: activeVehicle.plate,
            owner: activeVehicle.owner,
            model: activeVehicle.model,
            status: activeVehicle.status,
            reason: activeVehicle.reason,
            photo: activeVehicle.photo
          }
        },
        {
          id: 'map-view',
          type: 'MapView',
          size: 'large',
          position: { row: 1, col: 2 },
          data: {
            markers: activeVehicle.observations.map(obs => {
              const cam = cameras.find(c => c.id === obs.cameraId);
              return { lat: cam.lat, lng: cam.lng, label: cam.name, id: cam.id };
            }),
            route: activeVehicle.observations.map(obs => {
              const cam = cameras.find(c => c.id === obs.cameraId);
              return { lat: cam.lat, lng: cam.lng, timestamp: obs.timestamp };
            }),
            activeCameraId: activeVehicle.observations[activeVehicle.observations.length - 1]?.cameraId
          }
        },
        {
          id: 'rto-table',
          type: 'DataTable',
          size: 'small',
          position: { row: 2, col: 1 },
          data: {
            title: `RTO Profile: ${activeVehicle.plate}`,
            columns: ['Parameter', 'Details'],
            rows: Object.entries(activeVehicle.rtoDetails)
          }
        },
        {
          id: 'event-timeline',
          type: 'EventTimeline',
          size: 'small',
          position: { row: 2, col: 2 },
          data: {
            vehiclePlate: activeVehicle.plate,
            events: activeVehicle.observations.map(obs => {
              const cam = cameras.find(c => c.id === obs.cameraId);
              return {
                id: `${obs.cameraId}-${obs.timestamp}`,
                time: obs.timestamp,
                label: `Detections at ${cam.name}`,
                details: `Speed: ${obs.speed} km/h, ${obs.lane}`,
                severity: obs.speed > 60 ? 'medium' : 'low'
              };
            }).concat(
              alerts
                .filter(a => a.vehicleIdentifier === activeVehicle.plate)
                .map(a => ({
                  id: a.id,
                  time: a.timestamp,
                  label: `ALERT: ${a.message}`,
                  details: `Confidence: ${(a.confidence * 100).toFixed(0)}%`,
                  severity: a.severity.toLowerCase()
                }))
            ).sort((a, b) => new Date(b.time) - new Date(a.time))
          }
        }
      ];
      break;

    case 'camera_footage':
      // "show camera footage" -> VideoPlayer is large, MapView is small/sidebar. ProfileCard is small.
      {
        const lastObservation = activeVehicle.observations[activeVehicle.observations.length - 1];
        const activeCamera = cameras.find(c => c.id === (lastObservation?.cameraId || 'CAM01'));

        components = [
          {
            id: 'video-player',
            type: 'VideoPlayer',
            size: 'large',
            position: { row: 1, col: 1 },
            data: {
              cameraId: activeCamera.id,
              cameraName: activeCamera.name,
              streamUrl: `simulated://${activeCamera.id}/stream`,
              timestamp: lastObservation?.timestamp || new Date().toISOString()
            }
          },
          {
            id: 'profile-card',
            type: 'ProfileCard',
            size: 'small',
            position: { row: 1, col: 2 },
            data: {
              plate: activeVehicle.plate,
              owner: activeVehicle.owner,
              model: activeVehicle.model,
              status: activeVehicle.status,
              reason: activeVehicle.reason,
              photo: activeVehicle.photo
            }
          },
          {
            id: 'map-view',
            type: 'MapView',
            size: 'small',
            position: { row: 2, col: 1 },
            data: {
              markers: activeVehicle.observations.map(obs => {
                const cam = cameras.find(c => c.id === obs.cameraId);
                return { lat: cam.lat, lng: cam.lng, label: cam.name, id: cam.id };
              }),
              route: activeVehicle.observations.map(obs => {
                const cam = cameras.find(c => c.id === obs.cameraId);
                return { lat: cam.lat, lng: cam.lng, timestamp: obs.timestamp };
              }),
              activeCameraId: activeCamera.id
            }
          },
          {
            id: 'feed-grid',
            type: 'FeedGrid',
            size: 'small',
            position: { row: 2, col: 2 },
            data: {
              cameras: cameras.filter(c => c.status === 'online').map(c => ({
                id: c.id,
                name: c.name,
                status: c.status
              }))
            }
          }
        ];
      }
      break;

    case 'trajectory_view':
      // "show route / trajectory" -> MapView (large, center), EventTimeline alongside, ChartPanel
      {
        const routeData = context.activeTimeRange === 'yesterday' ? activeVehicle.yesterdayRoute : activeVehicle.observations;

        components = [
          {
            id: 'map-view',
            type: 'MapView',
            size: 'large',
            position: { row: 1, col: 1 },
            data: {
              title: `${context.activeTimeRange === 'yesterday' ? "Yesterday's" : "Today's"} Trajectory: ${activeVehicle.plate}`,
              markers: routeData.map(obs => {
                const cam = cameras.find(c => c.id === obs.cameraId);
                return { lat: cam.lat, lng: cam.lng, label: cam.name, id: cam.id };
              }),
              route: routeData.map(obs => {
                const cam = cameras.find(c => c.id === obs.cameraId);
                return { lat: cam.lat, lng: cam.lng, timestamp: obs.timestamp };
              })
            }
          },
          {
            id: 'event-timeline',
            type: 'EventTimeline',
            size: 'medium',
            position: { row: 1, col: 2 },
            data: {
              title: `${context.activeTimeRange === 'yesterday' ? "Yesterday's" : "Today's"} Detections`,
              vehiclePlate: activeVehicle.plate,
              events: routeData.map(obs => {
                const cam = cameras.find(c => c.id === obs.cameraId);
                return {
                  id: `${obs.cameraId}-${obs.timestamp}`,
                  time: obs.timestamp,
                  label: `Sighted at ${cam.name}`,
                  details: `Speed: ${obs.speed} km/h, Lane: ${obs.lane}`,
                  severity: obs.speed > 60 ? 'medium' : 'low'
                };
              })
            }
          },
          {
            id: 'chart-panel',
            type: 'ChartPanel',
            size: 'small',
            position: { row: 2, col: 1 },
            data: {
              title: `Speed Analysis (${activeVehicle.plate})`,
              type: 'line',
              series: routeData.map(obs => ({
                label: obs.timestamp.split('T')[1].substring(0, 5),
                value: obs.speed
              }))
            }
          }
        ];
      }
      break;

    case 'multi_feed_view':
      // "show all cameras / watch together" -> MultiFeedView (large), MapView (small, locator)
      {
        const activeFeeds = activeVehicle.observations.slice(0, 4).map(obs => {
          const cam = cameras.find(c => c.id === obs.cameraId);
          return {
            id: cam.id,
            label: cam.name,
            cameraId: cam.id,
            streamUrl: `simulated://${cam.id}/stream`,
            timestamp: obs.timestamp
          };
        });

        components = [
          {
            id: 'multi-feed-view',
            type: 'MultiFeedView',
            size: 'large',
            position: { row: 1, col: 1 },
            data: {
              feeds: activeFeeds,
              syncTimestamp: activeVehicle.observations[0]?.timestamp,
              layout: activeFeeds.length <= 2 ? '1x2' : '2x2'
            }
          },
          {
            id: 'map-view',
            type: 'MapView',
            size: 'small',
            position: { row: 1, col: 2 },
            data: {
              title: 'Camera Locations',
              markers: cameras.filter(c => c.status === 'online').map(c => ({ lat: c.lat, lng: c.lng, label: c.name, id: c.id })),
              route: []
            }
          },
          {
            id: 'event-timeline',
            type: 'EventTimeline',
            size: 'small',
            position: { row: 2, col: 1 },
            data: {
              vehiclePlate: activeVehicle.plate,
              events: activeVehicle.observations.map(obs => {
                const cam = cameras.find(c => c.id === obs.cameraId);
                return {
                  id: `${obs.cameraId}-${obs.timestamp}`,
                  time: obs.timestamp,
                  label: `Active Feed: ${cam.name}`,
                  details: `Watching Live Link`,
                  severity: 'low'
                };
              })
            }
          }
        ];
      }
      break;

    case 'comparison_view':
      // "compare vehicle X" -> duplicate ProfileCards, MapView overlays routes
      if (compVehicle) {
        components = [
          {
            id: 'profile-card-1',
            type: 'ProfileCard',
            size: 'medium',
            position: { row: 1, col: 1 },
            data: {
              plate: activeVehicle.plate,
              owner: activeVehicle.owner,
              model: activeVehicle.model,
              status: activeVehicle.status,
              reason: activeVehicle.reason,
              photo: activeVehicle.photo
            }
          },
          {
            id: 'profile-card-2',
            type: 'ProfileCard',
            size: 'medium',
            position: { row: 1, col: 2 },
            data: {
              plate: compVehicle.plate,
              owner: compVehicle.owner,
              model: compVehicle.model,
              status: compVehicle.status,
              reason: compVehicle.reason,
              photo: compVehicle.photo
            }
          },
          {
            id: 'map-view',
            type: 'MapView',
            size: 'large',
            position: { row: 2, col: 1 },
            data: {
              title: `Route Comparison: ${activeVehicle.plate} vs ${compVehicle.plate}`,
              markers: activeVehicle.observations.map(obs => {
                const cam = cameras.find(c => c.id === obs.cameraId);
                return { lat: cam.lat, lng: cam.lng, label: `[${activeVehicle.plate}] ${cam.name}`, id: cam.id, color: '#aa3bff' };
              }).concat(
                compVehicle.observations.map(obs => {
                  const cam = cameras.find(c => c.id === obs.cameraId);
                  return { lat: cam.lat, lng: cam.lng, label: `[${compVehicle.plate}] ${cam.name}`, id: cam.id, color: '#3b82f6' };
                })
              ),
              route: activeVehicle.observations.map(obs => {
                const cam = cameras.find(c => c.id === obs.cameraId);
                return { lat: cam.lat, lng: cam.lng, color: '#aa3bff' };
              }),
              compareRoute: compVehicle.observations.map(obs => {
                const cam = cameras.find(c => c.id === obs.cameraId);
                return { lat: cam.lat, lng: cam.lng, color: '#3b82f6' };
              })
            }
          },
          {
            id: 'chart-panel',
            type: 'ChartPanel',
            size: 'small',
            position: { row: 2, col: 2 },
            data: {
              title: 'Speed Comparison',
              type: 'bar',
              series: [
                { label: `${activeVehicle.plate} (Avg)`, value: Math.round(activeVehicle.observations.reduce((acc, curr) => acc + curr.speed, 0) / activeVehicle.observations.length) },
                { label: `${compVehicle.plate} (Avg)`, value: Math.round(compVehicle.observations.reduce((acc, curr) => acc + curr.speed, 0) / compVehicle.observations.length) }
              ]
            }
          }
        ];
      }
      break;

    default:
      // Welcome state - General traffic analysis Dashboard
      components = [
        {
          id: 'chart-panel-1',
          type: 'ChartPanel',
          size: 'large',
          position: { row: 1, col: 1 },
          data: {
            title: 'City-Wide Hourly Traffic Flow Counts',
            type: 'line',
            series: trafficStats.hourlyCounts.map(h => ({ label: h.hour, value: h.count }))
          }
        },
        {
          id: 'map-view',
          type: 'MapView',
          size: 'large',
          position: { row: 1, col: 2 },
          data: {
            title: 'System Wide Traffic Density Heatmap',
            markers: cameras.map(c => ({ lat: c.lat, lng: c.lng, label: c.name, id: c.id, density: trafficStats.cameraStats[c.id]?.count || 0 })),
            route: [],
            isHeatmap: true
          }
        },
        {
          id: 'rto-table',
          type: 'DataTable',
          size: 'small',
          position: { row: 2, col: 1 },
          data: {
            title: 'Camera Diagnostics & Load Status',
            columns: ['Camera ID', 'Hourly Load', 'Avg Speed', 'Status'],
            rows: Object.entries(trafficStats.cameraStats).map(([id, info]) => [
              id,
              info.count > 0 ? `${info.count} veh/hr` : 'N/A',
              info.avgSpeed > 0 ? `${info.avgSpeed} km/h` : 'N/A',
              info.status
            ])
          }
        },
        {
          id: 'event-timeline',
          type: 'EventTimeline',
          size: 'small',
          position: { row: 2, col: 2 },
          data: {
            title: 'Critical Threat & Watchlist Alerts',
            events: alerts.map(a => ({
              id: a.id,
              time: a.timestamp,
              label: `ALERT: ${a.vehicleIdentifier} - ${a.alertType}`,
              details: `${a.message} (Cam: ${a.cameraId})`,
              severity: a.severity.toLowerCase()
            }))
          }
        }
      ];
  }

  return {
    workspaceId: 'session-' + Math.floor(Math.random() * 100000),
    intent,
    context,
    components
  };
}

export function parseCommand(commandText, currentContext) {
  const text = commandText.trim().toLowerCase();
  const nextContext = {
    ...currentContext,
    history: [...currentContext.history, commandText]
  };

  // 1. Identify plate searches
  const detectedPlate = extractPlate(commandText);
  if (detectedPlate) {
    // If the command also mentions compare
    if (text.includes('compare') || text.includes('vs')) {
      nextContext.comparisonEntity = detectedPlate;
      // Make sure we have a primary activeEntity, else swap
      if (!nextContext.activeEntity) {
        nextContext.activeEntity = 'MH12AB1234';
      }
      return {
        intent: 'comparison_view',
        context: nextContext
      };
    } else {
      nextContext.activeEntity = detectedPlate;
      nextContext.comparisonEntity = null; // Clear comparison on new primary search
      return {
        intent: 'vehicle_search',
        context: nextContext
      };
    }
  }

  // 2. Identify comparison without plate in text but references "compare with DL3CAQ5678" etc
  if (text.includes('compare')) {
    // Look if DL3CAQ5678 is mentioned
    if (text.includes('dl3') || text.includes('5678')) {
      nextContext.comparisonEntity = 'DL3CAQ5678';
    } else {
      nextContext.comparisonEntity = 'DL3CAQ5678'; // fallback comparison
    }
    if (!nextContext.activeEntity) {
      nextContext.activeEntity = 'MH12AB1234';
    }
    return {
      intent: 'comparison_view',
      context: nextContext
    };
  }

  // 3. Identify camera footage zoom
  if (text.includes('camera') || text.includes('footage') || text.includes('cctv') || text.includes('video')) {
    if (!nextContext.activeEntity) {
      nextContext.activeEntity = 'MH12AB1234';
    }
    // "all cameras" or "watch together" -> multi feed
    if (text.includes('all') || text.includes('together') || text.includes('multi') || text.includes('feeds')) {
      return {
        intent: 'multi_feed_view',
        context: nextContext
      };
    }
    return {
      intent: 'camera_footage',
      context: nextContext
    };
  }

  // 4. Identify trajectory view
  if (text.includes('route') || text.includes('trajectory') || text.includes('track') || text.includes('path')) {
    if (!nextContext.activeEntity) {
      nextContext.activeEntity = 'MH12AB1234';
    }
    if (text.includes('yesterday')) {
      nextContext.activeTimeRange = 'yesterday';
    } else {
      nextContext.activeTimeRange = 'today';
    }
    return {
      intent: 'trajectory_view',
      context: nextContext
    };
  }

  // 5. Default dashboard or if just reset/general query
  if (text.includes('reset') || text.includes('dashboard') || text.includes('home')) {
    nextContext.activeEntity = null;
    nextContext.comparisonEntity = null;
    nextContext.activeTimeRange = null;
    return {
      intent: 'dashboard',
      context: nextContext
    };
  }

  // Fallback: If we have an active vehicle, stay in vehicle search, otherwise general dashboard
  return {
    intent: nextContext.activeEntity ? 'vehicle_search' : 'dashboard',
    context: nextContext
  };
}
