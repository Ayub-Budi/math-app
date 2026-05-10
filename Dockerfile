# Stage 1: Install dependencies & build
FROM node:18-slim AS builder
WORKDIR /app

# Install openssl for Prisma
RUN apt-get update && apt-get install -y openssl

# Install dependencies
COPY package*.json ./
COPY prisma ./prisma/
RUN npm install --legacy-peer-deps

# Build application
COPY . .
RUN ./node_modules/.bin/prisma generate
RUN npm run build

# Stage 2: Runner
FROM node:18-slim AS runner
WORKDIR /app

# Install openssl in runner as well
RUN apt-get update && apt-get install -y openssl && rm -rf /var/lib/apt/lists/*

ENV NODE_ENV production
ENV PORT 8080
EXPOSE 8080

# Standalone mode
COPY --from=builder /app/public ./public
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static

# Start server.js directly
CMD ["node", "server.js"]