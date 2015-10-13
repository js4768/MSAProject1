# MSAProject1

This project is meant to work in docker daemon. Make sure you compile and run the program under docker environment!

Usage:
	Type ./build-system.sh to build all docker services.

Docker notes:
	Start a container: docker run -d -p port:port image
	Stop a container: docker stop container_name
	Find ip: docker-machine ip machine_name
	Restart machine: docker-machine restart machine_name
	Configure machine after restart: eval $(docker-machine env machine_name)