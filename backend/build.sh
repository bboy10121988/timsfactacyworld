#!/usr/bin/env bash
# build.sh for Railway deployment

# Install dependencies
yarn install

# Build the application
yarn build

# Run database migrations (if needed)
# yarn medusa migrations run
