# Build stage
FROM node:22-alpine AS builder

# Install dependencies for native modules
RUN apk add --no-cache libc6-compat

WORKDIR /app

# Copy package files, including .npmrc (routes the @bsv-blockchain-demos scope
# to GitHub Packages)
COPY package*.json .npmrc ./

# Install dependencies. The Float balance route ships as an enterprise-internal
# package on GitHub Packages, so npm needs a read:packages token. It is passed
# in as a BuildKit secret and written to a user-level .npmrc only for this step,
# so the token is never baked into an image layer.
RUN --mount=type=secret,id=github_token \
    printf '//npm.pkg.github.com/:_authToken=%s\n' "$(cat /run/secrets/github_token)" > /root/.npmrc && \
    npm ci --no-audit --no-fund && \
    rm -f /root/.npmrc

# Copy source code
COPY . .

# Build the application
RUN npm run build

# Production stage
FROM node:22-alpine AS runner

# Patch OS-level CVEs (e.g. zlib)
RUN apk upgrade --no-cache

WORKDIR /app

# Create non-root user
RUN addgroup -g 1001 -S nodejs
RUN adduser -S nextjs -u 1001

# Copy built application
COPY --from=builder /app/public ./public
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static

# Set permissions
RUN chown -R nextjs:nodejs /app

USER nextjs

# Expose port
EXPOSE 8080

# Set environment variables
ENV NODE_ENV=production
ENV HOSTNAME="0.0.0.0"
ENV PORT=8080

# Start the application
CMD ["node", "server.js"]
