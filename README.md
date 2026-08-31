# 📚 Library Management System (LMS)

A robust, full-stack web application designed to streamline library cataloging, member management, and borrowing transactions. Built using the **PERN stack** (PostgreSQL, Express.js, React.js, Node.js) with end-to-end security and clean architectural patterns.

---

## 🚀 Tech Stack

### **Frontend**
- **React.js** (Component-driven UI, state management, and client routing)
- **Axios / Fetch API** (HTTP requests & backend integration)
- **CSS3 / Tailwind CSS** (Responsive layout and modern design)

### **Backend**
- **Node.js & Express.js** (Modular RESTful API architecture)
- **JSON Web Tokens (JWT)** (Stateless authorization & route guarding)
- **Bcrypt.js** (Salted password hashing & secure credential handling)
- **CORS & Dotenv** (Cross-origin resource sharing & environment management)

### **Database**
- **PostgreSQL** (Relational schema design, constraints, and optimized SQL queries)

---

## ✨ Key Features

- 🔐 **Authentication & Security:** Secure signup and login flows utilizing Bcrypt password hashing and JWT-based session tokens with protected API routes.
- 📖 **Catalog Management:** Full CRUD capabilities for adding, updating, searching, and removing books.
- 🔄 **Issue & Return Tracking:** Manage member borrowings, due dates, availability statuses, and transaction logs.
- 👥 **User Management:** Role-based access control separating administrative tasks from standard member actions.
- 🗄️ **Relational Integrity:** Normalized relational database structure enforcing foreign key constraints and transactional consistency.

---

## 📁 Project Structure

```text
LMS/
├── client/                 # Frontend React Application
│   ├── public/
│   ├── src/
│   │   ├── components/     # Reusable UI components
│   │   ├── pages/          # Application views (Dashboard, Login, Books, etc.)
│   │   ├── services/       # API call handlers & Axios configuration
│   │   └── App.js
│   └── package.json
│
├── server/                 # Backend Node/Express Application
│   ├── config/             # Database connection & environment setup
│   ├── controllers/        # Request handlers & business logic
│   ├── middleware/         # Auth verification & error handling
│   ├── routes/             # RESTful API endpoint definitions
│   ├── models/             # Database schema / query helpers
│   ├── server.js           # Server entry point
│   └── package.json
│
└── README.md
