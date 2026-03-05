FROM node:22-alpine
# on prens l'image officielle de nodejs 
WORKDIR /app
# REVOIR 
COPY package.json .

RUN npm install
# installe la dependance node package manadger
RUN npm install pg-promise

RUN npm install redis

RUN npm install multer

COPY . .

EXPOSE 3001

#SON
CMD ["npm", "start"]
#SON

#MON
#CMD ["node", "player-service.js"]
#MON

# lance le js