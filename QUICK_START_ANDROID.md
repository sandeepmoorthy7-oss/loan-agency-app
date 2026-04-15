# 🚀 Quick Start: Deploy to Android (5 Minutes)

The **fastest way** to get your TFS Management app on Android.

---

## 🎯 **Choose Your Path:**

### **Path A: Automatic Setup (Recommended)**

#### **Windows:**
```bash
# Double-click or run:
ANDROID_SETUP.bat
```

#### **Mac/Linux:**
```bash
# Make executable and run:
chmod +x ANDROID_SETUP.sh
./ANDROID_SETUP.sh
```

This script will:
1. ✅ Install Capacitor
2. ✅ Build your web app
3. ✅ Add Android platform
4. ✅ Sync files
5. ✅ Open Android Studio

---

### **Path B: Manual Setup (3 Commands)**

```bash
# 1. Install Capacitor
npm install @capacitor/core @capacitor/cli @capacitor/android

# 2. Build and add Android
npm run build && npx cap add android

# 3. Open in Android Studio
npx cap open android
```

---

## 📱 **In Android Studio:**

1. **Wait** for Gradle sync to complete (progress bar at bottom)
2. **Click** the green ▶️ "Run" button (top toolbar)
3. **Select** an emulator or connected device
4. **Done!** App installs and launches automatically

---

## 🔄 **Making Changes:**

After editing your React code:

```bash
# Rebuild and sync
npm run build && npx cap sync

# Then click Run ▶️ in Android Studio again
```

---

## 📦 **Build APK for Sharing:**

In Android Studio:

1. **Build** → **Build Bundle(s) / APK(s)** → **Build APK(s)**
2. Wait for build to complete
3. Find APK at: `android/app/build/outputs/apk/debug/app-debug.apk`
4. Share this file to install on any Android device

---

## 🎨 **Customize App Icon:**

1. Right-click `android/app/src/main/res` in Android Studio
2. New → Image Asset
3. Icon Type: Launcher Icons
4. Upload your logo image
5. Click Next → Finish

---

## 🐛 **Troubleshooting:**

### "Gradle sync failed"
**Solution:** File → Sync Project with Gradle Files

### "SDK not found"
**Solution:** Tools → SDK Manager → Install latest Android SDK

### "App crashes on launch"
**Solution:** Check logcat (bottom panel) for errors. Usually a build/sync issue.

### "Changes not appearing"
**Solution:** Always run `npm run build && npx cap sync` after code changes

---

## 📚 **Full Documentation:**

See `ANDROID_DEPLOYMENT_GUIDE.md` for:
- WebView approach (simpler, smaller app)
- PWA configuration
- Play Store publishing steps
- Advanced configurations

---

## ⚡ **Pro Tips:**

1. **Use Chrome DevTools** for debugging:
   - chrome://inspect in Chrome browser
   - Connect device via USB
   - Inspect the WebView

2. **Enable USB Debugging** on Android device:
   - Settings → About Phone → Tap "Build Number" 7 times
   - Settings → Developer Options → Enable USB Debugging

3. **Faster builds:** In Android Studio settings:
   - Preferences → Build → Compiler → Parallel compilation
   - Increase heap size to 4096 MB

---

## 🎉 **You're Ready!**

Your TFS Management app is now a native Android application!

**Need help?** Check the detailed guide in `ANDROID_DEPLOYMENT_GUIDE.md`
