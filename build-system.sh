#!/bin/bash
cd router/src
npm install
cd ../../course-svc
docker build -t course-svc .
cd ../student-svc
docker build -t student-svc .