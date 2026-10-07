# syntax=docker/dockerfile:1

FROM node:26-alpine3.23 AS frontend
WORKDIR /app/frontend
COPY frontend/package.json frontend/package-lock.json ./
RUN --mount=type=cache,target=/root/.npm npm ci
COPY frontend/ ./
RUN npm run build


FROM vegardit/graalvm-maven:25.0.2 AS graalvm-builder
WORKDIR /app
COPY pom.xml ./
RUN --mount=type=cache,target=/root/.m2 mvn -B dependency:go-offline
COPY src ./src
RUN mkdir -p /app/db
COPY --from=frontend /app/frontend/dist ./src/main/resources/static
RUN --mount=type=cache,target=/root/.m2 mvn -B clean package native:compile

FROM debian:trixie-slim
RUN apt-get update && apt-get install -y --no-install-recommends zlib1g && rm -rf /var/lib/apt/lists/*
WORKDIR /app
RUN mkdir -p /app/db
COPY --from=graalvm-builder /app/target/fresszettel .
CMD ["./fresszettel"]
