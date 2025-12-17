# Build stage
FROM node:22 AS builder

WORKDIR /app
COPY package*.json ./
RUN npm install -g pnpm
COPY . .
RUN pnpm i
RUN cd packages/app && pnpm i
RUN pnpm run build

# Production stage
FROM node:22-alpine

WORKDIR /app
RUN mkdir -p ./packages/app
COPY --from=builder /app/packages/app/dist ./packages/app/dist
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/packages/app/node_modules ./packages/app/node_modules
COPY --from=builder /app/packages/app/package*.json ./packages/app/
RUN cd ./packages/app/

EXPOSE 3001
CMD ["pnpm", "run", "start"]