# ---------- Build stage ----------
FROM eclipse-temurin:17-jdk AS build
WORKDIR /app

# Copy Maven wrapper + pom first so dependencies are cached between builds
COPY mvnw ./
COPY .mvn .mvn
COPY pom.xml ./
RUN chmod +x mvnw && ./mvnw dependency:go-offline -B

# Copy source and build the boot jar (skip tests in image build)
COPY src src
RUN ./mvnw package -DskipTests -B

# ---------- Runtime stage ----------
FROM eclipse-temurin:17-jre AS runtime
WORKDIR /app

# Run as a non-root user
RUN useradd --system --create-home spring
USER spring

COPY --from=build /app/target/*.jar app.jar

EXPOSE 8080

ENTRYPOINT ["java", "-jar", "app.jar"]
