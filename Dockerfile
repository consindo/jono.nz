# syntax = docker/dockerfile:1

# Adjust NODE_VERSION as desired
ARG NODE_VERSION=24.14.0
FROM docker.io/library/node:${NODE_VERSION}-alpine as build

WORKDIR /app

# Set production environment
ENV NODE_ENV="production"

# Install node modules
COPY package-lock.json package.json ./
RUN npm ci --include=dev

# Copy site in
COPY . .
RUN npm run build

# Final stage for app image
FROM docker.io/library/nginx:alpine

# Copy built application
COPY default.conf /etc/nginx/conf.d
COPY --from=build /app/_site /usr/share/nginx/html
