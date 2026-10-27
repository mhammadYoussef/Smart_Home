#!/bin/zsh
cd -- "${0:A:h}"
if ! command -v node >/dev/null 2>&1; then
  echo 'Install Node.js LTS from https://nodejs.org/en/download, then try again.'
  read '?Press Enter to close.'
  exit 1
fi
node server.mjs
