FROM node:22-alpine
# on prens l'image officielle de nodejs 
WORKDIR /app
# REVOIR 
COPY package.json .

RUN npm install
# installe la dependance node package manadger
RUN npm install pg-promise

RUN npm install redis

COPY . .

EXPOSE 2001

CMD ["node", "lobby-service.js"]
# lance le js