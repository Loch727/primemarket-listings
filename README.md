# PrimeMarket — Property Listing System

A MERN stack property listing app built as part of the PrimeMarket internship technical assignment.

---

## Tech Stack

- **Frontend:** Next.js 14 (App Router)
- **Backend:** Node.js + Express
- **Database:** MongoDB + Mongoose

---

## Setup

### Backend

```bash
cd backend
npm install
cp .env.example .env   # fill in your MONGO_URI
npm run dev            # runs on http://localhost:5001
```

### Frontend

```bash
cd frontend
npm install
cp .env.local.example .env.local
npm run dev            # runs on http://localhost:3000
```

---

## Pages

| Page | URL |
|---|---|
| Home | `/` |
| Create Listing | `/listings/new` |
| Public Listings | `/listings` |
| Admin Panel | `/admin` |

---

## API Endpoints

| Method | Endpoint | Description |
|---|---|---|
| `POST` | `/api/listings` | Submit a new listing |
| `GET` | `/api/listings` | Get all active listings |
| `GET` | `/api/admin/listings` | Get all listings (admin) |
| `PATCH` | `/api/admin/listings/:id/accept` | Approve a listing |
| `DELETE` | `/api/admin/listings/:id` | Delete a listing |
