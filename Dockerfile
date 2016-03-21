FROM node

MAINTAINER JatinTripathi

RUN mkdir /src

WORKDIR /src

COPY package.json /src/package.json
RUN cd /src;npm install --production

COPY . /src

EXPOSE 8080

CMD ["node","/src/server.js"]
