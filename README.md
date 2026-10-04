# Marwa — restaurant shop (MERN)

A small online shop for a restaurant with a short menu (4 to 10 dishes).

Customers browse the menu, add dishes to the cart, and place an order for delivery or pickup (pay on delivery/pickup).
The owner signs in at `/admin` to add, edit, hide, or delete dishes and to move orders through their statuses.

## Requirements
- Node.js 18+
- MongoDB (local or MongoDB Atlas)

## Setup

```bash
# 1. Server
cd server
cp .env.example .env      # then edit the values
npm install
npm run seed              # optional: adds 5 sample dishes
npm run dev               # http://localhost:5000

# 2. Client (new terminal)
cd client
npm install
npm run dev               # http://localhost:5173
```

Admin page: http://localhost:5173/admin (password = `ADMIN_PASSWORD` from `.env`).

## Production
```bash
cd client && npm run build
cd ../server && NODE_ENV=production npm start
```
The server then also serves the built client on the same port.

## Settings
- Restaurant name, currency, phone: `client/src/config.js`
- Menu limit (default 10): `MAX_FOODS` in `server/.env`

## API
| Method | Route | Access |
|---|---|---|
| GET | /api/foods | public (available dishes) |
| GET | /api/foods/all | admin |
| POST | /api/foods | admin |
| PUT | /api/foods/:id | admin |
| DELETE | /api/foods/:id | admin |
| POST | /api/orders | public |
| GET | /api/orders/:id | public (order status) |
| GET | /api/orders | admin |
| PATCH | /api/orders/:id/status | admin |
| POST | /api/auth/login | public |
