#!/bin/bash
bash ./init.sh

cd packages/server/
pnpm run build
cd ../../
cp ./packages/server/.env ./packages/server/dist/.env

cd packages/app/
pnpm run build
cd ../../

echo "Setup and build complete. You can now run the application using 'pnpm run:build' or 'pnpm run:nobuild'."


# ask for project root directory to upload those builds (format: user@host:/path or /local/path)
read -p "Enter the remote host and project root to upload builds (user@host:/path or /local/path): "
if [[ -n "$REPLY" ]]; then
  ROOT_DIR=$REPLY
  echo "Packaging builds into single archive..."
  archive="builds_dist.tar.gz"

  # include dist folders with their relative paths so extraction recreates packages/... structure
  tar -czf "$archive" packages/server/dist packages/app/dist

  echo "Uploading archive to $ROOT_DIR..."
  if [[ "$ROOT_DIR" == *":"* ]]; then
    HOST="${ROOT_DIR%%:*}"
    REMOTE_PATH="${ROOT_DIR#*:}"

    scp "$archive" "$HOST:$REMOTE_PATH/"

    echo "Extracting archive on remote host $HOST..."
    ssh "$HOST" "mkdir -p '$REMOTE_PATH/packages/server' '$REMOTE_PATH/packages/app' && tar -xzf '$REMOTE_PATH/$archive' -C '$REMOTE_PATH' && rm -f '$REMOTE_PATH/$archive'"
  else
    mkdir -p "$ROOT_DIR"
    mv "$archive" "$ROOT_DIR/"

    echo "Extracting archive on local filesystem..."
    tar -xzf "$ROOT_DIR/$archive" -C "$ROOT_DIR"
    rm -f "$ROOT_DIR/$archive"
  fi

  # cleanup local archive if still present
  rm -f "$archive"

  echo "Builds uploaded and extracted to $ROOT_DIR."
else
  echo "No directory provided. Skipping upload."
fi
