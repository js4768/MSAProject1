FROM node:latest
COPY ./src /router
ADD src/package.json /router/package.json

RUN cd router && npm install

RUN mkdir -p /opt/app && cp -a /router/node_modules /opt/app/

WORKDIR /opt/app
ADD . /opt/app

ENV NODE_ENV production
ENV EXPRESS_PORT 80

EXPOSE 3000
EXPOSE 8080
EXPOSE 5672
EXPOSE 15672

CMD ["node", "/router/router.js"]