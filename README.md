# CRM - Customer Relationship Management

A full-stack CRM web application built to manage companies and contacts with authentication, built from real-world experience working in contact center environments.

## Live Preview

<img width="950" height="476" alt="CRM-Project2" src="https://github.com/user-attachments/assets/20badefd-2a03-47bb-990c-4244d1d43453" />


## Features

- **Authentication** — Secure registration and login with JWT tokens
- **Companies Management** — Full CRUD operations for managing client companies
- **Contacts Management** — Full CRUD with company association via relational database
- **Dashboard** — Overview with real-time statistics and recent contacts
- **Search & Filter** — Real-time search across companies and contacts
- **Form Validation** — Client-side validation with visual error feedback
- **Notifications** — Success/error toast notifications on all operations
- **Responsive Design** — Mobile-first design with hamburger menu navigation
- **Protected Routes** — Frontend route guards and backend middleware authentication

## Tech Stack

### Frontend
- React 18
- React Router DOM
- Axios
- Tailwind CSS
- Vite

### Backend
- Node.js
- Express.js
- PostgreSQL
- JSON Web Tokens (JWT)
- bcrypt.js

## Project Structure
```
crm-project/
├── client/                 # React Frontend
│   └── src/
│       ├── components/     # Reusable components (Navbar, Notification)
│       ├── pages/          # Page components (Login, Dashboard, etc.)
│       └── services/       # API service with Axios interceptors
│
├── server/                 # Node.js Backend
│   ├── config/             # Database connection (PostgreSQL pool)
│   ├── middleware/          # JWT authentication middleware
│   └── routes/             # REST API routes (auth, companies, contacts)
│
└── README.md
```

## Database Schema

The application uses three relational tables:

- **users** — Authentication with hashed passwords and role-based access
- **companies** — Client companies with industry, contact info, and address
- **contacts** — Individual contacts linked to companies via foreign key

## API Endpoints

### Authentication
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | /api/auth/register | Register new user |
| POST | /api/auth/login | Login and receive JWT |

### Companies (Protected)
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | /api/companies | Get all companies |
| GET | /api/companies/:id | Get single company |
| POST | /api/companies | Create company |
| PUT | /api/companies/:id | Update company |
| DELETE | /api/companies/:id | Delete company |

### Contacts (Protected)
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | /api/contacts | Get all contacts with company name |
| GET | /api/contacts/:id | Get single contact |
| POST | /api/contacts | Create contact |
| PUT | /api/contacts/:id | Update contact |
| DELETE | /api/contacts/:id | Delete contact |

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

Then create the tables:
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

## What I Learned

- Building REST APIs with Express and PostgreSQL
- JWT authentication flow (registration, login, protected routes)
- React state management with hooks (useState, useEffect)
- Axios interceptors for automatic token handling
- Responsive design with Tailwind CSS
- Database design with relational tables and foreign keys
- Full-stack architecture with separate client/server structure

## Author

**Davide** — Career changer from contact center operations to web development, bringing real-world business process knowledge into software development.
