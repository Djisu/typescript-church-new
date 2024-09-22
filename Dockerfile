# Use the official Node.js image as a base
FROM node:14

# Set the working directory for the backend
WORKDIR /usr/src/app/backend

# Copy backend package.json and install dependencies
COPY ./backend/package*.json ./
RUN npm install

# Copy backend code
COPY ./backend .

# Build the backend (optional, if you need to compile TypeScript)
RUN npm run build  # Ensure you have a build script in your backend package.json

# Set the working directory for the frontend
WORKDIR /usr/src/app/frontend

# Copy frontend package.json and install dependencies
COPY ./frontend/package*.json ./
RUN npm install

# Copy frontend code
COPY ./frontend .

# Build the React app using Vite
RUN npm run build

# Install serve to serve the frontend
RUN npm install -g serve

# Expose the port for the frontend (adjust as needed)
EXPOSE 3000

# Start the backend server (adjust the command as needed)
CMD ["node", "dist/index.js"]  # Change to the correct path of your backend entry file