# CRM — Customer Relationship Management

A full-stack CRM web application for managing companies, contacts, and users — built with React, Node.js, and PostgreSQL. Features role-based access control, server-side pagination, sortable tables, and a responsive mobile-first design.

🔗 **Live Demo:** [crm-project-theta-six.vercel.app](https://crm-project-theta-six.vercel.app)

📁 **Portfolio:** [davideb96.github.io/EnPortfolio](https://davideb96.github.io/EnPortfolio/)

---

## Live Preview

<img width="954" height="476" alt="Preview Crm-project" src="https://github.com/user-attachments/assets/dc04d73c-f874-45a4-bd65-d0fd9a1b4c61" />


## Features

**Authentication & Security**
- JWT-based registration and login with hashed passwords (bcrypt)
- Automatic token expiration handling with redirect to login
- Role-based access control (Admin / Operator)
- Protected routes on both frontend and backend

**Companies & Contacts Management**
- Full CRUD operations for companies and contacts
- Contacts linked to companies via relational foreign keys
- Detail pages with inline editing for both companies and contacts
- Client-side form validation with visual error feedback

**Data Handling**
- Server-side pagination with configurable page size
- Server-side search with PostgreSQL `ILIKE` and debounced input (300ms)
- Sortable table columns (click header to toggle ASC/DESC)
- Dashboard with real-time statistics and recent contacts

**Admin Panel**
- User management interface (visible only to admins)
- Change user roles (admin ↔ operator) via dropdown
- Delete users with confirmation (admins cannot delete themselves)
- Self-protection: admins cannot change their own role

**UI & Responsive Design**
- Mobile-first responsive layout with Tailwind CSS
- Card view on mobile, table view on desktop
- Hamburger menu with overlay dismiss
- Toast notifications (success/error) with auto-dismiss
- Footer with dynamic copyright year and portfolio link

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 18, React Router, Axios, Tailwind CSS, Vite |
| Backend | Node.js, Express.js |
| Database | PostgreSQL |
| Auth | JWT (jsonwebtoken), bcrypt.js |
| Deployment | Vercel (frontend), Render (backend + database) |

---

## Project Structure

```
crm-project/
├── client/                     # React Frontend
│   └── src/
│       ├── components/         # Navbar, Footer, Notifications
│       ├── pages/              # Login, Register, Dashboard, Companies,
│       │                         Contacts, ContactDetail, CompanyDetail,
│       │                         AdminPanel
│       └── services/           # Axios instance with request/response
│                                 interceptors
│
├── server/                     # Node.js Backend
│   ├── config/                 # PostgreSQL pool (SSL conditional)
│   ├── middleware/             # JWT auth + role-based access middleware
│   └── routes/                 # REST API (auth, companies, contacts, users)
│
└── README.md
```

---

## API Endpoints

### Authentication (Public)

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/register` | Register new user (default role: operator) |
| POST | `/api/auth/login` | Login and receive JWT token |

### Companies (Protected)

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/companies?page=1&limit=10&search=&sortBy=name&sortOrder=asc` | List companies (paginated, searchable, sortable) |
| GET | `/api/companies/all` | List all companies (for dropdowns) |
| GET | `/api/companies/:id` | Get single company |
| POST | `/api/companies` | Create company |
| PUT | `/api/companies/:id` | Update company |
| DELETE | `/api/companies/:id` | Delete company (admin only) |

### Contacts (Protected)

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/contacts?page=1&limit=10&search=&sortBy=first_name&sortOrder=asc` | List contacts (paginated, searchable, sortable) |
| GET | `/api/contacts/:id` | Get single contact |
| POST | `/api/contacts` | Create contact |
| PUT | `/api/contacts/:id` | Update contact |
| DELETE | `/api/contacts/:id` | Delete contact (admin only) |

### Users (Admin Only)

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/users` | List all users |
| PUT | `/api/users/:id/role` | Change user role |
| DELETE | `/api/users/:id` | Delete user |

---

## Database Schema

```sql
CREATE TABLE users (
  id SERIAL PRIMARY KEY,
  username VARCHAR(50) UNIQUE NOT NULL,
  email VARCHAR(100) UNIQUE NOT NULL,
  password VARCHAR(255) NOT NULL,
  role VARCHAR(20) DEFAULT 'operator',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE companies (
  id SERIAL PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  industry VARCHAR(50),
  email VARCHAR(100),
  phone VARCHAR(20),
  address TEXT,
  created_by INTEGER REFERENCES users(id),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE contacts (
  id SERIAL PRIMARY KEY,
  first_name VARCHAR(50) NOT NULL,
  last_name VARCHAR(50) NOT NULL,
  email VARCHAR(100),
  phone VARCHAR(20),
  role VARCHAR(50),
  company_id INTEGER REFERENCES companies(id),
  created_by INTEGER REFERENCES users(id),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

---

## Getting Started

### Prerequisites
- Node.js (v18+)
- PostgreSQL (v14+)

### 1. Clone the repository
```bash
git clone https://github.com/DavideB96/crm-project.git
cd crm-project
```

### 2. Setup the database
```bash
psql -U postgres
CREATE DATABASE crm_db;
\c crm_db
```
Then run the SQL from the Database Schema section above.

### 3. Setup the backend
```bash
cd server
npm install
```

Create a `.env` file in the server folder:
```
PORT=5000
DB_USER=postgres
DB_PASSWORD=your_password
DB_HOST=localhost
DB_PORT=5432
DB_NAME=crm_db
JWT_SECRET=your_secret_key
NODE_ENV=development
```

Start the server:
```bash
node index.js
```

### 4. Setup the frontend
```bash
cd client
npm install
npm run dev
```

The app will be running at `http://localhost:5173`

> **Note:** For local development, update the `baseURL` in `client/src/services/api.js` to `http://localhost:5000/api`

---

## What I Learned

- Designing and consuming REST APIs with Express and PostgreSQL
- JWT authentication flow with role-based authorization middleware
- Server-side pagination, search (ILIKE), and sorting with SQL injection prevention (allowlist pattern)
- React state management with hooks (useState, useEffect, useCallback)
- Axios interceptors for automatic token injection and expiration handling
- Responsive design patterns: table ↔ card view switching with Tailwind CSS breakpoints
- Debouncing user input for optimized API calls
- Express route ordering: named routes before parameterized routes
- Full-stack deployment pipeline: Vercel (frontend) + Render (backend + PostgreSQL)

---

## Author

**Davide** — Career changer from contact center operations (7 years) to web development, bringing real-world business process knowledge into software development.
