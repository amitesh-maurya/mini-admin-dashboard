# 🤖 AI Agent Rules — Mini Admin Dashboard

## 🎯 Project Overview

Build a Mini Admin Dashboard using:

* Next.js (Frontend)
* Express.js (Backend)
* MongoDB (Database)

The system must include authentication, role-based access control, and full CRUD operations for user management.

---

## 🧠 General Development Rules

* Write clean, modular, scalable code
* Follow MVC architecture
* Avoid large monolithic files
* Use reusable components
* Use environment variables
* Use async/await

---

## ⚙️ Tech Stack Rules

### Frontend (Next.js)

* Use Next.js App Router
* Use Functional Components
* Use Tailwind CSS
* Use reusable components
* Use Fetch or Axios for API calls

---

### Backend (Express.js)

* Use Express Router
* Follow MVC structure
* Use middleware for authentication
* Use proper HTTP status codes
* Handle errors properly

---

### Database (MongoDB)

* Use Mongoose
* Use schema validation
* Add timestamps to models
* Create separate model files

---

## 🔐 Authentication Rules

Must Implement:

* Login
* Register
* Logout
* JWT Authentication
* Protected Routes

Use:

* bcrypt for password hashing
* JWT for authentication

---

## 👥 Role-Based Access

Roles:

* Admin
* User

### Admin Permissions

* Create users
* View users
* Update users
* Delete users
* Assign roles
* View dashboard

### User Permissions

* View profile
* Edit profile
* Change password

---

## 📁 Folder Structure

### Frontend

/app
/components
/services
/hooks
/utils

### Backend

/controllers
/routes
/models
/middleware
/config

---

## 🔒 Security Rules

* Hash passwords
* Validate inputs
* Protect admin routes
* Use middleware
* Use environment variables

---

## 🧱 API Routes

POST /api/auth/login
POST /api/auth/register
GET /api/users
POST /api/users
PUT /api/users/:id
DELETE /api/users/:id

---

## 🌍 Environment Variables

MONGO_URI=
JWT_SECRET=
NEXT_PUBLIC_API_URL=
PORT=5000

---

## 🚀 Project Requirements

* Authentication system
* Admin dashboard
* User management
* CRUD operations
* Responsive UI
* Clean architecture

---

## ⭐ Bonus Features

* Pagination
* Search users
* Activity logs
* Dark mode
* Email verification

---

## 🏁 Final Goal

Build a production-ready Mini Admin Dashboard showcasing:

* Full Stack Development
* Authentication
* API Development
* Database Design
* Clean Architecture
