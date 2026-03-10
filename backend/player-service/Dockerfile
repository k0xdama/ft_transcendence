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

# RUN sudo apt install jq pour ubuntu/debian 
# pour le testeur de requete

#RUN chmod +x test-player.sh

COPY . .

# ✅ Copier le script d'initialisation
COPY init-uploads.sh /usr/local/bin/init-uploads.sh
RUN chmod +x /usr/local/bin/init-uploads.sh

EXPOSE 3001

# ✅ Utiliser le script comme ENTRYPOINT
ENTRYPOINT ["/usr/local/bin/init-uploads.sh"]

#SON
CMD ["npm", "start"]
#SON

#MON
#CMD ["node", "player-service.js"]
#MON

# lance le js