FROM eclipse-temurin:21-jdk-jammy AS build

COPY mvnw pom.xml /app/
ADD .mvn /app/.mvn

WORKDIR /app

RUN ./mvnw package || echo "Packages downloaded"

COPY . /app/
RUN ./mvnw package

FROM eclipse-temurin:21-jdk-alpine AS production

ENV TZ=America/Lima

COPY fonts/ /usr/share/fonts/truetype/arial

# se agrega el cliente de pg para hacer los back y restore validocon eclipse-temurin 17
RUN apk add --no-cache postgresql17-client fontconfig

RUN fc-cache -f -v

WORKDIR /app
COPY --from=build /app/target/sce-orc-backend-0.0.1-SNAPSHOT.jar /app/backend.jar

EXPOSE 80
CMD ["java", "-Dspring.profiles.active=production", "-jar", "backend.jar"]