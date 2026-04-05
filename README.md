# Finance Data Processing and Access Control Backend

A RESTful backend for a finance dashboard system with role-based access control (RBAC), financial record management, and dashboard analytics.

---

## Tech Stack

- **Runtime**: Node.js (ESM modules)
- **Framework**: Express.js
- **Database**: MongoDB with Mongoose
- **Authentication**: JWT (Bearer token)
- **Validation**: express-validator

---

## Project Structure

```
src/
├── config/           # MongoDB connection
├── controllers/      # Request handlers (thin layer, delegates to services)
├── middleware/        # auth (JWT), rbac (role guard), validate (input errors)
├── models/           # Mongoose schemas
├── routes/           # Route definitions with middleware chains
├── services/         # Business logic and data access
├── utils/            # ApiError, ApiResponse, asyncHandler
├── app.js            # Express setup, global error handler
└── server.js         # Entry point
scripts/
└── seed.js           # Seeds admin + sample data
```

---

## Setup

### 1. Install dependencies

```bash
npm install
```

### 2. Configure environment

```bash
cp .env.example .env
```

Edit `.env` with your MongoDB URI and a strong JWT secret.

### 3. Seed the database (optional)

Creates an admin, an analyst, a viewer, and 10 sample transactions.

```bash
npm run seed
```

| Role     | Email                  | Password    |
|----------|------------------------|-------------|
| admin    | admin@example.com      | admin123    |
| analyst  | analyst@example.com    | analyst123  |
| viewer   | viewer@example.com     | viewer123   |

### 4. Start the server

```bash
# Development (with auto-reload)
npm run dev

# Production
npm start
```

Server starts on `http://localhost:3000` by default.

---

## Roles and Permissions

| Action                             | Viewer | Analyst | Admin |
|------------------------------------|--------|---------|-------|
| Register / Login                   | ✅     | ✅      | ✅    |
| View own profile (`/auth/me`)      | ✅     | ✅      | ✅    |
| View transactions (list + detail)  | ✅     | ✅      | ✅    |
| Create / update / delete transactions | ❌  | ❌      | ✅    |
| View recent activity               | ✅     | ✅      | ✅    |
| View summary, category, trends     | ❌     | ✅      | ✅    |
| Manage users (CRUD + status)       | ❌     | ❌      | ✅    |

> **Note:** The first user to register is automatically assigned the `admin` role. All subsequent self-registrations become `viewer`. Admins can create users with any role via `POST /api/users`.

---

## API Reference

All protected routes require the header:

```
Authorization: Bearer <token>
```

---

### Auth

| Method | Endpoint          | Description              | Auth |
|--------|-------------------|--------------------------|------|
| POST   | `/api/auth/register` | Register (viewer by default) | No |
| POST   | `/api/auth/login`    | Login, returns JWT       | No   |
| GET    | `/api/auth/me`       | Get current user profile | Yes  |

**Register / Login body:**
```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "password123"
}
```

---

### Users (Admin only)

| Method | Endpoint                  | Description              |
|--------|---------------------------|--------------------------|
| GET    | `/api/users`              | List users (paginated)   |
| POST   | `/api/users`              | Create a user            |
| GET    | `/api/users/:id`          | Get user by ID           |
| PUT    | `/api/users/:id`          | Update user              |
| DELETE | `/api/users/:id`          | Permanently delete user  |
| PATCH  | `/api/users/:id/status`   | Toggle active/inactive   |

**Query params for GET /api/users:** `page`, `limit`, `role`, `status`

**Create / Update user body:**
```json
{
  "name": "Jane Doe",
  "email": "jane@example.com",
  "password": "pass123",
  "role": "analyst",
  "status": "active"
}
```

---

### Transactions

| Method | Endpoint                   | Description                        | Roles            |
|--------|----------------------------|------------------------------------|------------------|
| GET    | `/api/transactions`        | List transactions (filtered)       | All              |
| POST   | `/api/transactions`        | Create transaction                 | Admin            |
| GET    | `/api/transactions/:id`    | Get transaction by ID              | All              |
| PUT    | `/api/transactions/:id`    | Update transaction                 | Admin            |
| DELETE | `/api/transactions/:id`    | Soft-delete transaction            | Admin            |

**Query params for GET /api/transactions:**

| Param       | Type   | Example                  |
|-------------|--------|--------------------------|
| `type`      | string | `income` or `expense`    |
| `category`  | string | `salary`, `rent`, etc.   |
| `startDate` | ISO date | `2024-01-01`           |
| `endDate`   | ISO date | `2024-12-31`           |
| `search`    | string | free-text on notes/category |
| `page`      | int    | `1`                      |
| `limit`     | int    | `20` (max 100)           |

**Create transaction body:**
```json
{
  "amount": 5000,
  "type": "income",
  "category": "salary",
  "date": "2024-03-15",
  "notes": "March salary"
}
```

**Available categories:** `salary`, `freelance`, `investment`, `rent`, `utilities`, `groceries`, `entertainment`, `healthcare`, `transport`, `education`, `other`

---

### Dashboard

| Method | Endpoint                        | Description                       | Roles           |
|--------|---------------------------------|-----------------------------------|-----------------|
| GET    | `/api/dashboard/summary`        | Total income, expenses, net balance | Analyst, Admin |
| GET    | `/api/dashboard/categories`     | Totals grouped by category        | Analyst, Admin  |
| GET    | `/api/dashboard/trends/monthly` | Monthly income/expense breakdown  | Analyst, Admin  |
| GET    | `/api/dashboard/trends/weekly`  | Last 4 weeks breakdown            | Analyst, Admin  |
| GET    | `/api/dashboard/recent`         | Recent transactions (default 10)  | All             |

**Query params:**
- `/api/dashboard/trends/monthly?year=2024`
- `/api/dashboard/categories?type=expense`
- `/api/dashboard/recent?limit=5`

---

## Response Format

All responses follow a consistent envelope:

```json
{
  "statusCode": 200,
  "success": true,
  "message": "Description of result",
  "data": { ... }
}
```

Error responses:
```json
{
  "success": false,
  "statusCode": 422,
  "message": "Validation failed.",
  "errors": [
    { "field": "amount", "message": "Amount must be a positive number" }
  ]
}
```

---

## Assumptions and Design Decisions

1. **First-user admin**: The first `POST /api/auth/register` call creates an admin. All subsequent registrations via the public endpoint create viewers. Admins can create users with any role via `POST /api/users`.

2. **Soft delete for transactions**: Transactions are soft-deleted (`isDeleted: true`) rather than hard-deleted to preserve financial audit trails. The Mongoose `pre(/^find/)` hook excludes them from all queries automatically.

3. **Category list is fixed**: Categories are defined as an enum in the schema (`salary`, `rent`, etc.) to keep data consistent for aggregation. An `other` category is provided for anything that doesn't fit.

4. **Viewer access to transactions**: Viewers can read transactions and recent activity, as they represent a basic "read-only dashboard" role. They cannot access summary analytics which require analyst or admin.

5. **Pagination defaults**: Page defaults to 1, limit defaults to 20. Maximum limit is capped at 100 to prevent oversized queries.

6. **Password field**: The `password` field uses `select: false` in the schema, so it is never returned in any API response unless explicitly selected (only done in the login service for comparison).
