# Stage 1: Build the application
FROM node:22-alpine AS builder

WORKDIR /app

# Copy package files and install dependencies
COPY package*.json ./
RUN npm install

# Copy the rest of the application source code
COPY . .

# Hono doesn't require a build step if we run it with tsx
# but if it did, it would be here. e.g., RUN npm run build

# Stage 2: Create the production image
FROM node:22-alpine

WORKDIR /app

# Copy dependency information
COPY --from=builder /app/package*.json ./

# Install only production dependencies
RUN npm install --omit=dev

# Copy application config and source code
COPY --from=builder /app/drizzle.config.ts ./
COPY --from=builder /app/src ./src

# Expose the port the app runs on
EXPOSE 8000

# Command to run the application
CMD ["npm", "run", "start"]
