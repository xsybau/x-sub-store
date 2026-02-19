# syntax=docker/dockerfile:1.7

# Stage 1: Build
FROM oven/bun:1-alpine as build

WORKDIR /app

# Copy package file first so dependency install can stay cached.
COPY package.json ./

# Install dependencies with BuildKit cache.
RUN --mount=type=cache,target=/root/.bun/install/cache bun install

# Copy source
COPY . .

# Build Nuxt
RUN bun run build

# Stage 2: Runtime
FROM oven/bun:1-alpine

WORKDIR /app

# Copy built artifacts
COPY --from=build /app/.output ./.output
# Copy scripts and source for scripts to work (they import from server/)
COPY --from=build /app/scripts ./scripts
COPY --from=build /app/server ./server
# Copy dependencies for scripts
COPY --from=build /app/node_modules ./node_modules
COPY --from=build /app/package.json ./package.json

# Environment variables
ENV NITRO_PORT=3000
ENV NITRO_HOST=0.0.0.0
ENV NODE_ENV=production

EXPOSE 3000

# Start server
CMD ["bun", ".output/server/index.mjs"]
