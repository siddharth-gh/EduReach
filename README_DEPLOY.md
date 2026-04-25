# Deployment Guide - EduReach

This project is prepared for deployment with a **Render** (Backend) and **Vercel** (Frontend) setup.

## 1. Backend (Render)
Render is ideal for the Node.js/Express server.

### Environment Variables
Set these in the Render dashboard:
- `MONGO_URI`: Your MongoDB Atlas connection string.
- `JWT_SECRET`: A long random string for security.
- `CLIENT_URL`: The URL of your Vercel deployment (e.g., `https://your-app.vercel.app`).
- `PORT`: 5000 (Render sets this automatically, but good to have a fallback).

### Build & Start
- **Build Command**: `npm install`
- **Start Command**: `npm start`

### Persistent Storage (Optional but Recommended)
Render's local disk is ephemeral (files are deleted on redeploy). 
- For a temporary demo, this is fine.
- For production, attach a **Render Disk** at `/uploads` or switch to a cloud provider like Cloudinary/AWS S3 (which the code also supports).

### FFmpeg Note
The project now includes **graceful FFmpeg degradation**. If Render's environment doesn't have FFmpeg installed, the server will skip video optimization and use the original uploaded files automatically. No crashes will occur.

---

## 2. Frontend (Vercel)
Vercel is optimized for Vite/React applications.

### Environment Variables
Set these in the Vercel dashboard:
- `VITE_API_URL`: Your Render backend URL (e.g., `https://your-backend.onrender.com/api`).

### Build Settings
- **Framework Preset**: Vite
- **Build Command**: `npm run build`
- **Output Directory**: `dist`

### SPA Routing
The included `vercel.json` ensures that page refreshes and deep links work correctly by redirecting all traffic to `index.html`.

---

## 3. Deployment Checklist
1. [ ] Push your code to a GitHub repository.
2. [ ] Connect the repository to Render (Web Service).
3. [ ] Connect the same repository to Vercel.
4. [ ] Configure the environment variables on both platforms.
5. [ ] **Critical**: Ensure `CLIENT_URL` in Render matches your Vercel URL to allow CORS (cross-origin) requests.
