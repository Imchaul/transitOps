# TransitOps — Smart Transport Operations Platform

TransitOps is a centralized platform that digitizes vehicle, driver, dispatch, maintenance, and expense management for logistics and transport companies — replacing spreadsheets and manual logbooks with a single source of truth, enforced business rules, and operational insights.

Built in an 8-hour hackathon by a 4-member team.

## The Problem

Many logistics companies still rely on spreadsheets and manual logbooks to manage transport operations, leading to scheduling conflicts, underutilized vehicles, missed maintenance, expired driver licenses, inaccurate expense tracking, and poor operational visibility. TransitOps solves this by managing the complete lifecycle of transport operations — from vehicle registration and driver management to dispatching, maintenance, fuel logging, and analytics — in one place.

## Target Users

| Role | Responsibilities |
|---|---|
| **Fleet Manager** | Oversees fleet assets, maintenance, vehicle lifecycle, and operational efficiency |
| **Driver** | Creates trips, assigns vehicles and drivers, monitors active deliveries |
| **Safety Officer** | Ensures driver compliance, tracks license validity, monitors safety scores |
| **Financial Analyst** | Reviews operational expenses, fuel consumption, maintenance costs, and profitability |

## Features

- 🔐 Secure authentication with Role-Based Access Control (RBAC)
- 📊 Dashboard with live KPIs (Active Vehicles, Fleet Utilization, Active/Pending Trips, Drivers on Duty) with filters by type, status, and region
- 🚚 Vehicle Registry — full CRUD with unique registration numbers and status tracking
- 🧑‍✈️ Driver Management — full CRUD with license expiry and safety score tracking
- 🗺️ Trip Management with automatic status transitions and business rule validation
- 🔧 Maintenance workflow — automatically pulls vehicles out of dispatch rotation
- ⛽ Fuel & expense logging with automatic operational cost calculation
- 📈 Reports & Analytics — fuel efficiency, fleet utilization, operational cost, vehicle ROI
- 📤 CSV export

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React (Vite), React Router, Zustand, Tailwind CSS, Axios |
| Backend | Node.js, Express |
| Database | PostgreSQL |
| Auth | JWT-based authentication with RBAC middleware |
| DevOps | Docker, Docker Compose, GitHub Actions |
| Charts | Chart.js |
| Docs | Swagger / OpenAPI |

## Project Structure

```
transitops/
├── frontend/          # React app — core pages, routing, state, UI
├── backend/           # Express API — auth, business logic, endpoints
├── infrastructure/    # Docker, nginx, monitoring, DB scripts
├── docs/              # API spec, architecture & DB diagrams
├── docker-compose.yml
└── README.md
```

## Getting Started

### Prerequisites

- Node.js (v18+)
- PostgreSQL
- npm

### 1. Clone the repo

```bash
git clone https://github.com/<your-org>/transitops.git
cd transitops
```

### 2. Backend setup

```bash
cd backend
npm install
cp .env.example .env   # fill in DB credentials and JWT secret
npm run migrate        # run DB migrations
npm run dev
```

Backend runs on `http://localhost:5000` by default.

### 3. Frontend setup

```bash
cd frontend
npm install
cp .env.example .env   # set VITE_API_URL to your backend URL
npm run dev
```

Frontend runs on `http://localhost:5173` by default.

### 4. (Optional) Run with Docker

```bash
docker-compose up --build
```

## Business Rules Enforced

- Vehicle registration number must be unique
- Retired or In Shop vehicles never appear in the dispatch selection
- Drivers with expired licenses or Suspended status cannot be assigned to trips
- A driver or vehicle already On Trip cannot be assigned to another trip
- Cargo weight must not exceed the vehicle's maximum load capacity
- Dispatching a trip automatically sets vehicle and driver status to On Trip
- Completing a trip automatically restores both to Available
- Cancelling a dispatched trip restores both to Available
- Creating an active maintenance record sets vehicle status to In Shop
- Closing maintenance restores the vehicle to Available (unless Retired)

## Team

| Member | Role |
|---|---|
| Member A | Backend & API (Node.js/Express + PostgreSQL, Auth/RBAC, business rules, Swagger docs) |
| Member B | Frontend — Core Pages (routing, auth screens, Dashboard, Vehicle & Driver CRUD, state management) |
| Member C | Frontend — Features & UI (Trip Management, Maintenance, Fuel & Expense logging, responsive design, dark mode) |
| Member D | DevOps, Integration & Testing (Docker, CI/CD, API integration, business rule testing, Reports, charts) |

## License

This project was built for hackathon purposes. See `LICENSE` for details.
