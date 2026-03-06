# Sahanz Store

A full-stack, role-based e-commerce platform built as a production-style monorepo.  
It supports three user roles with separate workflows: customer ordering, seller inventory management, and delivery task tracking.

## Why This Project Stands Out

- Multi-role product with route and API-level authorization
- Real business flow from product listing to order fulfillment and delivery updates
- Monorepo structure with shared package and clean separation of concerns
- Database-ready architecture with Supabase support and in-memory fallback for quick demos
- Deploy-ready configuration for Netlify (frontend) and Render (API)

## Role-Based Demo Access

Use the following credentials to explore all dashboards:

| Role | Email | Password |
| --- | --- | --- |
| Customer | `customer@sahanz.store` | `Password123!` |
| Seller | `seller@sahanz.store` | `Password123!` |
| Delivery | `delivery@sahanz.store` | `Password123!` |

## Tech Stack

- Frontend: React 18, Vite, React Router, Leaflet
- Backend: Node.js, Express
- Data layer: Supabase (PostgreSQL) with in-memory fallback store
- Auth/Security: HMAC-signed auth tokens, scrypt password hashing, role middleware
- Monorepo tooling: npm workspaces, concurrently

## Monorepo Structure

```text
.
|-- apps/
|   |-- web/        # React + Vite client
|   `-- api/        # Express API
|-- packages/
|   `-- shared/     # Shared helpers (response formatting)
|-- netlify.toml    # Frontend deploy config
`-- render.yaml     # API deploy config
```

## Core Features

- Customer:
  - Browse categories and product details
  - Add to cart and place orders with delivery information
  - Track order progress and cancel within allowed states
- Seller:
  - Create, edit, and remove product listings
  - Manage stock and update order progress
  - Maintain store profile details
- Delivery:
  - View assigned delivery tasks
  - Update statuses (`picked_up`, `in_transit`, `delivered`)
  - Access delivery location links in mapped order data

## API Overview

Base URL (local): `http://localhost:5000/api`

- Auth: `/auth/login`, `/auth/register`, `/auth/profile`
- Products: `/products`, `/products/categories`, `/products/mine`
- Orders: `/orders`, `/orders/:orderId/cancel`, `/orders/:orderId/seller-progress`
- Delivery: `/delivery`, `/delivery/:deliveryId/status`

## Local Setup

### 1) Prerequisites

- Node.js 20+
- npm 10+

### 2) Install Dependencies

```bash
npm install
```

### 3) Configure Environment Variables

Create `apps/api/.env`:

```env
PORT=5000
CLIENT_ORIGIN=http://localhost:5173
AUTH_TOKEN_SECRET=replace-with-a-secure-secret

# Optional (enables Supabase mode)
SUPABASE_URL=
SUPABASE_SERVICE_ROLE_KEY=
# SUPABASE_SECRET_KEY can be used as an alternative
```

Create `apps/web/.env`:

```env
VITE_API_BASE_URL=http://localhost:5000/api
```

If Supabase values are not set, the app automatically uses the local in-memory store for demo/development.

### 4) Run the App

```bash
npm run dev
```

Or run services separately:

```bash
npm run dev:api
npm run dev:web
```

## Build and Start

```bash
npm run build
npm run start
```

## Deployment

- Frontend: configured via [`netlify.toml`](./netlify.toml)
- Backend: configured via [`render.yaml`](./render.yaml)

## Database Schema

SQL schema files are available in:

- `apps/api/src/db/schema.sql`
- `apps/api/src/db/schemaCategories.sql`
- `apps/api/src/db/schemaPopulate.sql`

## Author

Sahan Premarathna  
GitHub: [@SahanPremarathna](https://github.com/SahanPremarathna)
