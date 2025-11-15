#!/bin/bash

# Script to copy assets from Reluma Landing Page folder to public directory
# Usage: ./copy-assets.sh

set -e

echo "🎨 ReLuma Asset Copy Script"
echo "============================"
echo ""

# Define source and destination paths
SOURCE_DIR="../Eonlife_Reluma/Reluma Landing Page"
DEST_DIR="public/assets/option1"

# Check if source directory exists
if [ ! -d "$SOURCE_DIR" ]; then
    echo "❌ Error: Source directory not found at: $SOURCE_DIR"
    echo "Please make sure the Reluma Landing Page folder exists"
    exit 1
fi

echo "📁 Creating directory structure..."
mkdir -p "$DEST_DIR"/{desktop,mobile,icons}

echo "✅ Directories created"
echo ""

echo "📋 Copying Desktop Assets..."
if [ -d "$SOURCE_DIR/Option_1/Export/Desktop" ]; then
    cp -r "$SOURCE_DIR/Option_1/Export/Desktop/"* "$DEST_DIR/desktop/" 2>/dev/null || echo "⚠️  Some desktop files may not exist"
    echo "✅ Desktop assets copied"
else
    echo "⚠️  Desktop folder not found"
fi

echo ""
echo "📱 Copying Mobile Assets..."
if [ -d "$SOURCE_DIR/Option_1/Export/Mobile" ]; then
    cp -r "$SOURCE_DIR/Option_1/Export/Mobile/"* "$DEST_DIR/mobile/" 2>/dev/null || echo "⚠️  Some mobile files may not exist"
    echo "✅ Mobile assets copied"
else
    echo "⚠️  Mobile folder not found"
fi

echo ""
echo "🎯 Copying Logo..."
if [ -f "$SOURCE_DIR/Option_1/Export/Desktop/Navagation/ReLuma_Logo.png" ]; then
    cp "$SOURCE_DIR/Option_1/Export/Desktop/Navagation/ReLuma_Logo.png" "$DEST_DIR/logo.png"
    echo "✅ Logo copied"
else
    echo "⚠️  Logo not found"
fi

echo ""
echo "🔗 Copying Social Icons..."
if [ -d "$SOURCE_DIR/Option_1/Export/Desktop/Navagation" ]; then
    cp "$SOURCE_DIR/Option_1/Export/Desktop/Navagation/"*.svg "$DEST_DIR/icons/" 2>/dev/null || echo "⚠️  Some icon files may not exist"
    echo "✅ Icons copied"
else
    echo "⚠️  Navigation folder not found"
fi

echo ""
echo "🎉 Asset copy complete!"
echo ""
echo "📊 Asset Summary:"
echo "----------------"
echo "Desktop assets: $(find $DEST_DIR/desktop -type f 2>/dev/null | wc -l | tr -d ' ') files"
echo "Mobile assets:  $(find $DEST_DIR/mobile -type f 2>/dev/null | wc -l | tr -d ' ') files"
echo "Icons:          $(find $DEST_DIR/icons -type f 2>/dev/null | wc -l | tr -d ' ') files"
echo ""
echo "✨ You're ready to run: npm run dev"
