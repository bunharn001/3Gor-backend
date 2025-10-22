# Backend Dockerfile
FROM node:18-alpine

# Set working directory
WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy all backend files
COPY . .

# Create uploads directory if it doesn't exist
RUN mkdir -p uploads

# Expose backend port
EXPOSE 5000

# Start the server
CMD ["node", "server.js"]
