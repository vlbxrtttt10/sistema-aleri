# --- Etapa 1: construir el .jar con Maven y Java 21 ---
FROM maven:3.9-eclipse-temurin-21 AS build
WORKDIR /app
# Primero solo el pom para aprovechar la cache de dependencias
COPY pom.xml .
RUN mvn -q dependency:go-offline
# Ahora el codigo y empaquetar (sin correr tests para acelerar el deploy)
COPY src ./src
RUN mvn -q clean package -DskipTests

# --- Etapa 2: imagen liviana solo para ejecutar ---
FROM eclipse-temurin:21-jre
WORKDIR /app
COPY --from=build /app/target/*.jar app.jar
# Render inyecta la variable PORT; la app ya la lee desde application.yml
EXPOSE 8080
ENTRYPOINT ["java", "-jar", "app.jar"]
