#!/bin/bash
if [[ pnpm -v ]]; then
  echo "pnpm is already installed."
else
  echo "Installing pnpm..."
  npm install -g pnpm
fi

echo "Installing project dependencies with pnpm..."
pnpm install
echo "Dependencies installed."

cd packages/server/
pnpm install
pnpm rebuild
cd ../../

cd packages/app/
pnpm install
cd ../../

pnpm run init

echo "Setup complete."
