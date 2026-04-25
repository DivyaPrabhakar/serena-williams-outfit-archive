#!/bin/bash
# Runs during Netlify build.
# Only ADMIN_PASSWORD is injected into the HTML.
# All Supabase credentials stay server-side in the Netlify function
# and are never written to any file.

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

echo "Injecting admin password into build..."
sed -i "s|%%ADMIN_PASSWORD%%|${ADMIN_PASSWORD}|g" index.html
echo "Done. Supabase credentials stay server-side only."
