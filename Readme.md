# AetherPlay

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Node.js](https://img.shields.io/badge/Node.js-v18-green)](https://nodejs.org/)
[![MongoDB](https://img.shields.io/badge/MongoDB-4.4+-47A248.svg)](https://mongodb.com/)

AetherPlay is a **production-ready backend** for a full-featured social media video platform, built with the **MERN stack** (MongoDB, Express, React, Node.js). Designed with industry-standard architecture, it powers seamless user experiences from secure authentication to advanced video analytics.

## ✨ Features

- **🔐 Secure Authentication & Authorization**
  - JWT-based authentication
  - bcrypt password hashing
  - Role-based access control (RBAC)
  - Refresh tokens & password reset

- **👥 User Management**
  - Complete user CRUD operations
  - Profile management
  - Session handling
  - Watch history tracking

- **🎥 Video Platform Core**
  - Video upload with multer/gridfs
  - Streaming support
  - Video statistics (views, likes, watch time)
  - Comments system with nested replies

- **📊 Advanced Analytics**
  - MongoDB aggregation pipelines
  - Real-time video statistics
  - User engagement metrics

- **🏗️ Industry-Standard Architecture**
  <hr>
        
        ├── config/ # Database & env config

        ├── controllers/ # Business logic

        ├── middleware/ # Auth, validation middleware

        ├── models/ # Mongoose schemas

        ├── routes/ # API routes

        ├── utils/ # Helper functions

        └── .env.example # Environment variables

<hr>


## 🛠 Tech Stack

| Category | Technology |
|----------|------------|
| **Backend** | Node.js, Express.js |
| **Database** | MongoDB, Mongoose |
| **Auth** | JWT, bcrypt |
| **Upload** | Multer, GridFS |
| **Dev Tools** | Nodemon, ESLint, Prettier |

## 🚀 Quick Start

### Prerequisites
- Node.js v18+
- MongoDB (local or Atlas)
- npm/yarn

### Installation
```bash
# Clone the repository
git clone https://github.com/SALBEEN/AetherPlay.git
cd aetherplay

# Install dependencies
npm install
npm init -y

# Start development server
npm run dev

