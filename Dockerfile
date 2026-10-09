FROM denoland/deno:latest

WORKDIR /app

# Cache dependencies defined in deno.json
COPY deno.json ./
RUN deno install

# Copy source code and test files
COPY . .

# Pre-cache entrypoint
RUN deno cache src/main.ts

ENTRYPOINT ["deno", "run", "--allow-net", "--allow-write", "--allow-read", "src/main.ts"]
