FROM node:22 AS builder

WORKDIR /app
# Copy workspace configuration files
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
# Copy server package files
COPY packages/server/package*.json ./packages/server/
RUN npm install -g pnpm && pnpm install
# Copy all source files
COPY . .
# Set working directory to server package and build
WORKDIR /app/packages/server
RUN pnpm run build

FROM node:22-alpine

WORKDIR /app
COPY --from=builder /app/packages/server/dist ./dist
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/packages/server/package*.json ./

EXPOSE 3000
CMD ["node", "dist/main"]