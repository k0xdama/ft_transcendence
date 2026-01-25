FROM node:22-alpine

WORKDIR /app

# Copy package files first (for layer caching)
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy source code
COPY . .

# Expose port
EXPOSE 5172

# Start server
CMD ["npm", "start"]
