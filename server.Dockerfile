# Build stage
FROM node:18-alpine AS builder

WORKDIR /app

# Copy package files for caching
COPY package*.json ./
COPY turbo.json ./
COPY tsconfig.json ./

# Copy workspace structure
COPY apps/server/package*.json ./apps/server/
COPY packages/core/package*.json ./packages/core/
COPY packages/config/package*.json ./packages/config/
COPY packages/types/package*.json ./packages/types/
COPY packages/provider-openai/package*.json ./packages/provider-openai/
COPY packages/provider-opensubtitles/package*.json ./packages/provider-opensubtitles/

# Install all dependencies
RUN npm install

# Copy source code
COPY . .

# Build only server and its dependencies
RUN npx turbo build --filter=@ai-subs-translator/server

# Production stage
FROM node:18-alpine AS production

WORKDIR /app

# Copy package files
COPY package*.json ./
COPY apps/server/package*.json ./apps/server/
COPY packages/core/package*.json ./packages/core/
COPY packages/config/package*.json ./packages/config/
COPY packages/types/package*.json ./packages/types/
COPY packages/provider-openai/package*.json ./packages/provider-openai/
COPY packages/provider-opensubtitles/package*.json ./packages/provider-opensubtitles/

# Install only production dependencies
RUN npm ci --only=production

# Copy built application from builder stage
COPY --from=builder /app/apps/server/dist ./apps/server/dist
COPY --from=builder /app/packages ./packages

# Expose port
EXPOSE 8787

# Start the server
CMD ["node", "apps/server/dist/index.js"]