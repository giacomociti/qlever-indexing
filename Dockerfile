# Use official Node.js LTS image
FROM node:20-alpine

WORKDIR /app

RUN apk add --no-cache zip

COPY package*.json ./
RUN npm install --production

COPY src ./src

EXPOSE 3000
CMD ["node", "src/server.js"]
