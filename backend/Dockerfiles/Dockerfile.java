# Java Compilation and Execution Environment  
FROM eclipse-temurin:21-jdk-alpine

# Create non-root user for security
RUN addgroup -S coderunner && adduser -S coderunner -G coderunner

# Set working directory
WORKDIR /code

# Make filesystem read-only except /tmp
RUN chmod -R 755 /code

# Switch to non-root user
USER coderunner

# Default command (will be overridden)
CMD ["sh", "-c", "javac Solution.java && java Solution"]
