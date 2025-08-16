# 🚀 Render Deployment Guide

## 🎯 Quick Deploy (Recommended)

### One-Click Deploy Button
[![Deploy to Render](https://render.com/images/deploy-to-render-button.svg)](https://render.com/deploy?repo=https://github.com/giampierobono/ai-subs-translator)

**Steps:**
1. Click the button above
2. Sign in to Render (free account)
3. Connect your GitHub repository
4. Render reads `render.yaml` and creates both services automatically
5. ✅ Done! No API keys needed in environment variables

---

## 🔧 Manual Setup (Alternative)

### 1. Create Render Account
1. Go to [render.com](https://render.com)
2. Sign up with GitHub (FREE forever!)
3. Connect your repository

### 2. Create Services

#### Server Service:
- **Name**: `ai-subs-server`
- **Environment**: `Docker`
- **Dockerfile Path**: `./server.Dockerfile`
- **Plan**: `Free`
- **Port**: `8787`
- **Health Check**: `/health`

#### Addon Service:
- **Name**: `ai-subs-addon`
- **Environment**: `Docker` 
- **Dockerfile Path**: `./addon.Dockerfile`
- **Plan**: `Free`
- **Port**: `7000`
- **Health Check**: `/`

### 3. Environment Variables

**Required (minimal setup):**
```env
NODE_ENV=production
DEFAULT_LANG=en
CORS_ORIGIN=""
```

**Optional (for fallback access):**
```env
# Only set these if you want fallback access when users don't provide keys
OPENAI_API_KEY=your_openai_key_optional
OPENSUBTITLES_API_KEY=your_opensubtitles_key_optional
```

---

## 🎬 How It Works

### User-Provided API Keys System
1. **Users visit**: `https://your-addon-url/configure.html`
2. **Users enter their own API keys**:
   - OpenAI API Key (required for translation)
   - OpenSubtitles API Key (optional, for higher limits)
3. **System generates personalized addon URL**
4. **Users install their personal addon in Stremio**

### 🔒 Privacy & Security
- ✅ **No API keys stored on server**
- ✅ **Each user pays for their own usage**
- ✅ **Keys embedded in addon URL (client-side only)**
- ✅ **Perfect for public deployment**

---

## ⚙️ GitHub Actions Auto-Deploy (Optional)

### 1. Enable Auto-Deploy
Add this repository variable in GitHub:
```
DEPLOY_ENABLED=true
```

### 2. Add GitHub Secrets
```env
# Render API Key (get from render.com/dashboard/account)
RENDER_API_KEY=your_render_api_key

# Service IDs (get from service settings)
RENDER_SERVER_SERVICE_ID_PROD=srv-xxxxxxxxxxxxx
RENDER_ADDON_SERVICE_ID_PROD=srv-xxxxxxxxxxxxx

# URLs for health checks (optional)
RENDER_SERVER_URL=https://ai-subs-server.onrender.com
RENDER_ADDON_URL=https://ai-subs-addon.onrender.com
```

### 3. Find Service IDs
Service IDs are in the service settings URL:
`https://dashboard.render.com/web/srv-xxxxxxxxxxxxx`
Copy the `srv-xxxxxxxxxxxxx` part.

---

## 🌐 Usage After Deploy

### 1. Get Your URLs
After deployment, you'll have:
- **Server**: `https://ai-subs-server.onrender.com`
- **Addon**: `https://ai-subs-addon.onrender.com`

### 2. Configure Stremio Addon
1. Visit: `https://ai-subs-addon.onrender.com/configure.html`
2. Enter your API keys:
   - **OpenAI**: Get from [platform.openai.com/api-keys](https://platform.openai.com/api-keys)
   - **OpenSubtitles**: Get from [opensubtitles.com/consumers](https://opensubtitles.com/consumers) (optional)
3. Copy the generated addon URL
4. Install in Stremio

### 3. Enjoy!
- 🎬 Watch movies/series in Stremio
- 🔄 Get AI-translated subtitles on demand
- 💰 Pay only for your own usage (typically $0.01-0.03 per movie)

---

## 🔧 Monitoring & Troubleshooting

### Health Checks
- **Server**: `https://your-server-url/health`
- **Addon**: `https://your-addon-url/manifest.json`

### Common Issues

#### Service Won't Start
1. Check Render logs in dashboard
2. Verify Docker build completed successfully
3. Check port configuration matches Dockerfile

#### API Keys Not Working
1. Users should get fresh keys from providers
2. Check that keys have sufficient credits
3. Verify addon URL contains the keys

#### No Subtitles Found
1. Try different language codes (en, es, fr, etc.)
2. Check if movie/series exists on OpenSubtitles
3. Verify the video ID format

---

## 💰 Costs

### Render (Hosting)
- **Free Tier**: $0/month
  - 750 hours/month compute
  - 512MB RAM
  - 100GB bandwidth
  - Perfect for personal use!

### User Costs (API Usage)
- **OpenAI**: ~$0.01-0.03 per movie translation
- **OpenSubtitles**: Free with registration (higher limits)

**Total cost for users**: Pennies per movie! 🎯

---

## 🚀 Production Ready Features

✅ **Docker containerization**  
✅ **Health checks & monitoring**  
✅ **CORS configuration**  
✅ **Error handling & logging**  
✅ **TypeScript type safety**  
✅ **Security best practices**  
✅ **User API key isolation**  
✅ **CI/CD pipeline**  

Perfect for production use! 🌟