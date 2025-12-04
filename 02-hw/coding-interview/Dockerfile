# Multi-stage build for Coding Interview Platform

# Stage 1: Build the frontend
FROM node:20-alpine AS frontend-builder

WORKDIR /app

# Copy root package files
COPY package*.json ./

# Copy client package files
COPY client/package*.json ./client/

# Install all dependencies (including client)
RUN npm install

# Copy client source code
COPY client/ ./client/

# Build the frontend
RUN npm run build --workspace=client

# Stage 2: Production
FROM node:20-alpine AS production

WORKDIR /app

# Copy root package files
COPY package*.json ./

# Copy server package files
COPY server/package*.json ./server/

# Install only production dependencies for server
RUN npm install --workspace=server --omit=dev

# Copy server source code
COPY server/ ./server/

# Copy built frontend from builder stage
COPY --from=frontend-builder /app/client/dist ./client/dist

# Set environment to production
ENV NODE_ENV=production

# Expose port 3001
EXPOSE 3001

# Start the server
CMD ["node", "server/index.js"]
