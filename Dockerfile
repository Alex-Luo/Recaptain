FROM node:6.0

RUN mkdir /src

WORKDIR /src

COPY package.json package.json
COPY . /src
RUN npm install

ENV NODE_ENV=production

CMD ["node", "app.js"]
