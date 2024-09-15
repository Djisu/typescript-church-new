# Use the official Node.js image as a base
FROM node:14

# Set the working directory for the backend
WORKDIR /usr/src/app/backend

# Copy backend package.json and install dependencies
COPY ./backend/package*.json ./
RUN npm install

# Copy backend code
COPY ./backend .

# Set the working directory for the frontend
WORKDIR /usr/src/app/frontend

# Copy frontend package.json and install dependencies
COPY ./frontend/package*.json ./
RUN npm install

# Copy frontend code
COPY ./frontend .

# Build the React app
RUN npm run build

# Install serve to serve the frontend
RUN npm install -g serve

# Expose the port
EXPOSE 3000

# Start both backend and frontend (adjust as needed)
CMD ["npm", "start"]