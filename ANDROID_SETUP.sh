#!/bin/bash

echo "🚀 TFS Management - Android Setup Script"
echo "========================================"
echo ""

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js first."
    exit 1
fi

echo "✅ Node.js found: $(node --version)"
echo ""

# Step 1: Install Capacitor
echo "📦 Step 1: Installing Capacitor..."
npm install @capacitor/core @capacitor/cli @capacitor/android

echo ""
echo "✅ Capacitor installed successfully!"
echo ""

# Step 2: Build the web app
echo "🔨 Step 2: Building web app..."
npm run build

if [ $? -ne 0 ]; then
    echo "❌ Build failed. Please fix errors and try again."
    exit 1
fi

echo ""
echo "✅ Build completed successfully!"
echo ""

# Step 3: Add Android platform
echo "📱 Step 3: Adding Android platform..."
npx cap add android

if [ $? -ne 0 ]; then
    echo "⚠️ Android platform may already exist. Syncing instead..."
fi

echo ""
echo "✅ Android platform added!"
echo ""

# Step 4: Sync web code to Android
echo "🔄 Step 4: Syncing web code to Android..."
npx cap sync

echo ""
echo "✅ Sync completed!"
echo ""

# Step 5: Open in Android Studio
echo "🎉 Setup Complete!"
echo ""
echo "Next steps:"
echo "1. Open the Android project in Android Studio:"
echo "   npx cap open android"
echo ""
echo "2. In Android Studio:"
echo "   - Wait for Gradle sync to complete"
echo "   - Click the green 'Run' button"
echo "   - Select an emulator or connected device"
echo ""
echo "3. Your app will install and launch!"
echo ""

read -p "Would you like to open Android Studio now? (y/n) " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
    npx cap open android
fi

echo ""
echo "✅ Done! Happy coding! 🎉"
