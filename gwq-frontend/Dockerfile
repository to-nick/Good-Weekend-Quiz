FROM node:20-alpine AS build

WORKDIR /app

COPY package*.json ./

RUN npm install --only=production

COPY . .

RUN npm run build

EXPOSE 3000

FROM node:20-alpine
WORKDIR /gwq-frontend
COPY --from=build /app/build ./build
RUN npm install -g serve
RUN rm -rf /app/.npm /app/tests /app/src /app/package*.json
CMD ["serve", "-s", "build"]
EXPOSE 3000