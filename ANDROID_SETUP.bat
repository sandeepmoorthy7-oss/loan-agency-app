@echo off
echo 🚀 TFS Management - Android Setup Script
echo ========================================
echo.

REM Check if Node.js is installed
where node >nul 2>nul
if %errorlevel% neq 0 (
    echo ❌ Node.js is not installed. Please install Node.js first.
    pause
    exit /b 1
)

echo ✅ Node.js found
node --version
echo.

REM Step 1: Install Capacitor
echo 📦 Step 1: Installing Capacitor...
call npm install @capacitor/core @capacitor/cli @capacitor/android

echo.
echo ✅ Capacitor installed successfully!
echo.

REM Step 2: Build the web app
echo 🔨 Step 2: Building web app...
call npm run build

if %errorlevel% neq 0 (
    echo ❌ Build failed. Please fix errors and try again.
    pause
    exit /b 1
)

echo.
echo ✅ Build completed successfully!
echo.

REM Step 3: Add Android platform
echo 📱 Step 3: Adding Android platform...
call npx cap add android

echo.
echo ✅ Android platform added!
echo.

REM Step 4: Sync web code to Android
echo 🔄 Step 4: Syncing web code to Android...
call npx cap sync

echo.
echo ✅ Sync completed!
echo.

REM Step 5: Instructions
echo 🎉 Setup Complete!
echo.
echo Next steps:
echo 1. Open the Android project in Android Studio:
echo    npx cap open android
echo.
echo 2. In Android Studio:
echo    - Wait for Gradle sync to complete
echo    - Click the green 'Run' button
echo    - Select an emulator or connected device
echo.
echo 3. Your app will install and launch!
echo.

set /p OPENIDE="Would you like to open Android Studio now? (Y/N): "
if /i "%OPENIDE%"=="Y" (
    call npx cap open android
)

echo.
echo ✅ Done! Happy coding! 🎉
pause
