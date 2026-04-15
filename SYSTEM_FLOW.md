# 🔄 TFS Management - System Flow Diagrams

Visual representation of how the system works.

---

## 📋 **User Signup & Approval Flow**

```
┌─────────────────────────────────────────────────────────────────────┐
│                        NEW USER JOURNEY                              │
└─────────────────────────────────────────────────────────────────────┘

1. USER VISITS WEBSITE
   │
   ├─> Sees Login Page
   │   └─> Clicks "Create New Account"
   │
2. SIGNUP PAGE (/signup)
   │
   ├─> Fills Form:
   │   ├─ Name, Email, Phone
   │   ├─ Password (min 6 chars)
   │   ├─ Requested Role (Sales/Backend/Bank Manager)
   │   ├─ Bank (if Bank Manager)
   │   └─ Reason for Joining
   │
   ├─> Clicks "Submit Application"
   │
   └─> Application Status: PENDING ⏳
       └─> Redirected to Login Page


3. OWNER REVIEWS (/member-applications)
   │
   ├─> Sees Pending Applications
   │   ├─ Badge notification: "3 pending"
   │   └─ Application list with details
   │
   ├─> Opens Application Details
   │   ├─ Views full information
   │   ├─ Reviews reason for joining
   │   └─ Makes decision
   │
   └─> Two Options:
       │
       ├─> APPROVE ✅
       │   ├─ User account created
       │   └─ Status: APPROVED
       │
       └─> REJECT ❌
           ├─ Provides rejection reason
           └─ Status: REJECTED


4. USER TRIES TO LOGIN
   │
   ├─> Status: PENDING ⏳
   │   └─> Message: "Your application is pending approval"
   │
   ├─> Status: APPROVED ✅
   │   ├─ User account auto-created
   │   ├─ Login successful
   │   └─> Redirected to Dashboard
   │
   └─> Status: REJECTED ❌
       └─> Message: "Application rejected. Reason: [reason]"
```

---

## 🔒 **15-Day Lock System Flow**

```
┌─────────────────────────────────────────────────────────────────────┐
│                    LOAN APPLICATION LOCK FLOW                        │
└─────────────────────────────────────────────────────────────────────┘

1. SALES TEAM CREATES APPLICATION
   │
   └─> Automatic Actions:
       ├─ isLocked = true 🔴
       ├─ lockedUntil = Today + 15 days
       └─ lockedBy = Creator's ID


2. LOCK INDICATORS (Visible to all)
   │
   ├─> Applications List:
   │   ├─ 🔒 Lock icon next to name
   │   ├─ Red badge: "Locked"
   │   └─ Days remaining counter
   │
   └─> Application Details:
       └─ Banner: "🔒 LOCKED - 12 days remaining"


3. DURING LOCK PERIOD (15 days)
   │
   ├─> Creator (Sales Team):
   │   ✅ Can view and edit
   │   ✅ Can update status
   │   ✅ Full access to their application
   │
   ├─> Other Sales Team:
   │   ❌ Cannot edit
   │   ✅ Can view (read-only)
   │   ℹ️  See lock status
   │
   ├─> Backend Staff:
   │   ✅ Can process applications
   │   ✅ Can update status
   │   ✅ Full access (processing role)
   │
   ├─> Bank Managers:
   │   ✅ Can view (their bank only)
   │   ✅ Can update status
   │   ✅ Read-only access
   │
   └─> Owner:
       ✅ Full access
       ✅ Can unlock anytime 🔓


4. OWNER UNLOCK (Override)
   │
   └─> Owner Opens Application Details
       │
       └─> Sees Unlock Button:
           "🔓 Unlock Application (Override 15-Day Lock)"
           │
           ├─> Clicks Unlock
           │
           └─> Immediate Actions:
               ├─ isLocked = false
               ├─ lockedUntil = undefined
               └─ Badge changes to Green "Unlocked"


5. AFTER 15 DAYS (Automatic Unlock)
   │
   └─> System Checks Lock Date:
       │
       ├─> If Today > lockedUntil:
       │   ├─ isLocked = false
       │   ├─ Badge: Green "Unlocked"
       │   └─ Available to all sales team
       │
       └─> Visual Changes:
           ├─ 🔓 Unlock icon
           ├─ Green badge: "Unlocked"
           └─ No days remaining counter


6. UNLOCKED STATE
   │
   └─> All Sales Team Members:
       ✅ Can view
       ✅ Can edit
       ✅ Can update
       ✅ Full access to application
```

---

## 👥 **Role-Based Access Flow**

```
┌─────────────────────────────────────────────────────────────────────┐
│                      ROLE PERMISSIONS MATRIX                         │
└─────────────────────────────────────────────────────────────────────┘

LOGIN
  │
  └─> Check User Role
      │
      ├─> OWNER 👑
      │   │
      │   └─> Full Dashboard Access:
      │       ├─ Dashboard ✅
      │       ├─ Applications ✅ (all, unlock ability)
      │       ├─ Member Applications ✅ (approve/reject)
      │       ├─ Tickets ✅
      │       ├─ Calculators ✅
      │       ├─ Performance ✅ (owner only)
      │       ├─ Attendance ✅ (owner only)
      │       ├─ Announcements ✅ (create/edit)
      │       ├─ Messages ✅
      │       └─ Users ✅ (owner only)
      │
      ├─> SALES TEAM 💼
      │   │
      │   └─> Limited Access:
      │       ├─ Dashboard ✅
      │       ├─ Applications ✅ (create, view own)
      │       ├─ Tickets ✅ (create, view own)
      │       ├─ Calculators ✅
      │       ├─ Announcements ✅ (view only)
      │       └─ Messages ✅
      │
      ├─> BACKEND STAFF 🔧
      │   │
      │   └─> Processing Access:
      │       ├─ Dashboard ✅
      │       ├─ Applications ✅ (process, all access)
      │       ├─ Tickets ✅ (manage all)
      │       ├─ Calculators ✅
      │       ├─ Announcements ✅
      │       └─ Messages ✅
      │
      └─> BANK MANAGER 🏦
          │
          └─> Bank-Specific Access:
              ├─ Dashboard ✅
              ├─ Applications ✅ (their bank only)
              ├─ Tickets ✅
              ├─ Calculators ✅
              ├─ Announcements ✅
              └─ Messages ✅
```

---

## 📱 **Android Deployment Flow**

```
┌─────────────────────────────────────────────────────────────────────┐
│                    ANDROID DEPLOYMENT JOURNEY                        │
└─────────────────────────────────────────────────────────────────────┘

DEVELOPER
  │
  ├─> METHOD 1: Automated Script
  │   │
  │   ├─> Windows: Run ANDROID_SETUP.bat
  │   └─> Mac/Linux: Run ANDROID_SETUP.sh
  │       │
  │       └─> Script Does:
  │           1. npm install @capacitor/android
  │           2. npm run build
  │           3. npx cap add android
  │           4. npx cap sync
  │           5. npx cap open android
  │
  ├─> METHOD 2: NPM Commands
  │   │
  │   ├─> npm run android:setup
  │   └─> npm run android:open
  │
  └─> METHOD 3: Manual
      │
      └─> Follow ANDROID_DEPLOYMENT_GUIDE.md


ANDROID STUDIO OPENS
  │
  ├─> Gradle Sync (automatic)
  │   ├─ Download dependencies
  │   ├─ Index files
  │   └─ Build project
  │
  └─> Developer Actions:
      │
      ├─> Click Run ▶️
      │
      └─> Select Device:
          ├─ Emulator (virtual device)
          └─ Real Device (USB debugging)


APP INSTALLATION
  │
  ├─> Android Studio:
  │   ├─ Builds APK
  │   ├─ Installs on device
  │   └─ Launches app
  │
  └─> App Running:
      ├─ Shows Login Screen
      ├─ All features functional
      ├─ localStorage working
      └─ Native Android feel


MAKING CHANGES
  │
  ├─> Edit React Code
  │
  ├─> Run: npm run android:sync
  │   ├─ Builds web app
  │   └─ Syncs to Android
  │
  └─> Click Run ▶️ in Android Studio
      └─> Changes appear in app


PRODUCTION BUILD
  │
  ├─> Build → Generate Signed Bundle
  │
  ├─> Select Release Build
  │
  ├─> Sign with Keystore
  │
  └─> Output: app-release.aab
      │
      └─> Ready for Play Store! 🎉


PLAY STORE SUBMISSION
  │
  ├─> Create Play Console Account ($25)
  │
  ├─> Create New App
  │
  ├─> Upload:
  │   ├─ app-release.aab
  │   ├─ App icon
  │   ├─ Screenshots
  │   └─ Privacy policy
  │
  ├─> Submit for Review
  │
  └─> Review: 1-7 days
      │
      └─> PUBLISHED! ✅
          Users can download from Play Store
```

---

## 🔄 **Data Flow**

```
┌─────────────────────────────────────────────────────────────────────┐
│                         DATA PERSISTENCE                             │
└─────────────────────────────────────────────────────────────────────┘

WEB & ANDROID APP
  │
  └─> Supabase (Current Architecture)
      │
      ├─> Features:
      │   ├─ PostgreSQL database
      │   ├─ Real-time sync (Channels)
      │   ├─ Authentication
      │   ├─ File storage (Documents)
      │   └─ Role-based access control
      │
      └─> Survives:
          ✅ Page refresh / App restart
          ✅ Multi-device sync
          ✅ Data backup
          ✅ Scalable production environment


LEGACY / CACHE LAYER
  │
  └─> localStorage
      │
      ├─> Used for:
      │   ├─ Session persistence (Auth token)
      │   └─ UI state & preferences
      │
      └─> Note: No longer primary data store
```

---

## 🎯 **User Interaction Flow**

```
┌─────────────────────────────────────────────────────────────────────┐
│                      TYPICAL USER SESSION                            │
└─────────────────────────────────────────────────────────────────────┘

1. APP LAUNCH
   │
   └─> Check Authentication:
       │
       ├─> Not Logged In → Show Login Page
       │
       └─> Already Logged In → Show Dashboard


2. DASHBOARD
   │
   ├─> Top Navigation:
   │   ├─ Logo & Role Badge
   │   ├─ Notification Bell (unread count)
   │   └─ User Menu (Logout)
   │
   ├─> Main Navigation:
   │   ├─ Dashboard
   │   ├─ Applications
   │   ├─ Member Applications (Owner only, badge count)
   │   ├─ Tickets
   │   ├─ Calculators
   │   ├─ Performance (Owner only)
   │   ├─ Attendance (Owner only)
   │   ├─ Announcements
   │   ├─ Messages (badge for unread)
   │   └─ Users (Owner only)
   │
   └─> Content Area:
       └─> Role-Specific Stats & Widgets


3. CREATE LOAN APPLICATION (Sales Team)
   │
   ├─> Click "Create New Application"
   │
   ├─> Fill Form:
   │   ├─ Applicant Details
   │   ├─ Loan Information
   │   ├─ Bank Selection
   │   └─ Supporting Documents
   │
   ├─> Submit
   │
   └─> Application Created:
       ├─ Auto-locked for 15 days 🔴
       ├─ Status: Pending
       └─> Visible in Applications List


4. REVIEW APPLICATION (Backend Staff)
   │
   ├─> Open Application
   │
   ├─> Review Details
   │
   ├─> Update Status:
   │   ├─ Pending
   │   ├─ Under Review
   │   ├─ Approved
   │   └─ Rejected
   │
   └─> Application Updated


5. APPROVE MEMBER (Owner)
   │
   ├─> Badge Notification: "3 pending"
   │
   ├─> Go to Member Applications
   │
   ├─> View Pending List
   │
   ├─> Open Application Details
   │
   └─> Decision:
       ├─> Approve → User can login
       └─> Reject → User sees reason


6. UNLOCK APPLICATION (Owner)
   │
   ├─> Open Locked Application
   │
   ├─> See Lock Banner & Button
   │
   ├─> Click "Unlock Application"
   │
   └─> Confirmation:
       ├─ Lock removed immediately
       └─ Badge changes to Green


7. LOGOUT
   │
   └─> User Menu → Logout
       │
       ├─ Clear currentUser from storage
       └─> Redirect to Login Page
```

---

## 📊 **System Architecture**

```
┌─────────────────────────────────────────────────────────────────────┐
│                        TECHNICAL STACK                               │
└─────────────────────────────────────────────────────────────────────┘

FRONTEND (React)
  │
  ├─> Components Layer
  │   ├─ UI Components (shadcn/ui)
  │   ├─ Pages
  │   └─ Layout
  │
  ├─> State Management
  │   ├─ AuthContext (user session)
  │   └─ DataContext (app data)
  │
  ├─> Routing
  │   └─ React Router v7
  │
  └─> Styling
      └─ Tailwind CSS v4


DATA LAYER
  │
b  ├─> Supabase (Current)
  │   ├─ PostgreSQL
  │   ├─ Real-time
  │   └─ Auth
  │
  └─> Legacy: localStorage
      ├─ Browser (web)
      └─ WebView (Android)


ANDROID WRAPPER
  │
  ├─> Capacitor
  │   ├─ WebView container
  │   ├─ Native plugins
  │   └─ Build tools
  │
  └─> Android Studio
      ├─ Build system
      ├─ Emulator
      └─ APK generation


DEPLOYMENT
  │
  ├─> Web: Vercel/Netlify
  │
  ├─> Android: Google Play Store
  │
  └─> PWA: Any web server
```

---

**This flow documentation helps understand how all parts of the system work together!**

*For implementation details, see the respective documentation files.*
