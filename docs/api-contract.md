# SIH 26127 - API Contract

## Purpose

This document defines the communication contract between the backend and
frontend.

The frontend communicates with the backend through HTTP APIs.

The API structure may evolve during development, but changes must be
communicated to the team and documented here.

---

# 1. Base URL

Development:

http://localhost:8000

Production URL will be defined later.

---

# 2. Health Check

## GET /health

Purpose:

Check whether the backend is running.

Example response:

{
    "status": "ok"
}

---

# 3. Cameras

## GET /cameras

Purpose:

Return all registered cameras.

Example response:

{
    "cameras": [
        {
            "camera_id": "CAM01",
            "name": "Main Road Junction",
            "latitude": 28.6139,
            "longitude": 77.2090,
            "status": "online"
        }
    ]
}

The frontend can use this information to display camera locations.

---

# 4. Camera Details

## GET /cameras/{camera_id}

Example:

GET /cameras/CAM01

Purpose:

Return information about a specific camera.

---

# 5. Vehicle Search

## GET /vehicles/{plate_text}

Example:

GET /vehicles/MH12AB1234

Purpose:

Search for observations of a specific license plate.

Example response:

{
    "plate_text": "MH12AB1234",
    "total_observations": 4,
    "observations": [
        {
            "camera_id": "CAM01",
            "timestamp": "2026-08-28T10:02:31",
            "latitude": 28.6139,
            "longitude": 77.2090
        },
        {
            "camera_id": "CAM02",
            "timestamp": "2026-08-28T10:10:15",
            "latitude": 28.6200,
            "longitude": 77.2150
        }
    ]
}

---

# 6. Vehicle Trajectory

## GET /vehicles/{plate_text}/trajectory

Example:

GET /vehicles/MH12AB1234/trajectory

Purpose:

Return chronological observations of a vehicle so the frontend can draw
its trajectory on a map.

Example response:

{
    "plate_text": "MH12AB1234",
    "trajectory": [
        {
            "sequence": 1,
            "camera_id": "CAM01",
            "timestamp": "2026-08-28T10:02:31",
            "latitude": 28.6139,
            "longitude": 77.2090
        },
        {
            "sequence": 2,
            "camera_id": "CAM02",
            "timestamp": "2026-08-28T10:10:15",
            "latitude": 28.6200,
            "longitude": 77.2150
        }
    ]
}

Frontend responsibility:

- Plot camera points
- Connect points in chronological order
- Display timestamps
- Display camera information

---

# 7. Alerts

## GET /alerts

Purpose:

Return system-generated alerts.

Example response:

{
    "alerts": [
        {
            "alert_id": "ALT_0001",
            "alert_type": "BLACKLIST_MATCH",
            "severity": "HIGH",
            "vehicle_identifier": "MH12AB1234",
            "camera_id": "CAM01",
            "timestamp": "2026-08-28T10:02:31",
            "confidence": 0.98,
            "status": "UNREAD"
        }
    ]
}

---

# 8. Alert Details

## GET /alerts/{alert_id}

Purpose:

Return complete information about one alert.

---

# 9. Analytics Summary

## GET /analytics/summary

Purpose:

Return high-level traffic statistics for the dashboard.

Example response:

{
    "total_vehicles": 1240,
    "active_cameras": 12,
    "alerts": 4,
    "average_speed": 32,
    "congestion_level": "MEDIUM"
}

---

# 10. Camera Traffic Analytics

## GET /analytics/cameras/{camera_id}

Purpose:

Return traffic statistics for a particular camera.

Example:

GET /analytics/cameras/CAM01

Possible response:

{
    "camera_id": "CAM01",
    "vehicle_count": 82,
    "average_speed": 32,
    "congestion_level": "MEDIUM"
}

---

# 11. Traffic Heatmap

## GET /analytics/heatmap

Purpose:

Return geographic traffic-density information.

Example response:

{
    "points": [
        {
            "latitude": 28.6139,
            "longitude": 77.2090,
            "density": 0.82
        },
        {
            "latitude": 28.6200,
            "longitude": 77.2150,
            "density": 0.64
        }
    ]
}

Frontend can use these points to create a traffic heatmap.

---

# 12. Watchlist

## GET /watchlist

Purpose:

Return the current demo watchlist.

For the SIH prototype, this can use synthetic/demo data.

---

# 13. Add Watchlist Entry

## POST /watchlist

Example request:

{
    "plate_text": "MH12AB1234",
    "reason": "Demo watchlist entry"
}

Example response:

{
    "status": "created",
    "plate_text": "MH12AB1234"
}

---

# 14. Process Video

## POST /processing/video

Purpose:

Start processing a demo video.

Example request:

{
    "video_path": "data/demo/camera01.mp4",
    "camera_id": "CAM01"
}

Example response:

{
    "status": "processing",
    "job_id": "JOB_001"
}

---

# 15. Processing Status

## GET /processing/{job_id}

Example:

GET /processing/JOB_001

Example response:

{
    "job_id": "JOB_001",
    "status": "completed",
    "progress": 100
}

Possible statuses:

- queued
- processing
- completed
- failed

---

# 16. API Error Format

All API errors should use a consistent format.

Example:

{
    "error": {
        "code": "VEHICLE_NOT_FOUND",
        "message": "No observations found for the requested vehicle."
    }
}

---

# 17. Frontend Responsibilities

The frontend should:

- call backend APIs
- display returned data
- handle loading states
- handle errors
- display maps
- display charts
- display tables
- display alerts

The frontend should NOT:

- directly access the database
- directly execute AI models
- contain database credentials
- contain backend secrets

---

# 18. Backend Responsibilities

The backend should:

- validate API requests
- communicate with the database
- communicate with AI processing services
- return consistent JSON responses
- handle errors
- provide data required by the frontend

---

# 19. AI Responsibilities

AI modules should:

- process camera/video input
- detect vehicles
- track vehicles
- detect plates
- perform OCR
- generate Re-ID information
- create/fuse vehicle events
- generate trajectory information
- generate analytics inputs
- generate alert inputs

AI modules should not directly control the frontend.

---

# 20. Integration Flow

Frontend
    |
    | HTTP Request
    v
Backend API
    |
    v
Backend Service
    |
    +----> Database
    |
    +----> AI Processing
    |
    v
JSON Response
    |
    v
Frontend

---

# 21. API Versioning

If major API changes are required, the project may use:

/api/v1/

Example:

/api/v1/vehicles/MH12AB1234/trajectory

Versioning should be introduced before the project becomes dependent on
the existing API structure.

---

# 22. Development Rule

Do not change an API response structure without informing the frontend
developer.

If an API changes:

1. Update this document.
2. Update backend implementation.
3. Inform frontend developer.
4. Update frontend integration.
5. Test the complete flow.
6. Create a Pull Request.