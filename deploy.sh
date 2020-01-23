#!/usr/bin/env sh

# abort on errors
set -e

# build
npm run build

# navigate into the build output directory
cd public

git init
git add -A
git commit -m 'deploy'

git push -f git@github.com:alice-si/ida.git master:gh-pages

cd -
