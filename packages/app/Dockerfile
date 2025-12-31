# Build stage
FROM node:22 AS builder

# Add build argument to control whether to build
ARG SKIP_BUILD=false
# Add build argument to control whether to install dependencies
ARG SKIP_INSTALL=false

RUN npm install -g pnpm

WORKDIR /app

COPY ./deploy/app ./packages/app
WORKDIR /app/packages/app

RUN if [ "$SKIP_INSTALL" != "true" ]; then pnpm i; else echo "Skipping install step"; fi
# Conditionally run build based on SKIP_BUILD argument
RUN if [ "$SKIP_BUILD" != "true" ]; then pnpm run build; else echo "Skipping build step"; fi

EXPOSE 3001

CMD ["pnpm", "run", "start:prod"]