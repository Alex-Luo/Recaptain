FROM node:6.0

RUN mkdir /src
RUN npm i -g nodemon

WORKDIR /src

COPY package.json package.json
RUN npm install

CMD ["nodemon", "app", "--legacy-watch"]