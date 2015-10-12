#!/bin/bash
cd router
docker build -t router .
cd ../course-svc
docker build -t course-svc .
cd ../student-svc
docker build -t student-svc .