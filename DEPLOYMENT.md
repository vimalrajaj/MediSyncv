# 🚀 MediSync Vercel Deployment Guide

## Prerequisites

1. **Vercel Account**: Sign up at [vercel.com](https://vercel.com)
2. **GitHub Repository**: Your code should be in a GitHub repository
3. **Environment Variables**: Have your Supabase credentials ready

## 📋 Step-by-Step Deployment

### 1. Push Your Code to GitHub

If you haven't already, initialize and push your repository:

```bash
git init
git add .
git commit -m "Initial MediSync deployment"
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/MediSyncv.git
git push -u origin main
```

### 2. Deploy to Vercel

**Option A: Via Vercel Dashboard**
1. Go to [vercel.com/dashboard](https://vercel.com/dashboard)
2. Click "New Project"
3. Import your GitHub repository
4. Vercel will auto-detect it's a Vite project
5. Configure environment variables (see below)
6. Click "Deploy"

**Option B: Via Vercel CLI**
```bash
npm i -g vercel
vercel login
vercel --prod
```

### 3. Environment Variables Setup

In your Vercel project dashboard, go to **Settings → Environment Variables** and add:

#### 🔐 Required Variables
```env
VITE_SUPABASE_URL=https://krgjbzjpqupgzjmpricw.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImtyZ2piempwcXVwZ3pqbXByaWN3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTg5NTU0NDEsImV4cCI6MjA3NDUzMTQ0MX0.hB4DlAIynpXWPQEFAE5HmHtr9iF7D6ghKQEPsynNfvs
NODE_ENV=production
```

#### 🔧 Optional Variables (for full functionality)
```env
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
ABHA_TOKEN_VALIDATION_URL=https://abhaaddress.abdm.gov.in/api/v1/auth/verify
ABHA_CLIENT_ID=your_abha_client_id
ABHA_CLIENT_SECRET=your_abha_client_secret
```

#### 🎯 AI Integration (Optional)
```env
VITE_OPENAI_API_KEY=your-openai-key
VITE_GEMINI_API_KEY=your-gemini-key
VITE_ANTHROPIC_API_KEY=your-anthropic-key
```

### 4. Build Configuration

Your `vercel.json` is already configured with:
- ✅ Vite framework detection
- ✅ SPA routing support
- ✅ Asset caching optimization
- ✅ CORS headers for API routes

## 🔍 Verification Steps

After deployment:

1. **Check Build Logs**: Ensure no build errors
2. **Test Core Features**:
   - ✅ Homepage loads
   - ✅ Clinical Diagnosis Entry works
   - ✅ Patient records display
   - ✅ Terminology search functions
   - ✅ Theme toggle works

3. **Test Sample Data**:
   - ✅ Quick select patients show records
   - ✅ Save functionality works
   - ✅ FHIR bundle generation

## 🚨 Common Issues & Solutions

### Build Fails with Dependency Conflicts
```bash
# Vercel uses: npm install --legacy-peer-deps
# This is already configured in vercel.json
```

### Environment Variables Not Working
- Ensure all `VITE_` prefixed variables are set
- Redeploy after adding new variables
- Check Vercel dashboard for typos

### 404 on Page Refresh
- Already handled in `vercel.json` with SPA routing
- All routes redirect to `/index.html`

### CORS Issues
- API CORS headers are configured in `vercel.json`
- For external APIs, check their CORS policies

## 🔗 Post-Deployment

### Custom Domain (Optional)
1. Go to Project Settings → Domains
2. Add your custom domain
3. Configure DNS settings as instructed

### Performance Monitoring
- Vercel provides automatic analytics
- Check **Analytics** tab in your project dashboard

### Continuous Deployment
- Automatic deployments on every push to `main`
- Preview deployments for other branches

## 📱 Mobile Optimization

The app is already mobile-responsive with:
- ✅ Responsive grid layouts
- ✅ Touch-friendly buttons
- ✅ Mobile-optimized forms
- ✅ Swipe navigation hints

## 🔐 Security Features

- ✅ HTTPS by default
- ✅ Secure headers configuration
- ✅ Environment variable protection
- ✅ ABHA authentication ready

## 📊 Expected Performance

- **First Load**: ~2-3 seconds
- **Page Transitions**: ~200ms
- **Build Time**: ~2-4 minutes
- **Bundle Size**: ~1.5MB (optimized)

---

🎉 **Your MediSync application is now live on Vercel!**

**Live URL**: `https://your-project-name.vercel.app`
**Admin Panel**: `https://vercel.com/dashboard`