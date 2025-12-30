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

# Production stage
FROM node:22-alpine

WORKDIR /app
RUN npm install -g pnpm
RUN mkdir -p ./packages/app
COPY --from=builder /app/ ./
COPY --from=builder /app/packages/app/dist ./packages/app/dist
COPY --from=builder /app/packages/app/package*.json ./packages/app/
RUN cd ./packages/app/

EXPOSE 3001

WORKDIR /app/packages/app

CMD ["pnpm", "run", "start"]