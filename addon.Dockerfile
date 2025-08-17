# Build stage
FROM node:18-alpine AS builder

WORKDIR /app

# Copy package files for caching
COPY package*.json ./
COPY turbo.json ./
COPY tsconfig.json ./

# Copy workspace structure  
COPY apps/addon/package*.json ./apps/addon/
COPY packages/core/package*.json ./packages/core/
COPY packages/config/package*.json ./packages/config/
COPY packages/types/package*.json ./packages/types/
COPY packages/provider-openai/package*.json ./packages/provider-openai/
COPY packages/provider-opensubtitles/package*.json ./packages/provider-opensubtitles/

# Install all dependencies
RUN npm install

# Copy source code
COPY . .

# Build only addon and its dependencies
RUN npx turbo build --filter=@ai-subs-translator/addon

# Verify build output
RUN ls -la apps/addon/dist/ && test -f apps/addon/dist/index.js

# Production stage
FROM node:18-alpine AS production

WORKDIR /app

# Copy package files
COPY package*.json ./
COPY apps/addon/package*.json ./apps/addon/
COPY packages/core/package*.json ./packages/core/
COPY packages/config/package*.json ./packages/config/
COPY packages/types/package*.json ./packages/types/

# Install production dependencies (including workspace packages)
RUN npm install --omit=dev

# Copy built application from builder stage
COPY --from=builder /app/apps/addon/dist ./apps/addon/dist
COPY --from=builder /app/packages ./packages

# Verify that the main file exists
RUN ls -la apps/addon/dist/ && test -f apps/addon/dist/index.js

# Expose port
EXPOSE 7000

# Start the addon
CMD ["node", "apps/addon/dist/index.js"]