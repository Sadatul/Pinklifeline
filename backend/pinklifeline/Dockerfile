FROM maven:3.9.7-eclipse-temurin-21-alpine AS build
WORKDIR /home/app

COPY ./pom.xml /home/app/pom.xml
COPY ./src/main/java/com/sadi/pinklifeline/PinklifelineApplication.java /home/app/src/main/java/com/sadi/pinklifeline/PinklifelineApplication.java

RUN mvn -f /home/app/pom.xml clean package

COPY . /home/app
RUN mvn -f /home/app/pom.xml clean package -DskipTests

FROM maven:3.9.7-eclipse-temurin-21-alpine
EXPOSE 8080
COPY --from=build /home/app/target/*.jar pinklifeline.jar
ENTRYPOINT ["sh", "-c", "java -jar /pinklifeline.jar"]