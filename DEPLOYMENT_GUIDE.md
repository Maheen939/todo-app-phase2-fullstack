# Production Deployment Guide

## 🚀 Complete Deployment Guide for Phase 2 Full-Stack App

This guide will walk you through deploying your application to production using:
- **Database**: Neon Serverless PostgreSQL
- **Backend**: Railway (or Render)
- **Frontend**: Vercel

**Estimated Time**: 60-90 minutes

---

## Prerequisites

### Required Accounts (All Free Tier Available)
- [ ] Neon account - https://neon.tech (Database)
- [ ] Railway account - https://railway.app (Backend) OR Render - https://render.com
- [ ] Vercel account - https://vercel.com (Frontend)
- [ ] GitHub account - For repository hosting

### Required Tools
- [ ] Git
- [ ] Railway CLI (optional): `npm install -g @railway/cli`
- [ ] Vercel CLI (optional): `npm install -g vercel`

---

## Step 1: Set Up Neon PostgreSQL Database (10 minutes)

### 1.1 Create Neon Account
1. Visit https://neon.tech
2. Sign up with GitHub (recommended)
3. Complete onboarding

### 1.2 Create Database Project
1. Click "Create Project"
2. Project name: `todo-app-phase2`
3. Region: Choose closest to you (e.g., US East)
4. PostgreSQL version: 16 (latest)
5. Click "Create Project"

### 1.3 Get Connection String
1. After project creation, go to "Connection Details"
2. Copy the connection string (should look like):
   ```
   postgresql://user:password@ep-xxx-xxx.us-east-2.aws.neon.tech/neondb?sslmode=require
   ```
3. Save this - you'll need it for both backend and frontend

### 1.4 (Optional) Create Database Tables
You can create tables now or let the backend create them on first startup:

```bash
# Using psql
psql "postgresql://user:password@host.neon.tech/neondb?sslmode=require"

# Tables will be auto-created by backend on startup
```

---

## Step 2: Deploy Backend to Railway (20 minutes)

### 2.1 Create Railway Account
1. Visit https://railway.app
2. Sign up with GitHub
3. Verify email

### 2.2 Create New Project
1. Click "New Project"
2. Select "Deploy from GitHub repo"
3. Connect your GitHub account (if not already)
4. Select your repository (or create one first - see Step 0 below)

### 2.3 Configure Service
1. Select the `backend` directory
2. Railway will detect Python app automatically

### 2.4 Set Environment Variables
In Railway dashboard, go to Variables tab and add:

```bash
DATABASE_URL=postgresql://user:password@host.neon.tech/neondb?sslmode=require
JWT_SECRET=<generate-strong-secret-32-chars-minimum>
JWT_ALGORITHM=HS256
TEST_MODE=false
```

**Generate JWT_SECRET:**
```bash
# Option 1: OpenSSL
openssl rand -base64 32

# Option 2: Python
python -c "import secrets; print(secrets.token_urlsafe(32))"

# Option 3: Node.js
node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"
```

### 2.5 Deploy
1. Railway will automatically deploy
2. Wait for build to complete (~2-3 minutes)
3. Railway will provide a URL: `https://your-app.railway.app`
4. Save this URL - you'll need it for frontend

### 2.6 Verify Deployment
```bash
# Test health check
curl https://your-app.railway.app/health

# Should return:
# {"status":"healthy","timestamp":"...","version":"2.0"}
```

---

## Step 2 (Alternative): Deploy Backend to Render

### Option B: Render Deployment

1. **Create Render Account**
   - Visit https://render.com
   - Sign up with GitHub

2. **Create New Web Service**
   - Click "New" → "Web Service"
   - Connect GitHub repository
   - Select `backend` directory

3. **Configure Service**
   - Name: `todo-api`
   - Region: Oregon (US West) or closest
   - Branch: `main`
   - Root Directory: `backend`
   - Runtime: Python 3
   - Build Command: `pip install uv && uv sync`
   - Start Command: `uv run uvicorn main:app --host 0.0.0.0 --port $PORT`

4. **Add Environment Variables**
   ```bash
   DATABASE_URL=<neon-connection-string>
   JWT_SECRET=<generated-secret>
   JWT_ALGORITHM=HS256
   TEST_MODE=false
   ```

5. **Deploy**
   - Click "Create Web Service"
   - Wait for deployment (~3-5 minutes)
   - Get URL: `https://todo-api-xxx.onrender.com`

---

## Step 3: Deploy Frontend to Vercel (15 minutes)

### 3.1 Create Vercel Account
1. Visit https://vercel.com
2. Sign up with GitHub
3. Complete onboarding

### 3.2 Import Project
1. Click "Add New..." → "Project"
2. Import Git Repository
3. Select your repository
4. Vercel auto-detects Next.js

### 3.3 Configure Project
1. **Framework Preset**: Next.js (auto-detected)
2. **Root Directory**: `frontend`
3. **Build Command**: `npm run build` (default)
4. **Output Directory**: `.next` (default)
5. **Install Command**: `npm install` (default)

### 3.4 Set Environment Variables
Click "Environment Variables" and add:

```bash
NEXT_PUBLIC_API_URL=https://your-app.railway.app
BETTER_AUTH_URL=https://your-app.vercel.app
BETTER_AUTH_SECRET=<same-as-backend-jwt-secret>
DATABASE_URL=<neon-connection-string>
```

**IMPORTANT**: Use the SAME JWT_SECRET as the backend!

### 3.5 Deploy
1. Click "Deploy"
2. Wait for build (~2-3 minutes)
3. Vercel provides URL: `https://your-app.vercel.app`

### 3.6 Configure Custom Domain (Optional)
1. Go to Settings → Domains
2. Add your custom domain
3. Follow DNS configuration instructions

---

## Step 4: Update Backend CORS for Production (5 minutes)

After frontend is deployed, update backend CORS settings:

### 4.1 Update main.py

Add your production frontend URL to CORS origins:

```python
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",  # Local development
        "https://your-app.vercel.app",  # Production frontend
        # Add custom domain if you have one
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
```

### 4.2 Redeploy Backend
- Commit and push changes
- Railway/Render will auto-deploy

---

## Step 5: Database Migrations (10 minutes)

### 5.1 Create Users Table (for production)

Since we're not using Better Auth yet, create a minimal users table:

```sql
-- Connect to your Neon database
psql "postgresql://user:password@host.neon.tech/neondb?sslmode=require"

-- Create users table
CREATE TABLE users (
    id VARCHAR(255) PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    name VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tasks table will be auto-created by backend on startup
```

Or let backend create both tables automatically (recommended).

---

## Step 0: Prepare GitHub Repository (15 minutes)

### 0.1 Initialize Git (if not already)
```bash
cd todo-app-phase2-fullstack
git init
git add .
git commit -m "Initial commit: Phase 2 Full-Stack Todo App

- Complete FastAPI backend with JWT authentication
- Complete Next.js 16 frontend with Tailwind CSS
- Multi-user support with data isolation
- PostgreSQL database integration
- Comprehensive documentation

Built with Claude Code using Spec-Driven Development"
```

### 0.2 Create GitHub Repository
1. Go to https://github.com/new
2. Repository name: `todo-app-phase2-fullstack`
3. Description: "Full-stack todo app with Next.js 16 and FastAPI"
4. Visibility: Public or Private
5. Click "Create repository"

### 0.3 Push to GitHub
```bash
git remote add origin https://github.com/YOUR_USERNAME/todo-app-phase2-fullstack.git
git branch -M main
git push -u origin main
```

---

## 🎯 Quick Deployment Commands

### Railway (Backend)
```bash
# Install Railway CLI
npm install -g @railway/cli

# Login
railway login

# Initialize
cd backend
railway init

# Add environment variables
railway variables set DATABASE_URL="<neon-url>"
railway variables set JWT_SECRET="<generated-secret>"
railway variables set JWT_ALGORITHM="HS256"
railway variables set TEST_MODE="false"

# Deploy
railway up
```

### Vercel (Frontend)
```bash
# Install Vercel CLI
npm install -g vercel

# Login
vercel login

# Deploy
cd frontend
vercel

# Follow prompts:
# - Link to existing project? No
# - Project name: todo-frontend
# - Directory: ./
# - Override settings? No

# Add environment variables
vercel env add NEXT_PUBLIC_API_URL
vercel env add BETTER_AUTH_SECRET
vercel env add DATABASE_URL
vercel env add BETTER_AUTH_URL

# Production deployment
vercel --prod
```

---

## 🔐 Environment Variables Reference

### Backend Environment Variables

| Variable | Example | Required | Source |
|----------|---------|----------|--------|
| DATABASE_URL | `postgresql://...neon.tech/db?sslmode=require` | Yes | Neon dashboard |
| JWT_SECRET | `abc123xyz...` (32+ chars) | Yes | Generate new |
| JWT_ALGORITHM | `HS256` | Yes | Fixed value |
| TEST_MODE | `false` | Yes | Production = false |

### Frontend Environment Variables

| Variable | Example | Required | Source |
|----------|---------|----------|--------|
| NEXT_PUBLIC_API_URL | `https://your-api.railway.app` | Yes | Railway/Render URL |
| BETTER_AUTH_URL | `https://your-app.vercel.app` | Yes | Vercel URL |
| BETTER_AUTH_SECRET | Same as JWT_SECRET | Yes | Same as backend |
| DATABASE_URL | `postgresql://...neon.tech/db` | Yes | Neon (same as backend) |

---

## ✅ Deployment Checklist

### Pre-Deployment
- [ ] Code pushed to GitHub
- [ ] All tests passing locally
- [ ] Environment variables documented
- [ ] Neon database created

### Backend Deployment
- [ ] Railway/Render project created
- [ ] Repository connected
- [ ] Environment variables set
- [ ] Build successful
- [ ] Health check passing
- [ ] API docs accessible

### Frontend Deployment
- [ ] Vercel project created
- [ ] Repository connected
- [ ] Environment variables set
- [ ] Build successful
- [ ] Site accessible
- [ ] API calls working

### Post-Deployment
- [ ] Test signup flow
- [ ] Test signin flow
- [ ] Test task creation
- [ ] Test all CRUD operations
- [ ] Verify multi-user isolation
- [ ] Check CORS working
- [ ] Verify HTTPS enabled
- [ ] Test on mobile devices

---

## 🐛 Troubleshooting

### Backend Won't Deploy

**Issue**: Build fails
- Check `pyproject.toml` dependencies
- Verify Python version (3.13+)
- Check Railway/Render logs

**Issue**: Database connection fails
- Verify DATABASE_URL is correct
- Check `?sslmode=require` is appended for Neon
- Test connection locally with psql

**Issue**: App starts but crashes
- Check environment variables are set
- Review application logs
- Verify JWT_SECRET is set

### Frontend Won't Deploy

**Issue**: Build fails
- Check `package.json` dependencies
- Verify Node version (20+)
- Review build logs

**Issue**: Can't connect to backend
- Verify NEXT_PUBLIC_API_URL is correct
- Check backend is running
- Verify CORS is configured

**Issue**: Authentication not working
- Ensure BETTER_AUTH_SECRET matches backend JWT_SECRET
- Check DATABASE_URL is set
- Verify both services use same Neon database

### CORS Errors

**Issue**: "Access-Control-Allow-Origin" error

**Solution**: Update `backend/main.py`:
```python
allow_origins=[
    "http://localhost:3000",
    "https://your-actual-frontend-url.vercel.app",
]
```

---

## 🔄 Continuous Deployment

Both Railway and Vercel support automatic deployments:

### Auto-Deploy on Push
1. **Configured by default**
2. Push to `main` branch
3. Services auto-detect changes
4. Automatic build and deploy
5. Zero-downtime deployment

### Deployment Workflow
```bash
# Make changes locally
git add .
git commit -m "Add new feature"
git push origin main

# Railway and Vercel automatically:
# 1. Detect push
# 2. Run builds
# 3. Deploy new version
# 4. Update live URLs
```

---

## 📊 Cost Estimate

### Free Tier Limits

**Neon (Database)**
- Free tier: 0.5 GB storage
- 1 project
- Unlimited compute hours
- **Cost**: $0/month

**Railway (Backend)**
- Free tier: $5 credit/month
- ~500 hours runtime
- Enough for hobby projects
- **Cost**: $0-5/month

**Vercel (Frontend)**
- Free tier: Unlimited deployments
- 100 GB bandwidth
- Serverless functions included
- **Cost**: $0/month

**Total Monthly Cost**: $0-5 (free tier)

### Paid Tier (If Needed)
- Neon Pro: $19/month (more storage/compute)
- Railway: $5-20/month (based on usage)
- Vercel Pro: $20/month (team features)

---

## 🎯 Production Deployment Steps (Copy-Paste Ready)

### Complete Deployment Script

```bash
# ============================================
# PHASE 1: DATABASE SETUP
# ============================================

# 1. Create Neon database at https://neon.tech
# 2. Copy connection string
NEON_DB_URL="postgresql://user:pass@host.neon.tech/db?sslmode=require"

# ============================================
# PHASE 2: BACKEND DEPLOYMENT (RAILWAY)
# ============================================

# 1. Install Railway CLI
npm install -g @railway/cli

# 2. Login to Railway
railway login

# 3. Navigate to backend
cd backend

# 4. Initialize Railway project
railway init

# 5. Set environment variables
railway variables set DATABASE_URL="$NEON_DB_URL"
railway variables set JWT_SECRET="$(openssl rand -base64 32)"
railway variables set JWT_ALGORITHM="HS256"
railway variables set TEST_MODE="false"

# 6. Deploy backend
railway up

# 7. Get backend URL
BACKEND_URL=$(railway status --json | jq -r '.url')
echo "Backend URL: $BACKEND_URL"

# ============================================
# PHASE 3: FRONTEND DEPLOYMENT (VERCEL)
# ============================================

# 1. Install Vercel CLI
npm install -g vercel

# 2. Login to Vercel
vercel login

# 3. Navigate to frontend
cd ../frontend

# 4. Deploy to Vercel
vercel

# During prompts:
# - Set up and deploy? Yes
# - Scope: Your account
# - Link to existing project? No
# - Project name: todo-frontend
# - Directory: ./
# - Override settings? No

# 5. Add environment variables
vercel env add NEXT_PUBLIC_API_URL production
# Enter: https://your-backend.railway.app

vercel env add BETTER_AUTH_SECRET production
# Enter: <same-as-backend-jwt-secret>

vercel env add DATABASE_URL production
# Enter: <neon-connection-string>

vercel env add BETTER_AUTH_URL production
# Enter: https://your-frontend.vercel.app

# 6. Deploy to production
vercel --prod

# 7. Get frontend URL
FRONTEND_URL=$(vercel inspect --wait | grep "URL:" | awk '{print $2}')
echo "Frontend URL: $FRONTEND_URL"

# ============================================
# PHASE 4: UPDATE BACKEND CORS
# ============================================

# Update backend/main.py with production frontend URL
# Then redeploy:
cd ../backend
railway up

# ============================================
# DONE! 🎉
# ============================================

echo "Backend: $BACKEND_URL"
echo "Frontend: $FRONTEND_URL"
echo "Database: Neon PostgreSQL"
```

---

## 🔧 Manual Deployment (Web UI)

### Railway Web UI Deployment

1. **Login to Railway**
   - Visit https://railway.app
   - Click "Login"

2. **New Project**
   - Click "New Project"
   - Select "Deploy from GitHub repo"
   - Choose your repository

3. **Add Service**
   - Click "Add Service"
   - Select backend directory

4. **Configure**
   - Settings → Environment Variables
   - Add all variables from table above
   - Settings → Networking → Generate Domain

5. **Deploy**
   - Automatic on code push
   - Or click "Deploy" manually

### Vercel Web UI Deployment

1. **Login to Vercel**
   - Visit https://vercel.com
   - Click "Login"

2. **Import Project**
   - Click "Add New..." → "Project"
   - Import Git Repository
   - Select your repo

3. **Configure Build**
   - Root Directory: `frontend`
   - Framework Preset: Next.js
   - Node Version: 20.x

4. **Environment Variables**
   - Add all 4 variables from table above
   - Apply to: Production

5. **Deploy**
   - Click "Deploy"
   - Wait for build completion
   - Get production URL

---

## 🧪 Post-Deployment Testing

### Test Backend API

```bash
# 1. Health check
curl https://your-api.railway.app/health

# 2. Check API docs
open https://your-api.railway.app/docs

# 3. Test CORS
curl -H "Origin: https://your-app.vercel.app" \
     https://your-api.railway.app/health
```

### Test Frontend

```bash
# 1. Open in browser
open https://your-app.vercel.app

# 2. Sign up
# - Enter email, password, name
# - Should redirect to dashboard

# 3. Create task
# - Click "+ Add Task"
# - Fill form
# - Should save to Neon database

# 4. Check browser console
# - Open DevTools (F12)
# - Network tab
# - See API calls to Railway backend

# 5. Verify persistence
# - Sign out
# - Sign in again
# - Tasks should still be there
```

---

## 📱 Production URLs

After deployment, you'll have:

```
Production URLs:
┌──────────────────────────────────────────────┐
│ Frontend: https://your-app.vercel.app        │
│ Backend:  https://your-api.railway.app       │
│ Database: ep-xxx.neon.tech (connection pool) │
│ API Docs: https://your-api.railway.app/docs  │
└──────────────────────────────────────────────┘
```

---

## 🔒 Production Security Checklist

Before making your app public:

- [ ] TEST_MODE=false (disable test mode)
- [ ] Strong JWT_SECRET (32+ characters)
- [ ] HTTPS enabled (automatic with Railway/Vercel)
- [ ] CORS limited to your domain only
- [ ] Database uses SSL (Neon has this by default)
- [ ] Environment variables not in code
- [ ] Secrets not in git history
- [ ] Rate limiting enabled (add in future)
- [ ] Error messages don't leak sensitive info
- [ ] Database backups enabled (Neon automatic)

---

## 📊 Deployment Monitoring

### Railway Monitoring
- Logs: Railway dashboard → Logs tab
- Metrics: CPU, Memory, Network usage
- Health: Automatic health checks

### Vercel Monitoring
- Analytics: Vercel dashboard → Analytics
- Logs: Functions tab → Logs
- Performance: Web Vitals tracking

### Neon Monitoring
- Query insights: Neon dashboard → Monitoring
- Connection pooling stats
- Storage usage

---

## 🔄 Rollback Plan

### If Deployment Fails

**Railway:**
```bash
# View deployments
railway status

# Rollback to previous
railway rollback
```

**Vercel:**
```bash
# List deployments
vercel ls

# Rollback to previous
vercel rollback
```

### Emergency Rollback
1. Go to Railway/Vercel dashboard
2. Deployments → Previous deployment
3. Click "Redeploy"

---

## 📈 Scaling Considerations

### When to Scale

**Backend (Railway)**
- Upgrade when: CPU > 80%, Memory > 80%
- Scale to: Hobby plan ($5/month) or Pro ($20/month)

**Frontend (Vercel)**
- Free tier handles: 100 GB bandwidth
- Upgrade when: Traffic exceeds limits
- Scale to: Pro ($20/month)

**Database (Neon)**
- Free tier: 0.5 GB storage
- Upgrade when: Storage > 80% or need more compute
- Scale to: Pro ($19/month)

---

## 🎉 Deployment Complete!

After following this guide, you'll have:

✅ Production database on Neon
✅ Backend API deployed to Railway/Render
✅ Frontend deployed to Vercel
✅ HTTPS enabled automatically
✅ Automatic deployments on git push
✅ Monitoring and logs available
✅ Zero-downtime deployments

**Your app is live and accessible worldwide!** 🌍

---

## 📞 Support Resources

- **Neon Docs**: https://neon.tech/docs
- **Railway Docs**: https://docs.railway.app
- **Vercel Docs**: https://vercel.com/docs
- **FastAPI Deployment**: https://fastapi.tiangolo.com/deployment
- **Next.js Deployment**: https://nextjs.org/docs/deployment

---

**Estimated Total Deployment Time**: 60-90 minutes
**Difficulty**: Intermediate
**Prerequisites**: GitHub account, credit card (for verification, free tiers available)
