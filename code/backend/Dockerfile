# Multi-stage build for Spring Boot Backend

# ===================================================================
# Stage 1: Build stage using Temurin JDK 17
# ===================================================================
FROM eclipse-temurin:17-jdk-alpine AS builder

WORKDIR /app

# Copy Maven wrapper and POM first for better layer caching
COPY .mvn/ .mvn/
COPY mvnw pom.xml ./

# Normalize line endings for Windows checkouts and grant execute permission
RUN sed -i 's/\r$//' mvnw && chmod +x mvnw

# Download dependencies (cached layer)
RUN ./mvnw dependency:go-offline -B || true

# Copy source code and build application jar
COPY src/ ./src/
RUN ./mvnw clean package -DskipTests -B

# ===================================================================
# Stage 2: Minimal Runtime stage using Temurin JRE 17
# ===================================================================
FROM eclipse-temurin:17-jre-alpine AS runner

WORKDIR /app

# Create non-root user for security
RUN addgroup -S spring && adduser -S spring -G spring

# Copy compiled JAR from builder stage
COPY --from=builder /app/target/*.jar app.jar

# Change ownership to non-root user
RUN chown -R spring:spring /app

USER spring:spring

EXPOSE 8080

ENV JAVA_OPTS="-XX:+UseContainerSupport -XX:MaxRAMPercentage=75.0"

ENTRYPOINT ["sh", "-c", "java $JAVA_OPTS -jar app.jar"]
