# MSAProject1

This project is meant to work in docker daemon. Make sure you compile and run the program under docker environment!

Usage:
	Type ./build-system.sh to build all docker services and run them in separate containers. Visit (docker-machine ip):41000 for router, 42000 for course service, and 43000 for student service.

Docker notes:
	Start a container: docker run -d -p port:port image
	Stop a container: docker stop container_name
	Find ip: docker-machine ip machine_name
	Restart machine: docker-machine restart machine_name
	Configure machine after restart: eval $(docker-machine env machine_name)
	Example router service running in docker:
		docker build -t router .
		docker run -d -p 40000:3000 router
		Find the IP of your docker machine. Go to your browser, type in (docker machine IP):40000. You should be able to see "Hello world!" in your browser.