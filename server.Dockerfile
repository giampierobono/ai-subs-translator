FROM node:18-alpine

WORKDIR /app

# Copy only the monorepo into the container
COPY ai-subs-translator ./ai-subs-translator

# Install dependencies for the monorepo and its workspaces
WORKDIR /app/ai-subs-translator
RUN npm install --omit=dev

# Start the server
WORKDIR /app/ai-subs-translator/apps/server

CMD ["node", "src/index.js"]