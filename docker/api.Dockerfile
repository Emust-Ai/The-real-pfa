FROM node:20-alpine AS development
WORKDIR /app
COPY api/package*.json ./
RUN npm ci
COPY api/ ./
EXPOSE 3000
CMD ["npm", "run", "start:dev"]

FROM node:20-alpine AS production
WORKDIR /app
COPY api/package*.json ./
RUN npm ci --only=production
COPY api/ ./
RUN npm run build
EXPOSE 3000
CMD ["node", "dist/main"]
