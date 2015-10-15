FROM ubuntu:14.04
RUN apt-key adv --keyserver hkp://keyserver.ubuntu.com:80 --recv 7F0CEB10
RUN echo "deb http://repo.mongodb.org/apt/ubuntu trusty/mongodb-org/3.0 multiverse" | tee /etc/apt/sources.list.d/mongodb-org-3.0.list
RUN apt-get update && apt-get install -y \
	build-essential \
	nodejs \
	npm \
	mongodb-org
	
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

CMD ["nodejs", "/student-svc/service.js"]