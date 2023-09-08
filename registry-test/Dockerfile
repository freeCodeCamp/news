FROM node:18-alpine

ARG BUILD_ID
ENV BUILD_ID=${BUILD_ID}

WORKDIR /app
COPY . .
EXPOSE 3000

CMD  ["node", "index.js"]
