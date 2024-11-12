#!/bin/bash

# Get the list of services from docker-compose.yml
# services=$(docker compose config --services)

# # Loop through each service
# for service in $services; do
#     # Get the image for the service
#     image=$(docker compose config --images $service)
    
#     # Check if the service has a build context (locally built)
#     if ! docker compose config | grep -A 5 "^  $service:" | grep -q "build:"; then
#         echo "$image"
#     fi
# done
cat backend/pinklifeline/src/test/java/com/sadi/pinklifeline/integrationtests/AbstractBaseIntegrationTest.java | grep "DockerImageName.parse" | sed -n 's/.*DockerImageName\.parse("\([^"]*\)").*/\1/p'