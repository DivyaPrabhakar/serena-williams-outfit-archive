#!/bin/bash
# This script runs during Netlify's build step.
# It replaces the %%ADMIN_PASSWORD%% placeholder in index.html
# with the actual password from the ADMIN_PASSWORD environment variable,
# which you set privately in the Netlify dashboard.
# The password NEVER lives in your code or git repo.

set -e

if [ -z "$ADMIN_PASSWORD" ]; then
  echo "ERROR: ADMIN_PASSWORD environment variable is not set."
  echo "Set it in your Netlify site settings under Environment Variables."
  exit 1
fi

echo "Injecting admin password into build..."
sed -i "s|%%ADMIN_PASSWORD%%|${ADMIN_PASSWORD}|g" index.html
echo "Done. Build ready."
