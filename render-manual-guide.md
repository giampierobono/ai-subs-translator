# 📝 Render Manual Deploy Guide

## Server Service
1. New Web Service
2. Connect GitHub repo: ai-subs-translator
3. Name: ai-subs-server
4. Environment: Docker
5. Dockerfile path: ./server.Dockerfile
6. Plan: Free
7. Environment Variables:
   - NODE_ENV=production
   - PORT=8787

## Addon Service  
1. New Web Service
2. Connect GitHub repo: ai-subs-translator  
3. Name: ai-subs-addon
4. Environment: Docker
5. Dockerfile path: ./addon.Dockerfile
6. Plan: Free
7. Environment Variables:
   - NODE_ENV=production
   - PORT=7000
   - BACKEND_URL=https://ai-subs-server.onrender.com/subs

## After Deploy
- Server URL: https://ai-subs-server.onrender.com
- Addon Config: https://ai-subs-addon.onrender.com/configure.html
- Share addon config page with users!
