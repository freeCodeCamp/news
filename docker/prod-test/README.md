## Instructions

- Build and push the image to the registry, using the pipeline.
- Authenticate to the docker registry (`doctl registry login`)
- Pull the image from the registry (`docker pull registry.digitalocean.com/registry-name/image-name:latest`)
- Update the image in the .env file, you can copy the sample .env file (`cp .env.sample .env`)
- Run the docker-compose file (`docker-compose up -d`)
