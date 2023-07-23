FROM node:20-alpine

WORKDIR /usr/src/app
COPY receiver.js ./
COPY package*.json ./

CMD npm i && npm i nodemon && npm run start:dev