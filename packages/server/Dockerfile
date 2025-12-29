FROM node:22 AS builder

# Add build argument to control whether to build
ARG SKIP_BUILD=false
# Add build argument to control whether to install dependencies
ARG SKIP_INSTALL=false

WORKDIR /app
# Copy workspace configuration files
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
# Copy server package files
COPY packages/server/package*.json ./packages/server/
RUN npm install -g pnpm
# Copy all source files
COPY . .
RUN if [ "$SKIP_INSTALL" != "true" ]; then pnpm i; else echo "Skipping install step"; fi
# Set working directory to server package and build
WORKDIR /app/packages/server
RUN if [ "$SKIP_INSTALL" != "true" ]; then pnpm rebuild; else echo "Skipping rebuild step"; fi
# Conditionally run build based on SKIP_BUILD argument
RUN if [ "$SKIP_BUILD" != "true" ]; then pnpm run build; else echo "Skipping build step"; fi

FROM node:22-alpine

WORKDIR /app
RUN mkdir -p ./packages/server
COPY --from=builder /app/packages/server/dist ./packages/server/dist
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/packages/server/node_modules ./packages/server/node_modules
COPY --from=builder /app/packages/server/package*.json ./packages/server/
RUN cd ./packages/server/

CMD ["pnpm", "run", "start:prod"]