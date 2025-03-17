# Use an official Node.js runtime as the base image
FROM node:18-alpine AS base


WORKDIR /usr/src/app

COPY package*.json ./

# Install dependencies
RUN npm install --only=production

COPY . .

RUN npm run build

# Expose the application port
EXPOSE 3000

# Start the NestJS application
CMD ["npm", "run", "start:dev"]
