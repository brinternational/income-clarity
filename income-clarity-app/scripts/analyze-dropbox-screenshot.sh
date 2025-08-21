#!/bin/bash

# 🖼️ DROPBOX SCREENSHOT ANALYZER WITH FULL AUTOMATION
# Downloads, analyzes, and AUTO-DELETES Dropbox screenshots using API

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
TEMP_DIR="/tmp/dropbox_screenshots"
PROCESSED_DIR="/tmp/dropbox_processed"
TIMESTAMP=$(date +%Y%m%d_%H%M%S)

echo "🔍 DROPBOX SCREENSHOT ANALYZER v3.0 (FULL AUTO)"
echo "=================================================="

# Step 1: Create directories
mkdir -p $TEMP_DIR
mkdir -p $PROCESSED_DIR
cd $TEMP_DIR

# Step 2: Clean any previous downloads
rm -f *.png *.jpg *.jpeg *.gif 2>/dev/null

# Step 3: List files in Dropbox using API
echo "📁 Checking Dropbox folder..."
python3 "$SCRIPT_DIR/dropbox-api.py" list > dropbox_files.txt

if [ $? -ne 0 ]; then
    echo "❌ Failed to access Dropbox API"
    echo "🔧 Check credentials in .env.dropbox"
    exit 1
fi

# Step 4: Check if there are any image files
IMAGE_FILES=$(grep -E "\.(png|jpg|jpeg|gif)" dropbox_files.txt | wc -l)

if [ "$IMAGE_FILES" -eq 0 ]; then
    echo "✅ Dropbox folder is empty - ready for new screenshots!"
    rm -f dropbox_files.txt
    exit 0
fi

echo "📥 Found $IMAGE_FILES image files to process"

# Step 5: Download each image file using API
echo "📦 Downloading screenshots..."
DOWNLOADED_FILES=()

while IFS= read -r line; do
    if echo "$line" | grep -qE "\.(png|jpg|jpeg|gif)"; then
        # Extract filename from the line (assuming format: "  📄 filename.png (size bytes)")
        FILENAME=$(echo "$line" | sed -E 's/.*📄 ([^ ]+) .*/\1/')
        
        if [ ! -z "$FILENAME" ]; then
            echo "  📥 Downloading: $FILENAME"
            python3 "$SCRIPT_DIR/dropbox-api.py" download "/$FILENAME" "$TEMP_DIR/$FILENAME"
            
            if [ $? -eq 0 ]; then
                DOWNLOADED_FILES+=("$FILENAME")
                # Move to processed folder
                mv "$TEMP_DIR/$FILENAME" "$PROCESSED_DIR/$FILENAME" 2>/dev/null
                echo "  📁 Moved to processed: $FILENAME"
            fi
        fi
    fi
done < dropbox_files.txt

# Step 6: Delete files from Dropbox after successful download
echo ""
echo "🗑️  Auto-deleting from Dropbox..."
for FILENAME in "${DOWNLOADED_FILES[@]}"; do
    echo "  🗑️  Deleting: $FILENAME"
    python3 "$SCRIPT_DIR/dropbox-api.py" delete "/$FILENAME"
done

# Step 7: Summary
echo ""
echo "📋 Files ready for analysis:"
ls -la $PROCESSED_DIR/*.png $PROCESSED_DIR/*.jpg $PROCESSED_DIR/*.jpeg 2>/dev/null | tail -10 || echo "None found"

# Step 8: Cleanup
rm -f dropbox_files.txt

# Step 9: Status report
echo ""
echo "🤖 FULL AUTOMATION COMPLETE:"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "📥 Downloaded: ${#DOWNLOADED_FILES[@]} files"
echo "🗑️  Deleted from Dropbox: ${#DOWNLOADED_FILES[@]} files"
echo "📁 Processed folder: $PROCESSED_DIR"
echo "✅ Dropbox folder: NOW EMPTY"
echo ""
echo "🎯 READY FOR ANALYSIS: Use Read tool on files in $PROCESSED_DIR"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

# Step 10: Auto-cleanup old processed files (older than 24 hours)
find $PROCESSED_DIR -name "*.png" -o -name "*.jpg" -mtime +1 -delete 2>/dev/null
echo "🧹 Cleaned up processed files older than 24 hours"