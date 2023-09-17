FROM node:16.11.1

COPY package.json /app/
COPY src /app/src/
COPY utils.js /app/

WORKDIR /app

EXPOSE 3000

RUN mkdir -p /app/uploads
RUN mkdir -p /app/downloads
RUN npm install

CMD [ "node", "src/index.js" ]