#!/bin/bash
cd router
docker build -t router .
cd ../course-svc
docker build -t course-svc .
cd ../student-svc
docker build -t student-svc .
docker run -d -p 41000:3000 router
docker run -d -p 42000:3000 course-svc
docker run -d -p 43000:3000 course-svc