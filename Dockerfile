# Stage 1: Build
FROM oven/bun:1-alpine as build

WORKDIR /app

# Copy package files
COPY package.json bun.lock ./

# Install dependencies
RUN bun install --frozen-lockfile

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
