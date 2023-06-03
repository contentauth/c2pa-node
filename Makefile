build-aws-docker:
	docker build -t c2pa-node-aws -f ./etc/docker/amazon/Dockerfile .

build-aws:
	docker run -it --rm -v `pwd`:/build:z c2pa-node-aws