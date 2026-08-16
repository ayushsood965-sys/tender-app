# Step 1: Build stage
FROM node:20-alpine AS builder

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .

# Build Vite client with backend API URL
ARG VITE_API_URL=https://tdmserver.scholarhubhpu.in/api
ENV VITE_API_URL=$VITE_API_URL

RUN npm run build

# Step 2: Production Nginx stage
FROM nginx:alpine

COPY --from=builder /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
