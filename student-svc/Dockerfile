FROM node:latest
COPY ./src /student-svc
ADD src/package.json /student-svc/package.json

RUN cd student-svc && npm install

RUN mkdir -p /opt/app && cp -a /student-svc/node_modules /opt/app/

WORKDIR /opt/app
ADD . /opt/app

ENV NODE_ENV production
ENV EXPRESS_PORT 80

EXPOSE 3000
EXPOSE 8080
EXPOSE 5672
EXPOSE 15672

CMD ["node", "/student-svc/service.js"]