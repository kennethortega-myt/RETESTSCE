# Etapa de construcci�n
FROM eclipse-temurin:21-jdk-jammy AS build

# Copiar archivos necesarios
COPY mvnw pom.xml /app/
ADD .mvn /app/.mvn

# Establecer el directorio de trabajo
WORKDIR /app

# Conceder permisos de ejecuci�n a mvnw
RUN chmod +x ./mvnw

# Instalar dependencias y empaquetar la aplicaci�n
RUN ./mvnw dependency:go-offline
COPY . /app/
RUN ./mvnw package

# Etapa de producci�n
FROM eclipse-temurin:21-jdk-alpine AS production

ENV TZ=America/Lima

COPY fonts/ /usr/share/fonts/truetype/arial
#COPY instaladores/orc_front.zip /data
#COPY instaladores/setup-sce-scanner-2.5.exe.zip /data

RUN apk add --no-cache postgresql17-client

RUN fc-cache -f -v

# Establecer el directorio de trabajo
WORKDIR /app

# Copiar el archivo jar construido desde la etapa de construcci�n
COPY --from=build /app/target/sce-backend-0.0.1-SNAPSHOT.jar /app/backend.jar

# Exponer el puerto
EXPOSE 80

# Comando para ejecutar la aplicaci�n
CMD ["java", "-Dspring.profiles.active=production", "-jar", "backend.jar"]
