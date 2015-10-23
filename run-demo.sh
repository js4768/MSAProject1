#!/bin/bash
cd course-svc
docker-compose -p course up -d
cd ../student-svc
docker-compose -p student_1 up -d