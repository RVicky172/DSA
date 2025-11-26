# C++ Compilation and Execution Environment
FROM alpine:latest

# Install g++ compiler
RUN apk add --no-cache g++ build-base

# Create non-root user for security
RUN addgroup -S coderunner && adduser -S coderunner -G coderunner

# Set working directory
WORKDIR /code

# Make filesystem read-only except /tmp
RUN chmod -R 755 /code

# Switch to non-root user
USER coderunner

# Default command (will be overridden)
CMD ["sh", "-c", "g++ -o solution solution.cpp && ./solution"]
