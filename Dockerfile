# --- Stage 1: build the frontend ---
FROM node:26-alpine3.23 AS frontend
WORKDIR /app/frontend
COPY frontend/package.json frontend/package-lock.json ./
RUN npm ci
COPY frontend/ ./
RUN npm run build

# --- Stage 2: build the Spring Boot backend ---
FROM maven:3.10.0-amazoncorretto-25 AS backend
WORKDIR /app
COPY pom.xml ./
RUN mvn -q dependency:go-offline
COPY src/ src/
COPY --from=frontend /app/frontend/dist ./src/main/resources/static
RUN mvn -q -DskipTests package

# --- Stage 3: slim runtime ---
FROM amazoncorretto:25-alpine3.24
WORKDIR /app
COPY --from=backend /app/target/fresszettel-0.0.1-SNAPSHOT.jar app.jar
RUN mkdir -p /app/db
EXPOSE 8080
VOLUME /app/db
ENTRYPOINT ["java", "-jar", "app.jar"]
