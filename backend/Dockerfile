FROM node:22-alpine

RUN apk update && apk upgrade --no-cache

WORKDIR /usr/src/app

COPY package*.json ./
RUN npm install

COPY . .

EXPOSE 5000

CMD ["npm", "start"]