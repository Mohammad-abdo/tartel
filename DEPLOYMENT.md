# 🚀 Deployment Guide - Sheky Frontend

## 📋 Overview

This guide covers deploying the Sheky platform frontend to Vercel with proper environment configuration.

## 🏗️ Files Added

### ✅ `vercel.json`
- **Purpose**: Vercel deployment configuration
- **Features**:
  - SPA routing support (redirects all routes to index.html)
  - Static asset caching (1 year for assets)
  - Security headers (XSS protection, content type options, frame options)
  - Build configuration for Vite

### ✅ `.env`
- **Purpose**: Local development environment variables
- **Contains**: 
  - API URL for local backend
  - UI configuration
  - Development flags
  - Application metadata

### ✅ `.env.production`
- **Purpose**: Production environment variables
- **Contains**:
  - Production API URL (update required)
  - Security settings
  - Performance optimizations
  - Analytics configuration

## 🌐 Deployment Steps

### 1️⃣ **Prepare Backend**
Before deploying frontend, ensure your backend is deployed and accessible:

```bash
# Backend should be available at something like:
# https://your-backend-api.vercel.app
# or https://your-backend-api.herokuapp.com
```

### 2️⃣ **Update Production API URL**
Edit `.env.production` and update the API URL:

```env
# Replace with your actual backend URL
VITE_API_URL=https://your-actual-backend-url.vercel.app/api
```

### 3️⃣ **Deploy to Vercel**

#### Option A: Vercel CLI
```bash
# Install Vercel CLI
npm i -g vercel

# Login to Vercel
vercel login

# Deploy from frontend directory
cd frontend
vercel --prod
```

#### Option B: GitHub Integration
1. Push code to GitHub repository
2. Connect repository to Vercel
3. Vercel will auto-deploy on push to main branch

### 4️⃣ **Environment Variables in Vercel**
In your Vercel dashboard, add these environment variables:

```env
# Required
VITE_API_URL=https://your-backend-api.vercel.app/api

# Optional but recommended
VITE_APP_NAME=Sheky Platform
VITE_DEFAULT_LANGUAGE=ar
VITE_SUPPORTED_LANGUAGES=ar,en
```

### 5️⃣ **Domain Configuration**
- Vercel provides a free domain: `your-app.vercel.app`
- For custom domain: Add in Vercel dashboard → Settings → Domains

## 🔧 Configuration Details

### 📁 Build Configuration
```json
{
  "buildCommand": "npm run build",
  "outputDirectory": "dist",
  "installCommand": "npm install",
  "framework": "vite"
}
```

### 🔀 Routing Configuration
Single Page Application routing is handled by:
```json
{
  "rewrites": [
    {
      "source": "/((?!api/.*).*)",
      "destination": "/index.html"
    }
  ]
}
```

### 🛡️ Security Headers
```json
{
  "headers": [
    {
      "key": "X-Content-Type-Options",
      "value": "nosniff"
    },
    {
      "key": "X-Frame-Options", 
      "value": "DENY"
    },
    {
      "key": "X-XSS-Protection",
      "value": "1; mode=block"
    }
  ]
}
```

### ⚡ Performance Optimizations
```json
{
  "headers": [
    {
      "source": "/assets/(.*)",
      "headers": {
        "cache-control": "max-age=31536000"
      }
    }
  ]
}
```

## 🔍 Environment Variables Reference

### 🏠 Local Development
```env
VITE_API_URL=http://localhost:8002/api
VITE_DEV_MODE=true
VITE_DEBUG=true
```

### 🌍 Production
```env
VITE_API_URL=https://your-backend.vercel.app/api
VITE_DEV_MODE=false
VITE_DEBUG=false
```

### 📊 Optional Analytics
```env
# Google Analytics
VITE_GA_ID=GA-XXXXXXXXX

# Sentry Error Tracking
VITE_SENTRY_DSN=https://your-sentry-dsn
```

## ✅ Verification Checklist

After deployment, verify:

- [ ] ✅ **Frontend loads** at Vercel URL
- [ ] ✅ **API calls work** (check Network tab)
- [ ] ✅ **Authentication works** (login/logout)
- [ ] ✅ **Routing works** (navigate between pages)
- [ ] ✅ **Arabic language** displays correctly (RTL)
- [ ] ✅ **File uploads work** (if applicable)
- [ ] ✅ **Mobile responsive** design

## 🐛 Troubleshooting

### Common Issues:

#### 🚨 **API Connection Failed**
```
Error: Network Error / API calls fail
```
**Solution**: Check `VITE_API_URL` in Vercel environment variables

#### 🚨 **404 on Page Refresh**
```
Error: Page not found on refresh
```
**Solution**: Verify `vercel.json` rewrites configuration

#### 🚨 **Build Failed**
```
Error: Build process failed
```
**Solution**: 
1. Check `package.json` build script
2. Verify all dependencies are installed
3. Check environment variables are set

#### 🚨 **CORS Issues**
```
Error: Access to fetch blocked by CORS policy
```
**Solution**: Configure CORS in your backend to allow frontend domain

## 📱 Mobile & PWA

For Progressive Web App features, consider adding:
- `manifest.json`
- Service worker
- App icons

## 🚀 Performance Tips

1. **Code Splitting**: Already configured with Vite
2. **Asset Optimization**: Images optimized automatically
3. **Caching**: Static assets cached for 1 year
4. **Compression**: Vercel handles gzip/brotli automatically

## 📞 Support

If you encounter issues:
1. Check Vercel build logs
2. Verify environment variables
3. Test API endpoints independently
4. Check browser console for errors

---

**🎉 Your Sheky frontend is now ready for production deployment!**