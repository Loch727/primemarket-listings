# PrimeMarket — Property Listing System

A full-stack MERN (MongoDB, Express, React, Node.js) property listing app with rental support and an admin approval workflow. Built as part of the PrimeMarket internship technical assignment.

---

## Table of Contents

- [Project Structure](#project-structure)
- [Tech Stack](#tech-stack)
- [How to Run](#how-to-run)
- [Pages & What They Do](#pages--what-they-do)
- [API Endpoints](#api-endpoints)
- [Database Schema](#database-schema)
- [How the Approval Flow Works](#how-the-approval-flow-works)
- [Validation Rules](#validation-rules)
- [Demo Walkthrough](#demo-walkthrough)
- [Design Decisions & Interview Q&A](#design-decisions--interview-qa)

---

## Project Structure

```
primemarket-listings/
│
├── backend/                        → Node.js + Express API server
│   ├── models/
│   │   └── Listing.js              → Mongoose schema for all listings
│   ├── routes/
│   │   ├── listings.js             → Public API routes (create + fetch active)
│   │   └── admin.js                → Admin API routes (all listings, accept, delete)
│   ├── server.js                   → Entry point — sets up Express + MongoDB connection
│   ├── .env                        → Your environment variables (not committed to git)
│   ├── .env.example                → Template showing what .env should look like
│   └── package.json
│
├── frontend/                       → Next.js frontend (App Router)
│   ├── app/
│   │   ├── layout.js               → Shared layout with navigation bar
│   │   ├── page.js                 → Home page
│   │   ├── listings/
│   │   │   ├── page.js             → Public listings page (active listings only)
│   │   │   └── new/
│   │   │       └── page.js         → Create Listing form
│   │   └── admin/
│   │       └── page.js             → Admin panel (review + approve + delete)
│   ├── lib/
│   │   └── api.js                  → Axios instance — all API calls go through this
│   ├── .env.local                  → Frontend environment variables
│   ├── .env.local.example          → Template for .env.local
│   └── package.json
│
└── README.md
```

---

## Tech Stack

| Layer | Technology | Purpose |
|---|---|---|
| Frontend | Next.js 14 (App Router) | UI and page routing |
| HTTP Client | Axios | API calls from frontend to backend |
| Backend | Node.js + Express | REST API server |
| Database | MongoDB + Mongoose | Data storage and schema validation |
| Dev Tool | Nodemon | Auto-restarts backend on file changes |

---

## How to Run

### Prerequisites
- Node.js v18 or higher
- A MongoDB connection (local `mongod` or MongoDB Atlas free tier)

### 1. Backend

```bash
cd backend
npm install
# Make sure .env exists with your MONGO_URI and PORT
npm run dev
```

The backend starts at `http://localhost:5001`

Your `.env` file should contain:
```
MONGO_URI=your_mongodb_connection_string
PORT=5001
```

### 2. Frontend

```bash
cd frontend
npm install
# Make sure .env.local exists
npm run dev
```

The frontend starts at `http://localhost:3000`

Your `.env.local` file should contain:
```
NEXT_PUBLIC_API_URL=http://localhost:5001/api
```

---

## Pages & What They Do

### Home — `/`
A simple welcome page with buttons to navigate to the listings page or the create listing form.

### Create Listing — `/listings/new`
A form for submitting a new property listing. When the user selects **"Rent"** as the listing type, six additional sections appear dynamically:

| Section | Fields |
|---|---|
| Rental Pricing | Rent Price, Billing Cycle, Security Deposit |
| Availability | Available From (date) |
| Lease Terms | Lease Term (6 months / 1 year / Flexible) |
| Tenant Preference | Tenant Type (Family / Bachelor / Students) |
| Property Info | Furnishing Level, Parking Available |
| Media | Video Link (YouTube or Google Drive only) |

If the listing type is **"Sale"**, none of the rental sections appear and no rental data is sent to the backend.

Every submitted listing is saved with `status: "pending"` and will not appear on the public listings page until an admin approves it.

### Listings Page — `/listings`
Fetches and displays all listings where `status === "active"`. These are listings that have been approved by an admin. Each card shows:
- Title and listing type badge (Sale / Rent)
- Location
- Price
- For rental listings: rent price, billing cycle, lease term, furnishing, and tenant type

If no active listings exist, a placeholder message is shown.

### Admin Panel — `/admin`
The internal dashboard for managing submissions. It shows:
- A stats bar with total, pending, and active counts
- A **Pending Approval** section listing all unreviewed submissions
- An **Active Listings** section showing all approved listings

Each listing card has two action buttons:

**Accept** — Calls the backend to change the listing's status from `pending` to `active`. The button disables immediately on click to prevent double submissions, and permanently shows "✓ Accepted" once approved.

**Delete** — Asks for confirmation, then permanently removes the listing from the database. The card disappears from the page instantly after deletion.

---

## API Endpoints

### Public

| Method | Endpoint | Description |
|---|---|---|
| `POST` | `/api/listings` | Submit a new listing (always saved as pending) |
| `GET` | `/api/listings` | Get all active listings only |

### Admin

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/admin/listings` | Get ALL listings (pending + active) |
| `PATCH` | `/api/admin/listings/:id/accept` | Approve a listing (pending → active) |
| `DELETE` | `/api/admin/listings/:id` | Permanently delete a listing |

---

## Database Schema

All listings are stored in a single MongoDB collection using this Mongoose schema:

```
Listing {
  title          String   (required)
  description    String
  price          Number   (required)
  category       String   (default: "property")
  status         String   (enum: "pending" | "active", default: "pending")

  property {
    listing_type   String   (required, enum: "sale" | "rent")
    property_type  String
    bedrooms       Number
    bathrooms      Number
  }

  location {
    city           String
    district       String
    province       String
  }

  media          [String]
  video_link     String   (optional, must be YouTube or Google Drive URL)

  rental {                 ← only populated when listing_type === "rent"
    rent_price         Number   (must be positive)
    billing_cycle      String   (enum: "Monthly" | "Weekly" | "Daily")
    security_deposit   Number
    available_from     Date
    lease_term         String   (enum: "6 months" | "1 year" | "Flexible")
    tenant_type        String   (enum: "Family" | "Bachelor" | "Students")
    furnishing         String   (enum: "Furnished" | "Semi" | "Unfurnished")
    parking_available  Boolean
  }

  createdAt      Date     (auto)
  updatedAt      Date     (auto)
}
```

---

## How the Approval Flow Works

```
User submits form
      ↓
Listing saved to MongoDB with status = "pending"
      ↓
Admin opens /admin panel
      ↓
Admin clicks "Accept"
      ↓
PATCH request sent to /api/admin/listings/:id/accept
      ↓
Backend updates status to "active"
      ↓
Listing now appears on /listings (public page)
```

Listings with `status: "pending"` are never returned by `GET /api/listings`, so users cannot see unapproved content.

---

## Validation Rules

Validation happens on both the frontend (for user experience) and the backend (for data integrity).

| Field | Rule |
|---|---|
| `title` | Required |
| `price` | Required |
| `listing_type` | Required, must be "sale" or "rent" |
| `rent_price` | Required if rent, must be a positive number |
| `billing_cycle` | Required if rent, must be "Monthly", "Weekly", or "Daily" |
| `video_link` | Optional, but must contain `youtube.com`, `youtu.be`, or `drive.google.com` |

---

## Demo Walkthrough

Follow these steps to demonstrate the full flow:

1. Open `http://localhost:3000/listings/new`
2. Fill in Title, Price, and select **Rent** as the listing type
3. Watch the six rental sections appear dynamically
4. Fill in the rental fields and submit
5. You should see a green success message — listing is now **pending**
6. Open `http://localhost:3000/listings` — the listing does **not** appear yet
7. Open `http://localhost:3000/admin` — the listing appears under **Pending Approval**
8. Click **Accept** — the button changes to "✓ Accepted"
9. Refresh `http://localhost:3000/listings` — the listing now appears publicly
10. To remove a listing, go back to Admin and click **Delete**

---

## Design Decisions & Interview Q&A

**Why are rental fields grouped inside a `rental` object in the schema?**
Grouping them keeps the document clean and self-documenting. It makes it immediately obvious which fields only apply to rentals. It also makes querying easier — you can do `listing.rental.rent_price` rather than having flat fields like `rental_rent_price` mixed in with everything else. In MongoDB, sub-documents are a natural fit for logically related data.

**Which fields are optional and why?**
Required fields are only those needed to make a listing functional and searchable: title, price, listing type, and (for rentals) rent price and billing cycle. Fields like security deposit, available date, and tenant type are optional because landlords may not always have that information ready at the time of submission, or may choose not to disclose it.

**How would you scale this schema in the future?**
Add indexes on `status`, `location.city`, and `property.listing_type` for faster queries. Add pagination to `GET /api/listings`. If rental data grows complex, split it into its own collection and reference it by ID. Add a `rejectedAt` or `rejectionReason` field to support a rejection flow alongside approval.

**Why do we validate on the backend even if the frontend also validates?**
Frontend validation can be bypassed entirely — anyone can send a raw HTTP request directly to the API using tools like Postman or curl, skipping the UI completely. Backend validation is the actual line of defence. Invalid data that reaches the database causes silent bugs, broken calculations, and security risks that are hard to trace later.

**Why separate `/api/admin/listings` from `/api/listings`?**
The public route only exposes approved content. The admin route exposes everything. Keeping them separate makes it easy to add authentication middleware later (e.g. require an admin token for any `/api/admin/*` route) without touching the public API. It also follows the principle of least privilege — public users should never even be able to request pending listings.

**Why do we need a "pending" state?**
It prevents unreviewed or spam listings from going live immediately. It gives the admin a chance to check for accuracy, inappropriate content, or duplicates before the listing is publicly visible. In a real system, the "pending" state would also trigger a notification to the submitter that their listing is under review.

**How would you handle rejection in a real system?**
Add a `PATCH /api/admin/listings/:id/reject` endpoint that sets status to `"rejected"` and optionally stores a `rejection_reason` string. The frontend could then show the submitter why their listing was turned down and allow them to edit and resubmit.
