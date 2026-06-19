# EcoTrack AI — Full-Stack Sustainability & Carbon Footprint Tracker

EcoTrack AI is an enterprise-grade, full-stack application designed to help users track, understand, and reduce their daily carbon footprint. The application features a highly responsive, modern interface built with **Angular 16**, a robust **Express.js + TypeScript** backend, and a local **SQLite** database.

---

## 🚀 Key Features

1. **Carbon Footprint Dashboard**: 
   - Displays daily, weekly, and monthly carbon footprints in real-time.
   - Interactive KPI cards showing current statistics and trends versus global averages.
   - Dynamic 30-day emission trend charts and circular sustainability score gauges.

2. **Activity Logging**:
   - Log activities in four core categories: **Transport**, **Electricity**, **Food**, and **Waste**.
   - Input-validated reactive form with dynamic unit selection, automatic carbon equivalence calculations, and validation alerts.

3. **AI Sustainability Assistant**:
   - Local rule-based recommendation engine.
   - Analyzes your carbon emission history to produce personalized "Quick Wins" and "Long-Term Actions."
   - Prioritizes recommendations based on your highest emission categories.

4. **Analytics & Reports**:
   - Doughnut charts representing category emission breakdown.
   - Weekly emission comparison bar charts.
   - Interactive subtype breakdown progress indicators.
   - Daily target carbon budget configuration.

5. **Gamification System**:
   - Earning badges (e.g., *First Log*, *Streak Champion*, *Carbon Hero*) based on user behavior and footprint achievements.
   - Sustainability score scale (0-100) comparing your footprint against regional benchmarks.
   - Streaks counter for consistent daily activity logging.

---

## 🛠️ Technology Stack

### Frontend
- **Framework**: Angular 16.2 (TypeScript, Reactive Forms, RxJS)
- **UI Components**: Angular Material (Material Design, Sidenav, Cards, Progress Bars, Tooltips)
- **Styling**: SCSS (Dark-first design system, glassmorphism, responsive grids)
- **Charts**: Chart.js (`ng2-charts`)
- **Testing**: Karma & Jasmine (Headless Chrome execution)

### Backend
- **Runtime**: Node.js & Express (TypeScript)
- **Database**: SQLite (via `better-sqlite3` and `knex` for migrations)
- **Security**: Helmet, CORS, Express-Rate-Limit, express-validator
- **Testing**: Jest & Supertest

---

## 📂 Project Directory Structure

```
ecotrack-ai/
├── frontend/             # Angular client application
│   ├── src/
│   │   ├── app/
│   │   │   ├── core/     # API service, Theme service, models, and interceptors
│   │   │   ├── features/ # Dashboard, Activity Log, Insights, Analytics, Achievements
│   │   │   ├── shared/   # Layout, Loading, Empty states, and Pipes
│   │   │   └── styles.scss
│   │   └── environments/
│   └── angular.json
└── backend/              # Express API server
    ├── src/
    │   ├── config/       # Knex configuration, SQLite database initialization
    │   ├── middleware/   # Express CORS, Rate limits, Validation, and Errors
    │   ├── modules/      # Activities, Carbon calculation, Dashboard, Gamification, Insights
    │   └── app.ts
    └── tests/            # API integration and service unit tests
```

---

## 🚦 Getting Started

### Prerequisites
- [Node.js](https://nodejs.org/) (v16+ recommended)
- [npm](https://www.npmjs.com/) (v8+ recommended)

### 1. Setup Backend
Open your terminal and navigate to the backend folder:
```bash
cd backend
npm install
```

Create a `.env` file in `/backend` (or copy `.env.example`):
```env
PORT=3000
NODE_ENV=development
```

Run database migrations and start the development server:
```bash
# Running migrations is done automatically on startup
npm run dev
```
The server will start on [http://localhost:3000](http://localhost:3000).

### 2. Setup Frontend
Open a new terminal and navigate to the frontend folder:
```bash
cd frontend
npm install
npm start
```
The Angular application will launch on [http://localhost:4200](http://localhost:4200).

---

## 🧪 Running Tests

### Backend Tests
Execute Express endpoint and calculator service unit tests using Jest:
```bash
cd backend
npm test
```

### Frontend Tests
Execute Angular unit specifications in Headless Chrome using Karma:
```bash
cd frontend
npm test
```

---

## 🔒 Security Measures
- **Rate Limiting**: Rate limiters applied to prevent API brute-forcing.
- **SQL Injection Prevention**: Parameterized Knex query building.
- **HTTP Headers**: Helmet headers configured for secure frame guards, XSS protection, and MIME sniff defense.
- **Inputs Validation**: Strict schema verification via `express-validator`.

---

## ♿ Accessibility (A11y) & Design
- Fully WCAG 2.1 AA compliant.
- High-contrast elements, dark/light theme options, and accessible color palettes.
- Structured ARIA roles, labels, and descriptions on all controls.
- Keyboard navigation friendly with visible focus-indicators.
