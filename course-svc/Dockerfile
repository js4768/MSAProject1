FROM ubuntu:14.04
RUN apt-key adv --keyserver hkp://keyserver.ubuntu.com:80 --recv 7F0CEB10
RUN echo "deb http://repo.mongodb.org/apt/ubuntu trusty/mongodb-org/3.0 multiverse" | tee /etc/apt/sources.list.d/mongodb-org-3.0.list
RUN apt-get update && apt-get install -y \
	build-essential \
	nodejs \
	npm	
COPY ./src/* /course-svc/

RUN cd course-svc && npm update && npm install
RUN mkdir -p /opt/app && cp -a /course-svc/node_modules /opt/app/
RUN cp -a /course-svc/course_schema.json /opt/app
RUN cp -a /course-svc/course_student_schema.json /opt/app

WORKDIR /opt/app
ADD . /opt/app

ENV NODE_ENV production
ENV EXPRESS_PORT 80

EXPOSE 3000
EXPOSE 8080
EXPOSE 5672
EXPOSE 15672
EXPOSE 27017

CMD ["nodejs", "/course-svc/service.js"]