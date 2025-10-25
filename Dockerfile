# Use Node.js 20 Alpine for better compatibility
FROM node:20-alpine

# Install system dependencies
RUN apk add --no-cache \
    curl

# Set working directory
WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies (including dev dependencies for build)
RUN npm ci

# Copy source code
COPY . .

# Build the application
RUN npm run build

# Remove dev dependencies to reduce image size
RUN npm prune --production

# Expose port
EXPOSE 3000

# Railway handles health checks, no need for Docker health check

# Start the application
CMD ["npm", "run", "start:railway"]
