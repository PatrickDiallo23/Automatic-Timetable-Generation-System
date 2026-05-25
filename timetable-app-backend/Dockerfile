# ─────────────────────────────────────────────────────────
# Stage 1: Dependency cache (maximise layer-cache hits)
# ─────────────────────────────────────────────────────────
FROM eclipse-temurin:21-jdk-alpine AS deps
WORKDIR /app

# Copy Maven wrapper & POM first so dependency download is cached
# independently of source changes
COPY mvnw ./
COPY .mvn .mvn
COPY pom.xml .

# Ensure mvnw is executable (can lose permissions in some COPY flows)
RUN chmod +x mvnw

# Download all dependencies offline (cached layer)
RUN ./mvnw dependency:go-offline -B --no-transfer-progress && \
    ./mvnw dependency:resolve-plugins -B --no-transfer-progress && \
    ./mvnw dependency:resolve -B --no-transfer-progress

# ─────────────────────────────────────────────────────────
# Stage 2: Build
# ─────────────────────────────────────────────────────────
FROM deps AS build
WORKDIR /app

# Copy source code (invalidates cache only when src changes)
COPY src src

# Build without running tests (tests run in CI separately)
RUN ./mvnw package -DskipTests -B --no-transfer-progress

# ─────────────────────────────────────────────────────────
# Stage 3: Production runtime (minimal JRE image)
# ─────────────────────────────────────────────────────────
FROM eclipse-temurin:21-jre-alpine AS production
WORKDIR /app

# Create non-root user with fixed UID/GID for reproducibility
RUN addgroup -g 1001 -S appgroup && \
    adduser -u 1001 -S appuser -G appgroup

# Copy only the built JAR from build stage
COPY --from=build --chown=appuser:appgroup /app/target/*.jar app.jar

# Run as non-root
USER 1001

# Expose backend port
EXPOSE 8200

# Health check using Spring Actuator
HEALTHCHECK --interval=30s --timeout=10s --start-period=90s --retries=5 \
  CMD wget -qO- http://localhost:8200/actuator/health || exit 1

# JVM flags tuned for Timefold solver (CPU-intensive, container-aware):
#   -XX:+UseContainerSupport   → respect cgroup memory limits
#   -XX:MaxRAMPercentage=75.0  → use 75% of allocated container RAM
#   -XX:+UseG1GC               → G1GC for low-pause + large heap
#   -XX:ParallelGCThreads      → limit GC threads to container CPU share
#   -Djava.security.egd        → faster entropy (important for JWT)
ENTRYPOINT ["sh", "-c", \
  "java \
    -XX:+UseContainerSupport \
    -XX:MaxRAMPercentage=75.0 \
    -XX:+UseG1GC \
    -XX:ParallelGCThreads=4 \
    -Djava.security.egd=file:/dev/./urandom \
    ${JAVA_OPTS} \
    -jar app.jar"]
