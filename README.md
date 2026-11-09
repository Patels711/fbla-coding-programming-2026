# LuminX — FBLA Coding and Programming 2026

Made by **Sahya Patel**, **Nathaniel George**, and **Eli Nahoum**.

LuminX is a local-business discovery project. This repository contains Sahya Patel's project copy: a React/TypeScript web prototype with account screens and a TomTom-powered map, plus a Flask backend for authentication, location records, reviews, and recommendation endpoints. The more current team project copy for FBLA Nationals is maintained by Eli Nahoum (`abominablepug`) and is linked below.

## What is in this repository

- Frontend routes for the landing page, login, registration, map, loading, and dashboard screens.
- A map interface that searches and displays nearby points of interest using TomTom.
- Flask endpoints and SQLAlchemy models for users, locations, reviews, and preference-based recommendations.
- SQLite persistence for the backend.

This copy is an earlier prototype. Features such as the full business portal, jobs, coupons, events, and the expanded AI assistant described in the companion repository are not all present in this repository's current source tree. See the companion link for that fuller implementation.

## Team project links

- **Sahya Patel:** [Patels711/fbla-coding-programming-2026](https://github.com/Patels711/fbla-coding-programming-2026) — this repository.
- **Eli Nahoum (`abominablepug`):** [abominablepug/fbla-coding-programming-2026](https://github.com/abominablepug/fbla-coding-programming-2026) — companion project copy. Its README links back here.

## Technology

| Area | Tools |
| --- | --- |
| Frontend | React 19, TypeScript, Vite (`rolldown-vite`), React Router, Tailwind CSS 4, Framer Motion |
| Maps and places | TomTom Maps and Services SDK |
| Backend | Python 3.13+, Flask, Flask-Login, Flask-SQLAlchemy, Flask-Migrate, SQLite |
| Python packages | Poetry |

## Requirements

- Node.js and npm.
- Python 3.13 or newer and Poetry.
- A TomTom developer key for map tiles and nearby place search.

## Configuration

Copy the root example and set a strong local Flask secret and TomTom key:

```bash
cp .env.example .env
```

Set `BACKEND_SECRET_KEY` and `TOMTOM_API_KEY` in the root `.env`. For the current frontend map, create `frontend/.env.local` with:

```env
VITE_TOMTOM_API_KEY=your_tomtom_api_key
```

The frontend's map code calls the backend at `http://localhost:5174`. `backend/run.py` defaults to port `5174`; the checked-in root example currently lists a different `BACKEND_PORT`, so set `BACKEND_PORT=5174` in `.env` for the frontend's current default. Vite serves the frontend on its default development port `5173`; `FRONTEND_PORT` in the example is not read by the current Vite config. Do not commit `.env` files or API keys.

## Install and run

Install root Node dependencies, backend Python dependencies, and frontend dependencies:

```bash
npm install
cd backend && poetry install
cd ../frontend && npm install
cd ..
```

Start the backend and frontend in separate terminals from the repository root:

```bash
cd backend && poetry run python run.py
```

```bash
cd frontend && npm run dev
```

Open the URL printed by Vite, normally `http://localhost:5173`. The backend's default URL is `http://localhost:5174`.

The root `npm run setup` and `npm run dev` scripts are convenience scripts, but the setup script does not install Poetry dependencies itself. Run `poetry install` first as shown above. For the frontend production build, use `cd frontend && npm run build`.

## Project layout

```text
.env.example                         Example backend variables and local ports
package.json                         Root setup, migration, and combined development scripts
backend/run.py                       Flask development server entry point
backend/app/__init__.py              Flask app factory, SQLite setup, blueprint registration
backend/app/models.py                User, location, review, and favorites models
backend/app/auth/                    Registration, login, logout, profile endpoints
backend/app/loc/                     Location record endpoints
backend/app/rate/                    Ratings and reviews endpoints
backend/app/recc/                    TomTom search and preference ranking logic
backend/pyproject.toml                Python version and Poetry dependencies
frontend/src/App.tsx                 Frontend route table
frontend/src/pages/                  Landing, login, register, map, loading, dashboard
frontend/src/components/             Shared UI components
frontend/package.json                Frontend dependencies and Vite scripts
```

## Main backend routes

The Flask app registers the `/auth`, `/loc`, `/rate`, and `/recc` blueprints. Routes include authentication and dashboard actions (`/auth/register`, `/auth/login`, `/auth/logout`, `/auth/dashboard`), location listing and lookup (`/loc/all`, `/loc/<id>`), reviews (`/rate/loc/<id>/reviews`, `/rate/review`), and nearby or ranked recommendations (`/recc/nearby`, `/recc/ranked`). See the route modules for request and response fields.

## Sources

- [TomTom Maps SDK for Web](https://developer.tomtom.com/maps-sdk-web-js)
- [TomTom Search API](https://developer.tomtom.com/search-api/documentation/search-service/nearby-search)
- [Flask documentation](https://flask.palletsprojects.com/)
- [SQLAlchemy documentation](https://docs.sqlalchemy.org/)
- [Vite documentation](https://vite.dev/guide/)
