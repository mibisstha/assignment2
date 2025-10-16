FROM node:22-alpine

WORKDIR /app

# Install required system packages
RUN apk add --no-cache openssl libc6-compat git

# Copy dependency files first for better caching
COPY package*.json ./

# Install all dependencies (including dev, since build needs them)
RUN npm install

# Copy the entire app
COPY . .

# Generate Prisma client
RUN npx prisma generate

# Build the Next.js app
RUN npm run build

# Expose the API port
EXPOSE 4000

# Run Prisma DB push before starting the API
CMD npx prisma db push --accept-data-loss && npm start
