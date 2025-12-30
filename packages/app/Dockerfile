# Build stage
FROM node:22 AS builder

# Add build argument to control whether to build
ARG SKIP_BUILD=false
# Add build argument to control whether to install dependencies
ARG SKIP_INSTALL=false

WORKDIR /app
COPY package*.json ./
RUN npm install -g pnpm
COPY . .
RUN if [ "$SKIP_INSTALL" != "true" ]; then pnpm i; else echo "Skipping install step"; fi
WORKDIR /app/packages/app
# Conditionally run build based on SKIP_BUILD argument
RUN if [ "$SKIP_BUILD" != "true" ]; then pnpm run build; else echo "Skipping build step"; fi

WORKDIR /app/packages/app
EXPOSE 3001

CMD ["pnpm", "run", "start"]