FROM node:16 AS build
WORKDIR /usr/build
COPY package.json package-lock.json ./
RUN npm install
COPY tsconfig.json webpack.config.js ./
COPY src ./src
RUN npm run build:prod

FROM nginx:1
ENV NODE_ENV="production"
WORKDIR /usr/share/nginx/html
COPY --from=build /usr/build/dist/ ./
