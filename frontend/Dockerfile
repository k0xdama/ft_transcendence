# Build
FROM node:22-alpine as build

WORKDIR /app

COPY package*.json ./

COPY . .

RUN npm install

RUN npm run build

# Production env
FROM nginx:stable-alpine

COPY --from=build /app/dist/ /usr/share/nginx/html
COPY --from=build /app/nginx/default.conf /etc/nginx/conf.d/default.conf

EXPOSE 8443

CMD [ "nginx", "-g", "daemon off;" ]