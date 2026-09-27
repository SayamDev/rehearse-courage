#!/bin/sh
# Builds for Cloudflare without local-only settings. The adapter bundles any .env files into
# the worker, so .env.local is moved aside during the build. Keys online come from `wrangler secret put`.
# Usage: scripts/cf.sh deploy | preview | build-only
set -e
cd "$(dirname "$0")/.."
if [ -f .env.local ]; then
  mv .env.local .env.local.deploying
  trap 'mv .env.local.deploying .env.local' EXIT INT TERM
fi
npx opennextjs-cloudflare build
if [ "${1:-deploy}" != "build-only" ]; then npx opennextjs-cloudflare "${1:-deploy}"; fi
