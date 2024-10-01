read -a images <<< $(cat backend/pinklifeline/src/test/java/com/sadi/pinklifeline/integrationtests/AbstractBaseIntegrationTest.java | grep "DockerImageName.parse" | sed -n 's/.*DockerImageName\.parse("\([^"]*\)").*/\1/p' | xargs)
for image in "${images[@]}"
do
    docker pull $image
done