#!/bin/bash
cd router/src
npm install
cd ../../course-svc
docker build -t course-svc .
cd ../../student-svc/src
docker build -t student-svc .