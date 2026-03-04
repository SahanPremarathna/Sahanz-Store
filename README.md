# Sahanz Store

Role-based storefront for customers, sellers, and delivery riders.

## Apps

- `apps/web`: React + Vite frontend with customer, seller, and delivery panels
- `apps/api`: Node + Express backend with demo auth, listings, orders, and delivery flows
- `packages/shared`: shared response helpers

## Demo roles

- `customer@sahanz.store`
- `seller@sahanz.store`
- `delivery@sahanz.store`

Use the role buttons in the top navigation to switch between panels.

## Quick start

```bash
npm install
npm run dev:api
npm run dev:web
```

## Supabase

The current UI and API run immediately using an in-memory demo store. For your
real database model, apply the SQL in
`apps/api/src/db/schema.sql` to your Supabase project.
