// Mock database for the SIH AI-Powered Workspace Prototype

export const cameras = [
  { id: 'CAM01', name: 'Main Road Junction (North)', lat: 40.7128, lng: -74.0060, status: 'online', type: 'speed_dome' },
  { id: 'CAM02', name: 'Metro Station Roundabout', lat: 40.7188, lng: -73.9980, status: 'online', type: 'fixed' },
  { id: 'CAM03', name: 'High Street Market East', lat: 40.7110, lng: -73.9910, status: 'online', type: 'fixed' },
  { id: 'CAM04', name: 'Expressway Exit 14', lat: 40.7015, lng: -74.0150, status: 'online', type: 'traffic_flow' },
  { id: 'CAM05', name: 'Industrial Zone Gateway', lat: 40.7250, lng: -74.0100, status: 'online', type: 'fixed' },
  { id: 'CAM06', name: 'Shopping Mall Blvd', lat: 40.7160, lng: -74.0200, status: 'offline', type: 'fixed' },
  { id: 'CAM07', name: 'City Hospital Lane', lat: 40.7080, lng: -74.0010, status: 'online', type: 'speed_dome' },
  { id: 'CAM08', name: 'South Bridge Entrance', lat: 40.6950, lng: -74.0080, status: 'online', type: 'traffic_flow' }
];

export const vehicles = {
  'MH12AB1234': {
    plate: 'MH12AB1234',
    owner: 'Rajesh Kumar Singh',
    model: 'White Hyundai Creta SX (2022)',
    status: 'flagged',
    reason: 'Association with financial fraud case (RTO-992/2026)',
    photo: 'https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?auto=format&fit=crop&q=80&w=300', // Mock car image
    rtoDetails: {
      'Owner Name': 'Rajesh Kumar Singh',
      'Vehicle Model': 'Hyundai Creta SX 1.5 Petrol',
      'Engine Number': 'G4FLNL893122',
      'Chassis Number': 'MALC381AGNL002143',
      'Registration Date': '14-Mar-2022',
      'RTO Office': 'Pune, Maharashtra',
      'Tax Status': 'Paid (Lifetime)',
      'Insurance Valid Up To': '12-Mar-2027',
      'Pollution Certificate (PUC)': 'Valid (Expires 18-Sep-2026)'
    },
    observations: [
      { cameraId: 'CAM01', timestamp: '2026-08-28T10:02:31', speed: 45, confidence: 0.98, lane: 'Lane 2' },
      { cameraId: 'CAM02', timestamp: '2026-08-28T10:10:15', speed: 38, confidence: 0.96, lane: 'Lane 1' },
      { cameraId: 'CAM03', timestamp: '2026-08-28T10:18:42', speed: 52, confidence: 0.99, lane: 'Lane 3' },
      { cameraId: 'CAM04', timestamp: '2026-08-28T10:29:05', speed: 84, confidence: 0.94, lane: 'Lane 2' }
    ],
    yesterdayRoute: [
      { cameraId: 'CAM08', timestamp: '2026-08-27T14:15:00', speed: 65, confidence: 0.97, lane: 'Lane 1' },
      { cameraId: 'CAM07', timestamp: '2026-08-27T14:32:12', speed: 30, confidence: 0.95, lane: 'Lane 2' },
      { cameraId: 'CAM01', timestamp: '2026-08-27T14:48:50', speed: 42, confidence: 0.98, lane: 'Lane 1' },
      { cameraId: 'CAM02', timestamp: '2026-08-27T15:05:01', speed: 40, confidence: 0.97, lane: 'Lane 2' }
    ]
  },
  'DL3CAQ5678': {
    plate: 'DL3CAQ5678',
    owner: 'Amit Kumar Sharma',
    model: 'Black Honda Civic ZX (2020)',
    status: 'clean',
    reason: 'None',
    photo: 'https://images.unsplash.com/photo-1542282088-fe8426682b8f?auto=format&fit=crop&q=80&w=300', // Mock car image
    rtoDetails: {
      'Owner Name': 'Amit Kumar Sharma',
      'Vehicle Model': 'Honda Civic ZX VTEC',
      'Engine Number': 'R18Z1194725',
      'Chassis Number': 'MRHFD2660JP039148',
      'Registration Date': '08-Jan-2020',
      'RTO Office': 'New Delhi, Delhi',
      'Tax Status': 'Paid (Lifetime)',
      'Insurance Valid Up To': '07-Jan-2026',
      'Pollution Certificate (PUC)': 'Expired (Expires 10-Aug-2026)'
    },
    observations: [
      { cameraId: 'CAM04', timestamp: '2026-08-28T09:45:10', speed: 78, confidence: 0.99, lane: 'Lane 3' },
      { cameraId: 'CAM01', timestamp: '2026-08-28T10:05:22', speed: 40, confidence: 0.98, lane: 'Lane 2' },
      { cameraId: 'CAM07', timestamp: '2026-08-28T10:20:00', speed: 28, confidence: 0.95, lane: 'Lane 1' },
      { cameraId: 'CAM08', timestamp: '2026-08-28T10:45:14', speed: 55, confidence: 0.97, lane: 'Lane 2' }
    ],
    yesterdayRoute: [
      { cameraId: 'CAM05', timestamp: '2026-08-27T09:12:00', speed: 48, confidence: 0.96, lane: 'Lane 1' },
      { cameraId: 'CAM02', timestamp: '2026-08-27T09:28:40', speed: 35, confidence: 0.97, lane: 'Lane 2' },
      { cameraId: 'CAM03', timestamp: '2026-08-27T09:44:15', speed: 42, confidence: 0.99, lane: 'Lane 1' }
    ]
  }
};

export const alerts = [
  { id: 'ALT_0001', alertType: 'BLACKLIST_MATCH', severity: 'HIGH', vehicleIdentifier: 'MH12AB1234', cameraId: 'CAM01', timestamp: '2026-08-28T10:02:31', confidence: 0.98, status: 'UNREAD', message: 'Blacklisted vehicle spotted' },
  { id: 'ALT_0002', alertType: 'SPEED_VIOLATION', severity: 'MEDIUM', vehicleIdentifier: 'MH12AB1234', cameraId: 'CAM04', timestamp: '2026-08-28T10:29:05', confidence: 0.94, status: 'UNREAD', message: 'Vehicle speeding at 84 km/h (Limit: 60)' },
  { id: 'ALT_0003', alertType: 'PUC_EXPIRED', severity: 'LOW', vehicleIdentifier: 'DL3CAQ5678', cameraId: 'CAM01', timestamp: '2026-08-28T10:05:22', confidence: 0.98, status: 'READ', message: 'PUC Certificate expired' }
];

export const trafficStats = {
  summary: {
    totalVehicles: 1420,
    activeCameras: 7,
    alertsCount: 3,
    avgSpeed: 48,
    congestionLevel: 'MODERATE'
  },
  hourlyCounts: [
    { hour: '06:00', count: 120, speed: 52 },
    { hour: '07:00', count: 240, speed: 48 },
    { hour: '08:00', count: 480, speed: 38 },
    { hour: '09:00', count: 650, speed: 32 },
    { hour: '10:00', count: 580, speed: 35 },
    { hour: '11:00', count: 420, speed: 41 },
    { hour: '12:00', count: 390, speed: 44 }
  ],
  cameraStats: {
    'CAM01': { count: 450, avgSpeed: 42, status: 'online' },
    'CAM02': { count: 320, avgSpeed: 38, status: 'online' },
    'CAM03': { count: 280, avgSpeed: 30, status: 'online' },
    'CAM04': { count: 610, avgSpeed: 68, status: 'online' },
    'CAM05': { count: 150, avgSpeed: 40, status: 'online' },
    'CAM06': { count: 0, avgSpeed: 0, status: 'offline' },
    'CAM07': { count: 190, avgSpeed: 35, status: 'online' },
    'CAM08': { count: 520, avgSpeed: 58, status: 'online' }
  }
};
