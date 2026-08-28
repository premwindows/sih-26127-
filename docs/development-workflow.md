# SIH 26127 - Development Workflow

## 1. Team Structure

The project has six members.

### Member 1 - Team Leader / Integration

Responsibilities:

- Team coordination
- Communication
- Requirement tracking
- Presentation
- Integration coordination
- Final testing coordination
- GitHub repository management

---

### Member 2 - AI/ML Developer 1

Responsibilities:

- Vehicle detection
- Vehicle tracking
- Detection model evaluation
- Detection pipeline

Primary folders:

`ai/detection/`

`ai/tracking/`

---

### Member 3 - AI/ML Developer 2

Responsibilities:

- License plate detection
- OCR
- Vehicle Re-ID
- Data fusion
- Trajectory-related AI work

Primary folders:

`ai/plate/`

`ai/ocr/`

`ai/reid/`

`ai/fusion/`

`ai/trajectory/`

---

### Member 4 - Backend / Full Stack Developer

Responsibilities:

- Backend APIs
- Backend services
- Frontend development
- UI/UX implementation

Primary folders:

`backend/`

`frontend/`

---

### Member 5 - Database / Cloud / Testing

Responsibilities:

- Database design
- Database integration
- Cloud/deployment support
- API testing
- System testing

Primary folders:

`backend/database/`

`tests/`

---

### Member 6 - Team Support / Integration

Responsibilities:

- Documentation
- Testing
- Integration support
- Demo preparation
- Assistance with modules where required

Responsibilities may change according to project requirements.

---

# 2. Main Branch

The main branch is:

`main`

Rules:

- Do not directly develop features on `main`.
- Do not force push to `main`.
- `main` should contain the stable project.
- Changes should normally enter `main` through Pull Requests.

---

# 3. Feature Branches

Each developer creates a branch for their task.

Examples:

`feature/detection`

`feature/tracking`

`feature/ocr`

`feature/trajectory`

`feature/backend-api`

`feature/frontend`

`feature/database`

`feature/testing`

The branch name should describe the task.

---

# 4. Starting Work

Before starting work:

```bash
git checkout main
git pull origin main