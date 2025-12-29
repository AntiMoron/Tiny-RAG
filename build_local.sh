#!/bin/bash
bash ./init.sh

cd packages/server/
pnpm run build
cd ../../

cd packages/app/
pnpm run build
cd ../../

echo "Setup and build complete. You can now run the application using 'pnpm run:build' or 'pnpm run:nobuild'."

# ask for project root directory to upload those builds
read -p "Enter the project root directory to upload builds:"
if [[ -n "$REPLY" ]]; then
  ROOT_DIR=$REPLY
  echo "Uploading builds to $ROOT_DIR..."
  scp -r packages/server/dist/* "$ROOT_DIR/server/"
  scp -r packages/app/dist/* "$ROOT_DIR/app/"
  echo "Builds uploaded."
else
  echo "No directory provided. Skipping upload."
fi
