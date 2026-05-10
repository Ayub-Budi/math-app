# Stage 1: Install dependencies & build
FROM node:18-alpine AS builder
WORKDIR /app

# Install dependencies
COPY package*.json ./
COPY prisma ./prisma/
RUN npm install

# Build application
COPY . .
RUN npx prisma generate
RUN npm run build

# Stage 2: Runner
FROM node:18-alpine AS runner
WORKDIR /app

ENV NODE_ENV production
ENV PORT 8080
EXPOSE 8080

# Standalone mode only needs these files
COPY --from=builder /app/public ./public
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static

# Start server.js directly (much lighter than npm start)
CMD ["node", "server.js"]