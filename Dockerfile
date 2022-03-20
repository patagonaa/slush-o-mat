FROM node:16-alpine AS build
WORKDIR /usr/build
COPY package.json package-lock.json ./
RUN npm install
COPY tsconfig.json webpack.config.js ./
COPY src ./src
RUN npm run build:prod

FROM nginx:stable-alpine
ENV NODE_ENV="production"
WORKDIR /usr/share/nginx/html
COPY --from=build /usr/build/dist/ ./
