# ---- Build stage: compile and package the Spring Boot jar ----
FROM eclipse-temurin:21-jdk AS build
WORKDIR /app

# Cache dependencies first for faster rebuilds
COPY .mvn/ .mvn/
COPY mvnw pom.xml ./
RUN chmod +x mvnw && ./mvnw -q dependency:go-offline

# Build the application
COPY src/ src/
RUN ./mvnw -q -DskipTests clean package

# ---- Run stage: lightweight JRE ----
FROM eclipse-temurin:21-jre AS runtime
WORKDIR /app

# Run as non-root for safety
RUN useradd -r -u 1001 appuser
COPY --from=build /app/target/healthcare-platform-1.0.0.jar app.jar
USER appuser

# Cloud platforms inject $PORT; default to 8080 locally.
ENV PORT=8080
EXPOSE 8080
ENTRYPOINT ["sh", "-c", "java -jar app.jar"]
