FROM alpine as base
RUN apk add --update nodejs
WORKDIR /app

FROM base AS dependencies
WORKDIR /app
RUN apk add --update npm
COPY package*.json ./
RUN npm install \
  && npm cache clean --force

FROM dependencies as build
WORKDIR /app
COPY . .
RUN npm run build

FROM base as prod
WORKDIR /app
COPY --from=build /app/dist ./dist
ENV NODE_ENV=production
ENV PORT=80
EXPOSE 80
CMD ["node", "./dist/main"]
