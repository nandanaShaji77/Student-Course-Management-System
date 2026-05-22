# Stage 1: Build the application
FROM maven:3.8.8-eclipse-temurin-17-alpine AS build
WORKDIR /app

# Copy the pom.xml and dependency layers first to leverage Docker caching
COPY pom.xml .
RUN mvn dependency:go-offline -B

# Copy the source code and package the executable JAR
COPY src ./src
RUN mvn package -DskipTests -B

# Stage 2: Runtime image
FROM eclipse-temurin:17-jre-alpine
WORKDIR /app

# Copy the executable jar from the build stage
COPY --from=build /app/target/student-course-management-1.0.0.jar app.jar

# Expose the API server port
EXPOSE 8080

# Environment configurations
ENV SPRING_PROFILES_ACTIVE=prod

# Run the Spring Boot application
ENTRYPOINT ["java", "-XX:+UseG1GC", "-jar", "app.jar"]
