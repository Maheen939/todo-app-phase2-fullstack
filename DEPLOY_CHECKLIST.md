# Production Deployment Checklist

## 📋 Pre-Deployment Checklist

### Code Preparation
- [x] All features implemented and tested
- [x] Backend tests passing (17/17 ✅)
- [x] Frontend builds successfully
- [x] No TypeScript errors
- [x] No linting errors
- [x] Zero npm vulnerabilities
- [x] Documentation complete

### Repository Setup
- [ ] Git repository initialized
- [ ] Code committed to git
- [ ] GitHub repository created
- [ ] Code pushed to GitHub
- [ ] Repository is public or accessible to deployment services

### Environment Variables Prepared
- [ ] JWT_SECRET generated (32+ characters)
- [ ] Neon database connection string ready
- [ ] Backend URL placeholder ready
- [ ] Frontend URL placeholder ready

---

## 🗄️ Step 1: Database Setup

### Neon PostgreSQL
- [ ] Account created at https://neon.tech
- [ ] Project created
- [ ] Database created
- [ ] Connection string copied
- [ ] Connection tested locally

**Connection String Format:**
```
postgresql://user:password@ep-xxx.us-east-2.aws.neon.tech/neondb?sslmode=require
```

---

## 🖥️ Step 2: Backend Deployment

### Choose Your Platform:

#### Option A: Railway ⭐ Recommended
- [ ] Account created at https://railway.app
- [ ] Repository connected
- [ ] Service created for `backend` directory
- [ ] Environment variables set:
  - [ ] DATABASE_URL
  - [ ] JWT_SECRET
  - [ ] JWT_ALGORITHM=HS256
  - [ ] TEST_MODE=false
- [ ] Deployment successful
- [ ] Health check passing: `https://your-api.railway.app/health`
- [ ] API docs accessible: `https://your-api.railway.app/docs`
- [ ] Backend URL saved: `_________________`

#### Option B: Render
- [ ] Account created at https://render.com
- [ ] New Web Service created
- [ ] Repository connected
- [ ] Build command set: `pip install uv && uv sync`
- [ ] Start command set: `uv run uvicorn main:app --host 0.0.0.0 --port $PORT`
- [ ] Environment variables set (same as Railway)
- [ ] Deployment successful
- [ ] Health check passing
- [ ] Backend URL saved: `_________________`

---

## 🌐 Step 3: Frontend Deployment

### Vercel Deployment ⭐ Recommended

- [ ] Account created at https://vercel.com
- [ ] Repository imported
- [ ] Root directory set to `frontend`
- [ ] Framework preset: Next.js (auto-detected)
- [ ] Environment variables set:
  - [ ] NEXT_PUBLIC_API_URL=`https://your-backend-url`
  - [ ] BETTER_AUTH_SECRET=`<same-as-jwt-secret>`
  - [ ] BETTER_AUTH_URL=`https://your-frontend-url`
  - [ ] DATABASE_URL=`<neon-connection-string>`
- [ ] Deployment successful
- [ ] Site accessible
- [ ] Frontend URL saved: `_________________`

---

## 🔄 Step 4: Post-Deployment Configuration

### Update Backend CORS

- [ ] Edit `backend/main.py`
- [ ] Add production frontend URL to `allow_origins`
- [ ] Commit changes
- [ ] Push to GitHub
- [ ] Verify auto-deployment

### Update Environment Variables (if URLs changed)

**Backend:**
- [ ] No changes needed (uses Railway/Render URL)

**Frontend:**
- [ ] Update NEXT_PUBLIC_API_URL if backend URL changed
- [ ] Update BETTER_AUTH_URL if frontend URL changed
- [ ] Redeploy if changes made

---

## ✅ Step 5: Production Testing

### Functional Tests

- [ ] **Health Check**: Visit `https://your-api.railway.app/health`
- [ ] **API Docs**: Visit `https://your-api.railway.app/docs`
- [ ] **Landing Page**: Visit `https://your-app.vercel.app`
- [ ] **Sign Up**: Create new account
- [ ] **Sign In**: Login with credentials
- [ ] **Dashboard**: Access dashboard
- [ ] **Create Task**: Add new task
- [ ] **Edit Task**: Update task
- [ ] **Delete Task**: Remove task
- [ ] **Toggle Complete**: Mark task done
- [ ] **Filter Tasks**: Test all/pending/completed
- [ ] **Sort Tasks**: Test sorting options
- [ ] **Sign Out**: Logout

### Security Tests

- [ ] HTTPS enabled on both services
- [ ] JWT authentication working
- [ ] Multi-user isolation verified
- [ ] CORS restricts to your domain only
- [ ] Environment variables not exposed
- [ ] API requires authentication

### Performance Tests

- [ ] Page load time < 3 seconds
- [ ] API response time < 200ms
- [ ] No console errors
- [ ] Mobile responsive
- [ ] Works on Chrome, Firefox, Safari

---

## 🎯 Verification Commands

### Test Backend
```bash
# Health check
curl https://your-api.railway.app/health

# Expected: {"status":"healthy","timestamp":"...","version":"2.0"}
```

### Test Frontend
```bash
# Check if site is up
curl -I https://your-app.vercel.app

# Expected: HTTP/2 200
```

### Test Full Integration
```bash
# Create a task via API (after getting JWT from browser)
curl -X POST https://your-api.railway.app/api/user-123/tasks \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{"title":"Production Test","description":"Testing deployment"}'

# Expected: 201 Created with task object
```

---

## 🎊 Deployment Complete!

### Success Criteria

When all items above are checked, your app is:

✅ **Live**: Accessible worldwide at production URLs
✅ **Secure**: HTTPS, JWT auth, data isolation
✅ **Scalable**: Auto-scaling on all platforms
✅ **Monitored**: Logs and metrics available
✅ **Backed Up**: Neon automatic backups
✅ **Updated**: Auto-deploys on git push

### Share Your App

Your production URLs:
```
Frontend: https://your-app.vercel.app
Backend:  https://your-api.railway.app
Docs:     https://your-api.railway.app/docs
```

### Maintenance

**Automatic:**
- ✅ Auto-deploy on git push
- ✅ Auto-scaling based on traffic
- ✅ Auto-backup (Neon daily backups)
- ✅ Auto-SSL certificate renewal

**Manual (Monthly):**
- Check error logs
- Review performance metrics
- Update dependencies
- Monitor costs (free tier limits)

---

## 📞 Need Help?

### Platform Support
- Railway: https://railway.app/help
- Vercel: https://vercel.com/support
- Neon: https://neon.tech/docs

### Common Issues
- CORS errors → Update backend allow_origins
- JWT errors → Verify secrets match
- Database errors → Check CONNECTION_URL format
- Build errors → Check logs in platform dashboard

---

**Time to Complete**: 60-90 minutes
**Difficulty**: Intermediate
**Cost**: $0-5/month (free tier)
**Result**: Production-ready app! 🚀
