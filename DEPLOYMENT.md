# 🆓 Render Deployment Guide

## Quick Setup

### 1. Create Render Account
1. Go to [render.com](https://render.com)
2. Sign up with GitHub (FREE forever!)
3. Connect your repository

### 2. Deploy from GitHub

#### Option A: One-Click Deploy
1. Push this code to GitHub
2. Go to Render Dashboard
3. Click "New" → "Blueprint"
4. Connect your repo
5. Render will read `render.yaml` and create both services automatically!

#### Option B: Manual Setup
Create 2 web services:

##### Server Service:
- **Name**: `ai-subs-server`
- **Environment**: `Docker`
- **Dockerfile Path**: `./server.Dockerfile`
- **Plan**: `Free`
- **Port**: `8787`
- **Health Check**: `/health`

##### Addon Service:
- **Name**: `ai-subs-addon`
- **Environment**: `Docker` 
- **Dockerfile Path**: `./addon.Dockerfile`
- **Plan**: `Free`
- **Port**: `7000`
- **Health Check**: `/`

### 3. Environment Variables

Set these in Render dashboard for **both services**:

```env
# Required
NODE_ENV=production
OPENAI_API_KEY=your_openai_key
OPENSUBTITLES_API_KEY=your_opensubtitles_key

# Optional
PORT=8787
DEFAULT_LANG=en
CORS_ORIGIN=https://your-frontend-domain.com
OPENAI_MODEL=gpt-3.5-turbo
OPENAI_MAX_TOKENS=2000
OPENAI_TEMPERATURE=0.3
```

### 4. GitHub Secrets

Add these secrets to your GitHub repository:

```env
# Render API Key (get from render.com/dashboard/account)
RENDER_API_KEY=your_render_api_key

# Service IDs (get from service URLs)
RENDER_SERVER_SERVICE_ID_PROD=srv-xxxxxxxxxxxxx
RENDER_ADDON_SERVICE_ID_PROD=srv-xxxxxxxxxxxxx
RENDER_SERVER_SERVICE_ID_STAGING=srv-xxxxxxxxxxxxx
RENDER_ADDON_SERVICE_ID_STAGING=srv-xxxxxxxxxxxxx

# Production URL (for health checks)
RENDER_PRODUCTION_URL=https://ai-subs-server.onrender.com
```

### 5. Get Service IDs

Service IDs are found in the service URL:
`https://dashboard.render.com/web/srv-xxxxxxxxxxxxx`

Copy the `srv-xxxxxxxxxxxxx` part.

## Automatic Deployments

After setup, deployments are automatic:

- **Staging**: Push to `develop` branch
- **Production**: Push to `main` branch

## Monitoring

- **Railway Dashboard**: Monitor logs, metrics, deployments
- **Health Checks**: `/health` endpoint for server status
- **GitHub Actions**: Build and deployment status

## Troubleshooting

### Deployment Fails
1. Check Railway logs in dashboard
2. Verify environment variables are set
3. Ensure Dockerfile builds locally

### Service Won't Start
1. Check health check endpoint
2. Verify port configuration (8787 for server, 7000 for addon)
3. Check logs for startup errors

### Database Needed?
```bash
# Add PostgreSQL to Railway project
railway add postgresql

# Add Redis
railway add redis

# Environment variables will be auto-injected
```

## Costs

- **Free Tier**: $0/month (with usage limits)
- **Pro Plan**: $5/month per user (unlimited usage)
- **Pay-as-you-go**: $0.000463/hour per GB RAM

Perfect for small to medium projects! 🚀
