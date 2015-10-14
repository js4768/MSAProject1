FROM node:latest
COPY ./src /course-svc
ADD src/package.json /course-svc/package.json

RUN cd course-svc && npm install

RUN mkdir -p /opt/app && cp -a /course-svc/node_modules /opt/app/

WORKDIR /opt/app
ADD . /opt/app

ENV NODE_ENV production
ENV EXPRESS_PORT 80

EXPOSE 3000
EXPOSE 8080
EXPOSE 5672
EXPOSE 15672

CMD ["node","/course-svc/service.js"]
