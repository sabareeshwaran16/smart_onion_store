# ─── Stage 1: Build Application ──────────────────────────────────────────────
FROM maven:3.9.9-eclipse-temurin-21 AS build

WORKDIR /build

# Copy Maven configuration to leverage Docker layer caching
COPY pom.xml .
COPY .mvn .mvn

# Pre-fetch project dependencies offline (optional caching optimization)
RUN mvn dependency:go-offline -B || true

# Copy application source code
COPY src ./src

# Package production Spring Boot executable JAR (skipping tests for fast build)
RUN mvn clean package -DskipTests -B

# ─── Stage 2: Production Runtime ──────────────────────────────────────────────
FROM eclipse-temurin:21-jre-jammy

# Create non-root system group and user for security
RUN groupadd -r appgroup && useradd -r -g appgroup appuser

WORKDIR /app

# Copy executable jar from builder stage
COPY --from=build /build/target/vengai-backend-*.jar /app/app.jar

# Grant ownership to appuser (allows SQLite to create/update vengai.db in /app)
RUN chown -R appuser:appgroup /app

# Switch to non-root user
USER appuser

# Configure environment defaults (Render dynamically overrides PORT)
ENV PORT=8080
ENV JAVA_OPTS="-XX:+UseContainerSupport -XX:MaxRAMPercentage=75.0 -Djava.security.egd=file:/dev/./urandom"

# Expose default port
EXPOSE 8080

# Production startup command respecting Render's assigned $PORT
ENTRYPOINT ["sh", "-c", "exec java $JAVA_OPTS -jar /app/app.jar --server.port=${PORT:-8080}"]
