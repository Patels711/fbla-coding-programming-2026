# LuminX — Local Business Discovery Platform

Made by **Sahya Patel**, **Nathaniel George**, and **Eli Nahoum** for FBLA Coding and Programming 2026.

LuminX helps people discover local businesses through personalized recommendations, interactive maps, reviews, and local offers.

## Features

- Swipe through local places with personalized recommendations.
- Explore points of interest and plan routes on interactive maps.
- Ask the AI assistant for nearby recommendations and itinerary ideas.
- Save favorite and recently visited places.
- Read and submit business reviews.
- Find, save, and navigate to local coupons and deals.
- Create an account and manage a personal profile.

## Project links

This is Sahya Patel's repository for the FBLA project. The team's companion repository, maintained by Eli Nahoum (`abominablepug`), is [here](https://github.com/abominablepug/fbla-coding-programming-2026). The companion repository links back to this one so both team copies are easy to find.

## Technology

- Frontend: React, TypeScript, Vite, Tailwind CSS, Framer Motion
- Backend: Python, Flask, SQLAlchemy, Flask-Login, SQLite
- Integrations: TomTom maps and places, Google Gemini recommendations

## Requirements

- Node.js and npm
- Python 3.13 or newer
- Poetry
- API credentials for the integrations enabled in your environment

## Setup and development

From the repository root, install dependencies and initialize the database:

```bash
npm run setup
```

Add the required API keys and application settings to `backend/.env` using the checked-in environment example as a guide. Do not commit secrets. Start the backend and frontend together with:

```bash
npm run dev
```

The frontend and backend have their own package/configuration files under `frontend/` and `backend/` for separate setup or development.
