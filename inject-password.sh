#!/bin/bash
# Runs during Netlify build.
# Reads environment variables set privately in the Netlify dashboard
# and injects them into index.html, replacing placeholders.
# None of these values ever appear in the git repo or source code.

set -e

check_var() {
  if [ -z "${!1}" ]; then
    echo "ERROR: $1 environment variable is not set."
    echo "Set it in Netlify: Site configuration → Environment variables"
    exit 1
  fi
}

check_var ADMIN_PASSWORD
check_var SUPABASE_URL
check_var SUPABASE_KEY
check_var SUPABASE_ADMIN_TOKEN

echo "Injecting environment variables into build..."

sed -i "s|%%ADMIN_PASSWORD%%|${ADMIN_PASSWORD}|g" index.html
sed -i "s|%%SUPABASE_URL%%|${SUPABASE_URL}|g" index.html
sed -i "s|%%SUPABASE_KEY%%|${SUPABASE_KEY}|g" index.html
sed -i "s|%%SUPABASE_ADMIN_TOKEN%%|${SUPABASE_ADMIN_TOKEN}|g" index.html

echo "Done. All variables injected."
