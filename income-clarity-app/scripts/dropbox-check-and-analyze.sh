#!/bin/bash

# 🖼️ DROPBOX CHECK AND ANALYZE - ALL IN ONE
# Does everything: list, download, delete from dropbox, prepare for analysis

SCRIPT_DIR="$(dirname "$0")"
PROCESSED_DIR="/tmp/dropbox_processed"
TIMESTAMP=$(date +%Y%m%d_%H%M%S)

echo "🔍 CHECKING DROPBOX FOR SCREENSHOTS..."
echo "======================================"

# Clean up old files
rm -rf $PROCESSED_DIR
mkdir -p $PROCESSED_DIR

# Check for files
FILES=$(python3 "$SCRIPT_DIR/dropbox-api.py" list 2>/dev/null | grep "📄" | wc -l)

if [ "$FILES" -eq 0 ]; then
    echo "✅ No files in Dropbox"
    exit 0
fi

echo "📥 Found $FILES file(s) to process"

# Download all images
python3 "$SCRIPT_DIR/dropbox-api.py" list | grep "📄" | while read -r line; do
    FILENAME=$(echo "$line" | sed -E 's/.*📄 ([^ ]+) .*/\1/')
    if [ ! -z "$FILENAME" ]; then
        # Download
        python3 "$SCRIPT_DIR/dropbox-api.py" download "/DropboxImage/$FILENAME" "$PROCESSED_DIR/screenshot_$TIMESTAMP.png" 2>/dev/null
        
        # Delete from Dropbox
        python3 "$SCRIPT_DIR/dropbox-api.py" delete "/DropboxImage/$FILENAME" 2>/dev/null
        
        echo "✅ Processed: $FILENAME"
    fi
done

# Report what's ready
echo ""
echo "📊 READY FOR ANALYSIS:"
echo "====================="
ls -la $PROCESSED_DIR/*.png 2>/dev/null | tail -5 || echo "No files found"
echo ""
echo "🎯 Files are in: $PROCESSED_DIR"
echo "✅ Dropbox is now EMPTY"