# Build stage
FROM node:22 AS builder

WORKDIR /app
COPY package*.json ./
RUN npm install -g pnpm && pnpm install
COPY . .
RUN cat package.json
RUN pnpm run build

# Production stage
FROM node:22-alpine

WORKDIR /app
COPY --from=builder ./packages/app/dist ./dist
COPY --from=builder /app/node_modules ./node_modules
COPY package*.json ./

EXPOSE 3001
CMD ["npm", "start"]