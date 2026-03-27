FROM eclipse-temurin:21-jdk-jammy AS build

COPY mvnw pom.xml /app/
ADD .mvn /app/.mvn

WORKDIR /app

RUN ./mvnw package || echo "Dependencies downloaded."

COPY . /app/
RUN ./mvnw package

FROM eclipse-temurin:21-jdk-alpine AS production

ENV TZ=America/Lima

WORKDIR /app
COPY --from=build /app/target/sce-batch-pr-0.0.1-SNAPSHOT.jar /app/backend.jar

EXPOSE 80

CMD ["java", "-Dspring.profiles.active=production", "-jar", "backend.jar"]