# SIH 26127 - System Architecture

## Problem Statement

City-Wide AI Engine for Multi-Camera ANPR Trajectory Tracking and Urban Traffic Analytics.

## System Goal

Build a centralized software platform that processes multiple camera feeds and provides:

1. Vehicle and license plate detection
2. License plate OCR
3. Multi-camera vehicle/plate trajectory tracking
4. City-wide traffic analytics
5. GIS-based visualization
6. Blacklisted vehicle alerts
7. Suspicious route anomaly alerts

---

# 1. High-Level Architecture

Camera / Video Feeds
        |
        v
+----------------------+
| AI Processing Layer  |
+----------------------+
        |
        +--> Vehicle Detection
        |
        +--> Vehicle Tracking
        |
        +--> Plate Detection
        |
        +--> OCR
        |
        +--> Vehicle Re-ID
        |
        +--> Data Fusion
        |
        +--> Trajectory Reconstruction
        |
        +--> Traffic Analytics
        |
        +--> Alert Detection
        |
        v
+----------------------+
| Database             |
+----------------------+
        |
        v
+----------------------+
| Backend / FastAPI    |
+----------------------+
        |
        v
+----------------------+
| Web Dashboard        |
+----------------------+

---

# 2. AI Processing

## 2.1 Vehicle Detection

Location:

`ai/detection/`

Purpose:

Detect vehicles in camera frames.

Initial vehicle classes:

- Car
- Truck
- Bus
- Motorcycle

Output:

- bounding box
- vehicle class
- confidence
- frame number
- timestamp

---

## 2.2 Vehicle Tracking

Location:

`ai/tracking/`

Purpose:

Maintain a temporary track ID for vehicles within a camera.

Example:

Vehicle detected repeatedly:

Frame 100 -> Track 17
Frame 101 -> Track 17
Frame 102 -> Track 17

Output:

- track_id
- bounding box
- timestamp
- camera_id

---

## 2.3 License Plate Detection

Location:

`ai/plate/`

Purpose:

Locate the license plate inside a vehicle image.

Output:

- plate bounding box
- plate crop
- confidence
- associated track_id

---

## 2.4 OCR

Location:

`ai/ocr/`

Purpose:

Convert the license plate image into text.

Example:

Plate image
    |
    v
OCR
    |
    v
MH12AB1234

Output:

- plate_text
- OCR confidence

---

## 2.5 Vehicle Re-ID

Location:

`ai/reid/`

Purpose:

Provide additional evidence that detections from different cameras belong to the same physical vehicle.

Re-ID is an implementation component.

It is NOT the final user-facing feature.

Possible signals:

- vehicle appearance
- vehicle type
- visual embedding
- time
- camera topology
- plate information

---

## 2.6 Data Fusion

Location:

`ai/fusion/`

Purpose:

Combine information from different AI modules.

Example:

Vehicle detection
+
Tracking
+
Plate OCR
+
Camera ID
+
Timestamp
=
Vehicle Event

---

# 3. Vehicle Event

The common data object passed between AI and backend should contain information such as:

- camera_id
- timestamp
- track_id
- vehicle_type
- plate_text
- plate_confidence

Example:

{
    "camera_id": "CAM01",
    "timestamp": "2026-08-28T10:02:31",
    "track_id": 17,
    "vehicle_type": "car",
    "plate_text": "MH12AB1234",
    "plate_confidence": 0.94
}

This format may evolve during development, but changes must be documented.

---

# 4. Trajectory Reconstruction

Location:

`ai/trajectory/`

Purpose:

Reconstruct the movement history of a specific vehicle across cameras.

Example:

MH12AB1234

CAM01 -> 10:02
CAM02 -> 10:10
CAM04 -> 10:18
CAM07 -> 10:29

The trajectory should contain:

- vehicle/plate identifier
- camera
- timestamp
- location
- direction where available
- route sequence

---

# 5. Traffic Analytics

Location:

`ai/analytics/`

The system should analyze aggregated camera data.

Required analytics:

- traffic density
- origin-destination patterns
- congestion bottlenecks
- traffic movement heatmaps
- route density
- traffic flow trends
- estimated average vehicle speed where data permits

---

# 6. Alert System

Location:

`ai/alerts/`

The system should support:

## Blacklist Alert

Example:

Plate detected:

MH12AB1234

If it exists in the watchlist:

ALERT GENERATED

Information:

- plate
- camera
- timestamp
- confidence

## Route Anomaly

Identify potentially unusual or inconsistent vehicle movement patterns.

Anomaly detection should be treated as an additional intelligence layer and should not claim certainty when the available evidence is insufficient.

---

# 7. Backend

Location:

`backend/`

The backend connects:

AI -> Database -> Frontend

Main responsibilities:

- receive vehicle events
- store events
- retrieve vehicle history
- provide trajectory data
- provide analytics
- provide alerts
- manage camera information
- expose APIs

---

# 8. Database

Location:

`backend/database/`

The database will eventually store:

- cameras
- vehicle detections
- plate detections
- OCR results
- vehicle events
- trajectory events
- alerts
- traffic analytics

Database technology will be selected during implementation.

---

# 9. Frontend

Location:

`frontend/`

The frontend is the web dashboard.

Main screens:

1. Dashboard
2. Live Camera View
3. Vehicle Search
4. Vehicle Trajectory
5. Traffic Analytics
6. Alerts

---

# 10. User Flow

## Vehicle Search

User opens dashboard
        |
        v
Searches license plate
        |
        v
Backend receives request
        |
        v
Database searched
        |
        v
Vehicle history returned
        |
        v
Frontend displays:

- camera sightings
- timestamps
- route
- trajectory map

---

# 11. Main Data Flow

Camera
  |
  v
Vehicle Detection
  |
  v
Tracking
  |
  +--> Plate Detection
  |       |
  |       v
  |      OCR
  |
  +--> Re-ID
  |
  v
Data Fusion
  |
  v
Vehicle Event
  |
  +--> Trajectory Engine
  |
  +--> Analytics
  |
  +--> Alerts
  |
  v
Database
  |
  v
Backend API
  |
  v
Web Dashboard

---

# 12. Development Principle

The project should be developed incrementally.

Phase 1:
Working single-camera vehicle detection.

Phase 2:
Vehicle tracking.

Phase 3:
License plate detection.

Phase 4:
OCR.

Phase 5:
Multi-camera event processing.

Phase 6:
Trajectory reconstruction.

Phase 7:
Database + backend APIs.

Phase 8:
Frontend dashboard.

Phase 9:
Traffic analytics.

Phase 10:
Alerts and anomaly detection.

Phase 11:
Integration, testing and optimization.

---

# 13. Important Development Rule

Each team member should work primarily inside their assigned module.

Do not modify another member's module without coordination.

All major changes should go through:

Branch
    ->
Code
    ->
Test
    ->
Commit
    ->
Push
    ->
Pull Request
    ->
Review
    ->
Merge

The `main` branch should remain stable.