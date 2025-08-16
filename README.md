# 🎬 AI Subtitle Translator

A powerful subtitle translation service built with TypeScript, featuring real-time translation using OpenAI and subtitle fetching from OpenSubtitles.

## ✨ Features

- 🔄 **Real-time subtitle translation** using OpenAI GPT
- 📥 **Automatic subtitle fetching** from OpenSubtitles 
- 🔑 **User-provided API keys** - No shared costs, each user uses their own keys
- 🏗️ **Monorepo architecture** with TypeScript
- 🐳 **Docker containerization** ready for production
- 🚀 **CI/CD pipeline** with GitHub Actions
- 📊 **Health monitoring** and error handling
- 🎯 **Stremio addon** for seamless integration
- 🛡️ **Privacy-first** - API keys stay with the user

## 🚀 Quick Start

### Development
```bash
# Clone repository
git clone https://github.com/giampierobono/ai-subs-translator.git
cd ai-subs-translator

# Install dependencies
npm install

# Start development servers
npm run dev
```

### Production (Docker)
```bash
# Build and run with Docker Compose (modern syntax)
docker compose up --build

# Or build individual services
docker build -f server.Dockerfile -t ai-subs-server .
docker build -f addon.Dockerfile -t ai-subs-addon .
```

### Environment Setup

**For Development:**
```bash
# Copy environment template  
cp .env.example .env

# Add your API keys for development
OPENAI_API_KEY=your_openai_key
OPENSUBTITLES_API_KEY=your_opensubtitles_key
```

**For Production (Recommended):**
No API keys needed in environment variables! Each user provides their own keys through the addon interface.

## 🎬 Using the Stremio Addon

1. **Deploy the addon** using the instructions below
2. **Visit the configuration page** at `https://your-addon-url/configure.html`
3. **Enter your API keys:**
   - **OpenAI API Key** (Required) - Get from [platform.openai.com/api-keys](https://platform.openai.com/api-keys)
     - 💰 Pay-per-use (typically $0.01-0.03 per movie)
   - **OpenSubtitles API Key** (Optional but recommended) - Get from [opensubtitles.com/consumers](https://www.opensubtitles.com/en/consumers)
     - 🆓 Free registration, higher download limits
4. **Copy the generated addon URL** and install it in Stremio
5. **Enjoy AI-translated subtitles!** 🎉

### 🔒 Privacy & Security
- Your API keys are embedded in the addon URL (client-side only)
- Keys are never stored on our servers
- Each user pays for their own API usage
- Only share your addon URL with trusted devices

## 📦 Architecture

### Monorepo Structure
- **`apps/server`** - Express API server (port 8787)
- **`apps/addon`** - Stremio addon service (port 7000)
- **`packages/core`** - SRT parsing and subtitle utilities
- **`packages/types`** - Shared TypeScript type definitions (Feature-Sliced Design)
- **`packages/config`** - Centralized configuration management
- **`packages/provider-openai`** - OpenAI GPT integration
- **`packages/provider-opensubtitles`** - OpenSubtitles API integration

### Key Technical Features
- 🏗️ **TypeScript monorepo** with Turbo for fast builds
- 🔒 **User API key system** - no server-side key storage
- 🐳 **Multi-stage Docker builds** for optimized containers
- ⚡ **Express 5.x** with modern async/await patterns
- 🎯 **Native Node.js fetch** (no external HTTP libraries)
- 🛡️ **Comprehensive error handling** with custom error classes

## 🆓 Deployment

Deploy to Render with one click (FREE forever):

[![Deploy to Render](https://render.com/images/deploy-to-render-button.svg)](https://render.com/deploy?repo=https://github.com/giampierobono/ai-subs-translator)

For detailed deployment instructions, see [DEPLOYMENT.md](./DEPLOYMENT.md).

## 🛠️ Development

```bash
# Install dependencies
npm install

# Build all packages  
npm run build

# Run tests (placeholder scripts in packages)
npm run test

# Lint code (configured per package)
npm run lint

# Type check across monorepo
npm run type-check

# Development servers
npm run dev  # Starts both server and addon in parallel

# Clean build artifacts
npm run clean
```

### CI/CD Workflows
- ✅ **Main CI** - Build, test, security audit, Docker build
- ✅ **Dependencies** - Automated dependency updates (weekly)
- ✅ **Performance** - Load testing of health endpoints
- ✅ **Release** - Automated releases on tag push

### Security & Auditing
- 🔒 **npm audit** configured for critical vulnerabilities only
- 🛡️ **No external quality services** (SonarCloud removed)
- ⚡ **Fast CI** without external token dependencies
