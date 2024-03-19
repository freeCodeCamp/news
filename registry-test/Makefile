ifeq ($(TAGNAME_CI),)
	LOCAL_TAGNAME := $(shell git rev-parse --short HEAD)-$(shell date +%Y%m%d)-$(shell date +%H%M)
else
	LOCAL_TAGNAME := $(TAGNAME_CI)
endif

DOCKER_REPO := registry.digitalocean.com/${REGISTRY_NAME}/ops/test

.PHONY: build
build:
	docker build \
	--build-arg BUILD_ID=$(LOCAL_TAGNAME) \
	--platform linux/amd64 \
	--tag $(DOCKER_REPO):${LOCAL_TAGNAME} \
	--tag $(DOCKER_REPO):latest \
	.

.PHONY: push
push:
	docker push --all-tags $(DOCKER_REPO)
