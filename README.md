<div align="center">

# 🗺️ Basarsoft GIS

**A full-stack web GIS application for drawing, editing and searching points, lines and polygons on an interactive map.**

[![CI](https://github.com/erayildirim/Basarsoft-GIS/actions/workflows/ci.yml/badge.svg)](https://github.com/erayildirim/Basarsoft-GIS/actions/workflows/ci.yml)
![.NET 8](https://img.shields.io/badge/.NET-8.0-512BD4?logo=dotnet&logoColor=white)
![React 19](https://img.shields.io/badge/React-19-61DAFB?logo=react&logoColor=black)
![OpenLayers](https://img.shields.io/badge/OpenLayers-10-1F6B75?logo=openlayers&logoColor=white)
![PostgreSQL + PostGIS](https://img.shields.io/badge/PostgreSQL-PostGIS-4169E1?logo=postgresql&logoColor=white)
![Docker](https://img.shields.io/badge/Docker-ready-2496ED?logo=docker&logoColor=white)

[**Live demo**](https://basarsoft-gis.onrender.com) · [API docs (Swagger)](https://basarsoft-gis.onrender.com/swagger) · [Getting started](#-getting-started) · [Deployment](#-deployment)

<img src="docs/screenshots/overview.png" alt="Basarsoft GIS – map overview" width="100%" />

</div>

> Developed during my internship at **Başarsoft**. The backend is an ASP.NET Core Web API that stores geometries in PostgreSQL/PostGIS through EF Core + NetTopologySuite; the frontend is a React app built on OpenLayers.

> [!NOTE]
> The live demo runs on Render's free tier, so the first request after a period of inactivity can take **~30–60 seconds** while the service wakes up. The demo database is public – feel free to add, edit and delete features.

---

## ✨ Features

- **Three geometry types** – points, lines (LineString) and polygons, each with full CRUD.
- **Draw on the map** – click to place points, click/double-click to draw lines and polygons.
- **Edit in place** – select a feature to rename it or drag its vertices; *Cancel* reverts unsaved geometry changes.
- **Manual coordinate entry** – add a point, a line (start/end) or a 3–10 corner polygon by typing latitude/longitude.
- **Global search** – case-insensitive search across all geometry types with a type filter, keyboard navigation and zoom-to-result.
- **Infinite-scroll sidebar** – server-side pagination (`/paged` endpoints) so large datasets stay fast.
- **Validation** – WKT parsing, coordinate range checks (±180 / ±90) and polygon validity (e.g. no self-intersections), with clear error messages in the UI.
- **Keyboard shortcuts** – `Ctrl + F` search, `1` / `2` / `3` switch between points, lines and polygons.
- **Responsive layout** – the sidebar moves below the map on small screens.
- **Swagger UI** – interactive API documentation at `/swagger`.
- **One-container deployment** – the API also serves the production React build; migrations run automatically on startup.

## 📸 Screenshots

| Search across all geometry types | Editing a polygon |
|:---:|:---:|
| <img src="docs/screenshots/search.png" alt="Search" /> | <img src="docs/screenshots/edit-polygon.png" alt="Edit polygon" /> |
| **Drawing a new line** | **Manual coordinate entry** |
| <img src="docs/screenshots/draw-line.png" alt="Draw line" /> | <img src="docs/screenshots/manual-polygon.png" alt="Manual polygon entry" /> |

<details>
<summary><b>Mobile view & API documentation</b></summary>
<br />
<p align="center">
  <img src="docs/screenshots/mobile.png" alt="Mobile layout" width="280" />
  &nbsp;&nbsp;
  <img src="docs/screenshots/swagger.png" alt="Swagger UI" width="560" />
</p>
</details>

## 🧰 Tech Stack

| Layer | Technologies |
|---|---|
| **Frontend** | React 19, OpenLayers 10, Axios, Create React App |
| **Backend** | ASP.NET Core 8 Web API, Entity Framework Core 9, NetTopologySuite, Swashbuckle (Swagger) |
| **Database** | PostgreSQL + PostGIS (`geometry` columns, SRID 4326) via Npgsql |
| **DevOps** | Docker (multi-stage build), GitHub Actions CI, Render Blueprint |

## 🏗️ Architecture

```mermaid
flowchart LR
    subgraph Browser
        UI["React + OpenLayers<br/>(map, sidebar, search, modals)"]
    end
    subgraph API["ASP.NET Core 8 Web API"]
        C["Controllers<br/>Point · Line · Polygon · Search"]
        S["Services<br/>validation, paging, search"]
        R["Repositories + Unit of Work<br/>(generic repository pattern)"]
        C --> S --> R
    end
    DB[("PostgreSQL + PostGIS")]
    UI -- "REST / JSON (WKT geometries)" --> C
    R -- "EF Core + NetTopologySuite" --> DB
```

Geometries travel between the client and the API as **WKT** in WGS84 (`EPSG:4326`, `lon lat` order). OpenLayers renders them in Web Mercator (`EPSG:3857`) on top of OpenStreetMap tiles.

<details>
<summary><b>Project structure</b></summary>

```text
Basarsoft-GIS/
├── Basarsoft/                    # ASP.NET Core Web API
│   ├── Controllers/              # Point, Line, Polygon, Search endpoints
│   ├── Services/                 # Business logic, validation, paging, search
│   ├── Interfaces/               # Service & repository contracts (+ Line/Polygon repositories)
│   ├── Models/                   # EF Core entities with NetTopologySuite geometries
│   ├── Dtos/                     # Request/response models (WKT <-> geometry)
│   ├── Helpers/                  # Coordinate validation, search pattern helpers
│   ├── Data/                     # Connection string resolver, demo data seeder
│   ├── Migrations/               # EF Core migrations (creates the PostGIS extension)
│   ├── GenericRepository.cs      # Generic repository
│   ├── UnitOfWork.cs
│   └── Program.cs                # DI, CORS, Swagger, migrations, static files
├── frontend/                     # React app
│   └── src/
│       ├── api/                  # Axios API clients
│       └── components/
│           ├── map/              # OpenLayers map (draw / select / modify)
│           ├── layout/           # Header, infinite-scroll sidebar
│           ├── search/           # Global search box
│           ├── forms/            # Manual entry modals
│           └── common/           # Colors, spinner, notifications
├── docs/screenshots/
├── Dockerfile                    # Builds React + API into one image
├── render.yaml                   # Render Blueprint
└── .github/workflows/ci.yml      # Build & test on every push
```
</details>

## 🚀 Getting Started

### Prerequisites

- [.NET 8 SDK](https://dotnet.microsoft.com/download/dotnet/8.0)
- [Node.js 20+](https://nodejs.org/)
- PostgreSQL 14+ with the **PostGIS** extension available (e.g. the PostGIS bundle from Stack Builder on Windows, or Docker – see below)

### 1. Start a database

Any PostGIS-enabled PostgreSQL works. The quickest way is Docker:

```bash
docker run -d --name basarsoft-db -p 5432:5432 \
  -e POSTGRES_PASSWORD=123456 postgis/postgis:16-3.4
```

The default connection string in [`appsettings.json`](Basarsoft/appsettings.json) is
`Host=localhost;Port=5432;Database=postgres;Username=postgres;Password=123456`. Change it there, or override it with an environment variable (see [Configuration](#%EF%B8%8F-configuration)).

### 2. Run the API

```bash
cd Basarsoft
dotnet run --launch-profile http
```

On startup the API applies EF Core migrations automatically (this also runs `CREATE EXTENSION postgis`). Swagger UI opens at **http://localhost:5222/swagger**.

> Want sample data? Start it with `Database__SeedDemoData=true` to insert a few Turkish landmarks into an empty database.

### 3. Run the frontend

```bash
cd frontend
npm install
npm start
```

The app opens at **http://localhost:7269**. API requests to `/api` are proxied to `http://localhost:5222` (see `proxy` in [`package.json`](frontend/package.json)), so no extra configuration is needed.

### Run everything in one container

```bash
docker build -t basarsoft-gis .
docker run -p 8080:8080 \
  -e DATABASE_URL="postgresql://postgres:123456@host.docker.internal:5432/postgres" \
  -e Database__SeedDemoData=true \
  basarsoft-gis
```

Then open http://localhost:8080.

## ⚙️ Configuration

All settings can be provided through `appsettings.json` or environment variables (`__` separates sections).

| Setting | Default | Description |
|---|---|---|
| `DATABASE_URL` | – | PostgreSQL URL (`postgresql://user:pass@host:5432/db?sslmode=require`). Takes precedence over the connection string below. |
| `ConnectionStrings__DefaultConnection` | local `postgres` DB | Npgsql connection string. |
| `Database__MigrateOnStartup` | `true` | Apply EF Core migrations when the app starts. |
| `Database__SeedDemoData` | `false` | Insert sample points/lines/polygons if the database is empty. |
| `Cors__AllowedOrigins__0`, `__1`, … | `http://localhost:7269`, `http://localhost:3000` | Origins allowed to call the API when the UI is hosted separately. |
| `PORT` | – | Port to listen on (set automatically by Render and similar platforms). |
| `REACT_APP_API_URL` *(frontend, build time)* | same origin | Base URL of the API if the React app is hosted on a different domain. |

## 📡 API Reference

The same set of endpoints exists for `point`, `line` and `polygon`:

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/{type}` | List all features |
| `GET` | `/api/{type}/paged?page=1&pageSize=15&searchTerm=` | Paged list (max page size 100) |
| `GET` | `/api/{type}/{id}` | Get one feature |
| `POST` | `/api/{type}` | Create from WKT – `{ "name": "...", "wkt": "POINT(32.83 39.92)" }` |
| `POST` | `/api/{type}/manual` | Create from coordinates (see below) |
| `PUT` | `/api/{type}/{id}` | Update name and geometry (WKT) |
| `DELETE` | `/api/{type}/{id}` | Delete a feature |
| `GET` | `/api/search?searchTerm=&geometryType=&maxResults=20` | Case-insensitive search across all types |
| `GET` | `/health` | Health check |

<details>
<summary><b>Manual entry request bodies</b></summary>

```jsonc
// POST /api/point/manual
{ "name": "Anıtkabir", "latitude": 39.9250, "longitude": 32.8369 }

// POST /api/line/manual
{ "name": "Ankara - Kayseri", "startLatitude": 39.93, "startLongitude": 32.86,
  "endLatitude": 38.72, "endLongitude": 35.48 }

// POST /api/polygon/manual  (the ring is closed automatically)
{ "name": "Cappadocia", "coordinates": [
    { "latitude": 38.75, "longitude": 34.70 }, { "latitude": 38.75, "longitude": 35.00 },
    { "latitude": 38.55, "longitude": 35.00 }, { "latitude": 38.55, "longitude": 34.70 } ] }
```

More examples are in [`Basarsoft.http`](Basarsoft/Basarsoft.http).
</details>

## ☁️ Deployment

The project deploys as **a single free web service on [Render](https://render.com)** (Docker) plus a **free PostGIS database on [Neon](https://neon.tech)**.

[![Deploy to Render](https://render.com/images/deploy-to-render-button.svg)](https://render.com/deploy?repo=https://github.com/erayildirim/Basarsoft-GIS)

1. **Create the database** – sign up at [neon.tech](https://neon.tech), create a project and copy the connection string
   (`postgresql://user:password@ep-xxx.region.aws.neon.tech/neondb?sslmode=require`).
   PostGIS is created automatically by the first migration.
2. **Create the web service** – click the *Deploy to Render* button above (or *New → Blueprint* and select this repo). Render reads [`render.yaml`](render.yaml), builds the [`Dockerfile`](Dockerfile) and asks for `DATABASE_URL` – paste the Neon connection string.
3. **Done** – after the first build (~5 min) the app is live at `https://<service-name>.onrender.com`, with Swagger at `/swagger`. Every push to the `final` branch redeploys automatically.

> Render's own PostgreSQL also supports PostGIS and works with the same `DATABASE_URL` variable, but free Render databases expire after 30 days (at the time of writing) – Neon's free tier does not.

## 🧪 Tests & CI

```bash
cd frontend && npm test          # React component tests (Jest + Testing Library)
cd Basarsoft && dotnet build     # Backend builds with zero warnings
```

GitHub Actions ([`ci.yml`](.github/workflows/ci.yml)) builds the API, runs the frontend tests, creates a production build and builds the Docker image on every push and pull request.

## 👤 Author

**Eray** – [@erayildirim](https://github.com/erayildirim)

Built as an internship project at [Başarsoft](https://www.basarsoft.com.tr/). Map data © [OpenStreetMap](https://www.openstreetmap.org/copyright) contributors.
