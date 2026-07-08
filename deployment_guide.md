# Sunrise Fitness Hub - Production Deployment Guide

This guide describes how to deploy the Sunrise Fitness Hub application live to production using:
1. **MongoDB Atlas** (Database Cloud Host)
2. **Render** (Backend API Host)
3. **Vercel** (Frontend client Host)

---

## Step 1: Set Up MongoDB Atlas Database
Since local databases cannot be accessed by Render servers, you must set up a free cloud database:

1. **Sign Up / Log In**: Go to [mongodb.com/atlas](https://www.mongodb.com/cloud/atlas) and create a free account.
2. **Create a Database Cluster**:
   - Click **Create** to deploy a new cluster.
   - Select the **M0 (Free)** shared tier.
   - Choose a cloud provider (e.g., AWS) and region closest to you, then click **Create**.
3. **Database Access Security**:
   - Go to **Database Access** under the Security tab in the sidebar.
   - Click **Add New Database User**.
   - Choose **Password** authentication, enter a username and password (save these), select **Read and write to any database**, and click **Add User**.
4. **Network Access Security**:
   - Go to **Network Access** under Security.
   - Click **Add IP Address**.
   - Click **Allow Access From Anywhere** (adds `0.0.0.0/0`). This is required because Render server IP addresses rotate dynamically. Click **Confirm**.
5. **Get Connection String**:
   - Go to **Database** in the sidebar.
   - Click **Connect** on your cluster.
   - Select **Drivers** (Node.js).
   - Copy the Connection String (looks like `mongodb+srv://<username>:<password>@cluster0.xxxx.mongodb.net/?retryWrites=true&w=majority`).
   - Replace `<username>` and `<password>` with the database credentials you created in Step 3. Keep this string ready for Step 2.

---

## Step 2: Deploy Backend API to Render

1. **Sign Up / Log In**: Go to [dashboard.render.com](https://dashboard.render.com) and log in using your GitHub account.
2. **Create Web Service**:
   - Click the blue **New +** button in the top right and select **Web Service**.
   - Under "Connect a repository", find and select your `Sunrise-Fitness` repository.
3. **Configure Service Parameters**:
   - **Name**: `sunrise-fitness-backend`
   - **Region**: Select a region close to your database cluster.
   - **Branch**: `main`
   - **Root Directory**: Enter `backend` (This directs Render to build inside the backend subfolder).
   - **Runtime**: `Node`
   - **Build Command**: `npm install`
   - **Start Command**: `node server.js`
   - **Plan**: `Free`
4. **Configure Environment Variables**:
   Click **Advanced** and add the following Environment Variables:
   - `NODE_ENV`: `production`
   - `MONGO_URI`: *(Your MongoDB Atlas Connection String from Step 1)*
   - `JWT_ACCESS_SECRET`: *(Enter a long random string of numbers and letters)*
   - `JWT_REFRESH_SECRET`: *(Enter another long random string of numbers and letters)*
   - `JWT_ACCESS_EXPIRE`: `15m`
   - `JWT_REFRESH_EXPIRE`: `7d`
   - `FRONTEND_URL`: `https://YOUR-VERCEL-SUBDOMAIN.vercel.app` *(You will update this in Step 4 once Vercel is set up)*
5. **Deploy**: Click **Create Web Service**. Render will install dependencies and start the API. Note the URL generated at the top left (e.g. `https://sunrise-fitness-backend.onrender.com`).

---

## Step 3: Deploy Frontend to Vercel

1. **Sign Up / Log In**: Go to [vercel.com](https://vercel.com) and sign in using your GitHub account.
2. **Import Repository**:
   - Click **Add New...** -> **Project**.
   - Import your `Sunrise-Fitness` repository.
3. **Configure Build Settings**:
   - **Project Name**: `sunrise-fitness`
   - **Framework Preset**: Select `Vite` (should be auto-detected).
   - **Root Directory**: Click edit and select `frontend` (This directs Vercel to build inside the frontend subfolder).
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
   - **Install Command**: `npm install`
4. **Configure Environment Variables**:
   Under **Environment Variables**, add:
   - `VITE_API_URL`: `https://YOUR-RENDER-URL.onrender.com/api` *(Replace with your Render web service URL from Step 2, keeping the `/api` suffix)*
5. **Deploy**: Click **Deploy**. Vercel will compile the React bundle and make it live. Note your frontend Vercel URL (e.g., `https://sunrise-fitness.vercel.app`).

---

## Step 4: Finalize CORS Configuration

To allow secure HTTP-Only cookie credentials to transfer between Vercel and Render:

1. Open your **Render dashboard** for `sunrise-fitness-backend`.
2. Go to **Environment** in the sidebar settings.
3. Update the `FRONTEND_URL` variable: replace the placeholder with your actual Vercel deployment URL (e.g., `https://sunrise-fitness.vercel.app`).
4. Click **Save Changes**. Render will automatically redeploy the backend server with the updated CORS origin allowed.

Your system is now live and fully operational in production!
