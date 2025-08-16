# 🎬 AI Subtitle Translator

A powerful subtitle translation service built with TypeScript, featuring real-time translation using OpenAI and subtitle fetching from OpenSubtitles.

## ✨ Features

- 🔄 **Real-time subtitle translation** using OpenAI GPT
- 📥 **Automatic subtitle fetching** from OpenSubtitles 
- 🏗️ **Monorepo architecture** with TypeScript
- 🐳 **Docker containerization** ready for production
- 🚀 **CI/CD pipeline** with GitHub Actions
- 📊 **Health monitoring** and error handling
- 🎯 **Stremio addon** for seamless integration

## 🚀 Quick Start

### Development
```bash
# Clone repository
git clone <repository-url>
cd ai-subs-translator

# Install dependencies
npm install

# Start development servers
npm run dev
```

### Production (Docker)
```bash
# Build and run with Docker Compose
docker-compose up --build

# Or build individual services
docker build -f server.Dockerfile -t ai-subs-server .
docker build -f addon.Dockerfile -t ai-subs-addon .
```

### Environment Setup
```bash
# Copy environment template
cp .env.example .env

# Add your API keys
OPENAI_API_KEY=your_openai_key
OPENSUBTITLES_API_KEY=your_opensubtitles_key
```

## 📦 Architecture

- **`apps/server`** - Main translation API server
- **`apps/addon`** - Stremio addon service  
- **`packages/core`** - Subtitle parsing utilities
- **`packages/types`** - Shared TypeScript types
- **`packages/config`** - Configuration management
- **`packages/provider-*`** - External API integrations

## 🆓 Deployment

Deploy to Render with one click (FREE forever):

[![Deploy to Render](https://render.com/images/deploy-to-render-button.svg)](https://render.com/deploy)

For detailed deployment instructions, see [DEPLOYMENT.md](./DEPLOYMENT.md).

## 🛠️ Development

```bash
# Install dependencies
npm install

# Build all packages  
npm run build

# Run tests
npm run test

# Lint code
npm run lint

# Type check
npm run type-check
```
