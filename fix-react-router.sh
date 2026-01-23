#!/bin/bash

# Fix react-router-dom imports to react-router
find /tmp/sandbox -type f -name "*.tsx" -o -name "*.ts" | while read file; do
  if [ -f "$file" ]; then
    sed -i "s/from 'react-router-dom'/from 'react-router'/g" "$file"
    sed -i 's/from "react-router-dom"/from "react-router"/g' "$file"
  fi
done

echo "✅ Fixed all react-router-dom imports"
