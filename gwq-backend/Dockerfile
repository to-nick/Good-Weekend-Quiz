FROM node:20-alpine AS build

WORKDIR /app-backend

COPY package*.json ./

RUN npm install --production

COPY . .

EXPOSE 5010

FROM node:20-alpine
WORKDIR /app-backend
COPY --from=build /app-backend ./
RUN npm install -g serve
EXPOSE 5010

CMD ["npm", "start"]