# 🤖 AGENTS.md — AI Development Guidelines

## 🎯 Purpose

This file defines how AI agents should behave when working on this project.

Project Stack:

* Next.js
* Express.js
* MongoDB

---

## 🧠 Coding Standards

AI agents must:

* Write clean code
* Follow folder structure
* Avoid duplicate code
* Use reusable components
* Use proper naming conventions

---

## 📁 Project Structure

Frontend:

/app
/components
/services
/hooks
/utils

Backend:

/controllers
/routes
/models
/middleware
/config

---

## 🔐 Authentication Rules

Implement:

* JWT authentication
* Password hashing
* Protected routes
* Role-based access

---

## 👥 Role Rules

Admin:

* Manage users
* CRUD operations
* Access dashboard

User:

* Manage own profile
* View dashboard (limited)

---

## 🧱 API Standards

Use REST API:

POST /api/auth/login
POST /api/auth/register
GET /api/users
POST /api/users
PUT /api/users/:id
DELETE /api/users/:id

---

## 🛡️ Security Rules

* Validate inputs
* Hash passwords
* Use middleware
* Protect routes

---

## ⚡ Performance Rules

* Use lazy loading
* Use optimized queries
* Avoid unnecessary renders

---

## 🎨 UI Rules

* Responsive design
* Clean dashboard
* Sidebar navigation
* Loading states
* Error handling

---

## 🌍 Environment Variables

Use .env file

MONGO_URI=
JWT_SECRET=
NEXT_PUBLIC_API_URL=
PORT=5000

---

## 🚀 Final Requirements

AI agents must deliver:

* Authentication system
* Admin dashboard
* User management
* CRUD operations
* Clean architecture
