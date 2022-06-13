FROM node:16-alpine
RUN npm install -g --progress=false serve@13

ARG BUILD_LANGUAGE

WORKDIR /var/www/html/
COPY dist .

WORKDIR /app
COPY docker/languages/$BUILD_LANGUAGE/serve.json .

EXPOSE 3000
CMD serve --config /app/serve.json --cors --no-clipboard --no-port-switching -p 3000 /var/www/html
