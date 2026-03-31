# BitShare 🧬 - Neural File Distribution

![Neural Workspace Dashboard](./homepage.png)

## Overview
**BitShare** is a next-generation, high-performance file distribution platform built on a neural-inspired architecture. It leverages real-time synchronization across distributed nodes to provide a seamless, secure, and hyper-efficient workspace for your digital assets. Now upgraded with **Enterprise-Grade Production Readiness**.

## 🚀 Key Features

- **Neural Workspace**: A sophisticated, glassmorphic dashboard featuring real-time synchronization with BitShare nodes.
- **Cloud-Native Storage**: High-performance file distribution powered by **Cloudinary** (25GB free tier), replacing brittle local storage.
- **Neural Pulse Analytics**: Live "Sensing" technology to monitor file health, resonance signals, and distribution patterns.
- **Production-Ready Security**: 
    - **Anti-Brute Force**: Integrated `express-rate-limit` to prevent DDoS and automated attacks.
    - **Server-Side Validation**: Robust input sanitization using `express-validator`.
    - **Hardened Headers**: Enhanced security with optimized `helmet` configurations.
- **Enterprise Logging**: Structured JSON logging with **Winston** and **Morgan**, featuring persistent error tracking in MongoDB.
- **Secure Neural Auth**: Google OAuth 2.0 integration + Two-Factor Authentication (2FA) for top-tier security.
- **Real-Time Resonance**: Instant notifications and updates powered by **Pusher**.

## 🛠 Tech Stack

### Frontend
- **React + TypeScript** (Vite-powered)
- **Tailwind CSS** (for the premium dark-mode aesthetic)
- **Zustand** (Atomic State Management)
- **Framer Motion** (Staggered Neural Animations)
- **Pusher JS** (Real-time resonance)

### Backend
- **Node.js + Express** (Production Hardened)
- **Cloudinary SDK** (Multi-media & Raw file storage)
- **MongoDB** (Distributed database with Winston logging integration)
- **Pusher Server** (Event broadcasting)
- **Winston & Morgan** (Structured logging & HTTP monitoring)
- **Express-Validator** (Request sanitization)
- **Compression** (Gzip payload optimization)

## 📦 Installation

To deploy the BitShare neural mesh locally:

1. **Clone the repository:**
   ```bash
   git clone https://github.com/Swayam-Khanna/BitShare-Neural-File-Distribution.git
   cd BitShare-Neural-File-Distribution
   ```

2. **Frontend Setup:**
   ```bash
   cd frontend
   npm install
   npm run dev
   ```

3. **Backend Setup:**
   ```bash
   cd ../backend
   npm install
   npm run dev
   ```

## ⚙️ Environment Variables

Create `.env` files in both `frontend` and `backend` directories:

### Backend `.env`:
```
PORT=8000
MONGO_URI=your_mongodb_uri
JWT_SECRET=your_jwt_secret

# Cloudinary (Storage)
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret

# Pusher (Real-time)
PUSHER_APP_ID=your_id
PUSHER_KEY=your_key
PUSHER_SECRET=your_secret
PUSHER_CLUSTER=your_cluster

# Auth
GOOGLE_CLIENT_ID=your_google_id
GOOGLE_CLIENT_SECRET=your_google_secret
ALLOWED_ORIGINS=http://localhost:5173
```

### Frontend `.env`:
```
VITE_GOOGLE_CLIENT_ID=your_google_id
VITE_PUSHER_KEY=your_key
VITE_PUSHER_CLUSTER=your_cluster
```

## 📄 License
This project is licensed under the MIT License.

---
*Created with ❤️ by **Swayam Khanna***
