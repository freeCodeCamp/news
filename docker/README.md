## Notes

This directory contains the Dockerfile to build out the image for the publications from the eleventy output. Additionally, there are other files that can be used for testing and experimentation.

**What's in this directory:**

- The [`ghost`](./ghost) directory contains the docker-compose file and seed content for standing up a set of local Ghost instances. This is useful for local development and testing against a cluster of Ghost instances.
- The [`test/dev`](./test/dev) directory contains the docker-compose file to stand up a prod-like news instances that builds the eleventy output and serves it up. The build depends on the configurations set in the `.env` file in the root of the project.
- The [`test/prd`](./test/prd) directory contains the docker-compose file to stand up a prod-like news instances that pulls down the image from the registry and serves it up. This should be the closest to the production environment.

## Instructions

### For the `ghost` directory

- `docker compose up -d` to start the ghost instances.

### For the `dev` directory

- Ensure the `.env` file is set up correctly. You have to build the `Italian` version of the site.
- Run `docker-compose up -d` to stand up the prod-like development instance of `/italian/news`.
- Visit `http://localhost/italian/news` to see the site.

### For the `prd` directory

- Build and push the image to the registry, using the pipeline.
- Authenticate to the docker registry (`doctl registry login`)
- Pull the image from the registry (`docker pull registry.digitalocean.com/registry-name/image-name:latest`)
- Update the image in the `.env` file in the `prd` directory - this file is unrelated to the root env config, and is used for providing keys to the docker setup. You can copy the sample .env file (`cp .env.sample .env`)
- Run `docker-compose up -d` to stand up the prod-like instance of `/news`.
- Visit `http://localhost/news` to see the site.
