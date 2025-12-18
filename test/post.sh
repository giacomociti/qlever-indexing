#!/bin/bash

# Usage: ./post.sh file1 file2 file3 ...

SERVER_URL="http://localhost:3000/index"

# Build query string
query=""
for f in "$@"; do
  size=$(stat -c%s "$f")
  fname=$(basename "$f")
  query="${query}${query:+&}${fname}=${size}"
done

echo "Posting to ${SERVER_URL} with query: ${query}"

# Pipe concatenated file contents to curl
cat "$@" | curl -X POST "${SERVER_URL}?${query}" \
  -H "Content-Type: application/octet-stream" \
  --data-binary @-