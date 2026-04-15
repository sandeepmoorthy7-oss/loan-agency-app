# 🏦 TFS Management - Loan Agency System

A complete loan agency management application with role-based access control, built with React, TypeScript, and Tailwind CSS. **Now ready for Android deployment!**

---

## ✨ Features

### 👥 **User Management**
- **4 User Roles:** Owner, Sales Team, Backend Staff, Bank Manager
- **Self-Service Signup:** New users can apply for accounts
- **Owner Approval:** Admin reviews and approves/rejects applications
- **Role-Based Access:** Different permissions for each role

### 📝 **Loan Applications**
- Create and manage loan applications
- **15-Day Lock System:** Prevents client poaching
- **Owner Unlock:** Override locks when needed
- Status tracking (Pending, Under Review, Approved, Rejected)
- Auto-routing to bank managers

### 🎫 **Ticketing System**
- Create and track support tickets
- Priority levels and categories
- Comments and updates
- Status management

### 📊 **Analytics & Reports**
- Performance metrics
- Attendance tracking
- Team statistics
- Individual performance reviews

### 💬 **Communication**
- Announcements system
- Direct messaging
- Unread message notifications

### 🧮 **Financial Calculators**
- EMI Calculator
- Loan Eligibility Calculator
- Interest Calculator

---

## 🚀 **New: Android App Deployment**

Your TFS Management system is now ready to deploy as a native Android application!

### **Quick Start (3 Commands):**

```bash
# 1. Setup Android
npm run android:setup

# 2. Open in Android Studio
npm run android:open

# 3. Click Run ▶️ in Android Studio
```

### **Or Use Automated Scripts:**

**Windows:**
```cmd
ANDROID_SETUP.bat
```

**Mac/Linux:**
```bash
chmod +x ANDROID_SETUP.sh
./ANDROID_SETUP.sh
```

---

## 📱 **Deployment Options**

| Method | Time | Complexity | Best For |
|--------|------|-----------|----------|
| **Capacitor** ⭐ | 5 min | Easy | Production apps |
| **PWA** | 2 min | Very Easy | Quick testing |
| **WebView** | 10 min | Medium | Custom needs |

**Recommended:** Capacitor (already configured!)

---

## 📚 **Documentation**

### **For Android Deployment:**
- 📖 **[Complete Android Guide](README_ANDROID.md)** - Everything you need
- ⚡ **[Quick Start](QUICK_START_ANDROID.md)** - 5-minute setup
- 🔧 **[Detailed Guide](ANDROID_DEPLOYMENT_GUIDE.md)** - All deployment methods
- 📋 **[Summary](DEPLOYMENT_SUMMARY.md)** - What's included

### **For Web App:**
- All documentation included in source files
- Component library: shadcn/ui
- Styling: Tailwind CSS v4
- Routing: React Router v7

---

## 🎯 **User Roles & Permissions**

### **👑 Owner**
- ✅ Full system access
- ✅ Approve/reject new member applications
- ✅ Unlock loan applications (override 15-day lock)
- ✅ View all analytics and reports
- ✅ Manage users
- ✅ Attendance tracking
- ✅ Performance reviews

### **💼 Sales Team**
- ✅ Create loan applications
- ✅ View own applications (locked for 15 days)
- ✅ Submit tickets
- ✅ Use calculators
- ✅ View announcements
- ✅ Send messages

### **🔧 Backend Staff**
- ✅ Process applications
- ✅ Update application status
- ✅ View all applications
- ✅ Manage tickets
- ✅ View analytics

### **🏦 Bank Manager**
- ✅ View applications for their bank only
- ✅ Update application status
- ✅ View announcements
- ✅ Communication tools

---

## 🆕 **Signup & Approval System**

### **How It Works:**

1. **New User Signup** (`/signup`)
   - User fills registration form
   - Selects requested role
   - Provides reason for joining
   - Submits application

2. **Owner Reviews** (`/member-applications`)
   - See all pending applications
   - View applicant details
   - Approve or reject with reason
   - Badge shows pending count

3. **User Login**
   - Approved users can log in
   - Pending users see waiting message
   - Rejected users see reason

---

## 🔒 **15-Day Lock System**

### **Purpose:**
Prevent sales team members from stealing each other's clients.

### **How It Works:**
- New applications auto-lock to creator for 15 days
- 🔴 Red badge shows "Locked" status
- ⏰ Days remaining counter
- 🟢 Green badge after unlock
- 👑 Owner can unlock anytime

### **Visual Indicators:**
- Lock icons next to applicant names
- Status column with badges
- Lock status banner in details view
- Days remaining display

---

## 🛠️ **Tech Stack**

- **Framework:** React 18.3.1
- **Language:** TypeScript
- **Styling:** Tailwind CSS v4
- **UI Components:** shadcn/ui (Radix UI)
- **Routing:** React Router v7
- **Forms:** React Hook Form
- **Charts:** Recharts
- **Icons:** Lucide React
- **Animations:** Motion (Framer Motion)
- **Date Handling:** date-fns
- **Notifications:** Sonner

### **For Android:**
- **Framework:** Capacitor
- **Platform:** Android (API 24+)
- **PWA:** Service Worker configured

---

## 📦 **Installation**

### **Web App:**

```bash
# Install dependencies
npm install

# Run development server
npm run dev

# Build for production
npm run build
```

### **Android App:**

```bash
# One-time setup
npm run android:setup

# Open in Android Studio
npm run android:open

# After code changes
npm run android:sync
```

---

## 🎨 **Customization**

### **Change App Name:**
Edit `capacitor.config.ts`:
```typescript
appName: 'Your Company Name'
```

### **Change Package ID:**
Edit `capacitor.config.ts`:
```typescript
appId: 'com.yourcompany.app'
```

### **Change Colors:**
Edit `src/styles/theme.css` for web app theme colors.

### **Change App Icon:**
Android Studio → Right-click `res` → New → Image Asset

---

## 🔐 **Demo Credentials**

### **Owner:**
- Email: `owner@loanagency.com`
- Password: `owner123`

### **Sales Team:**
- Email: `sales1@loanagency.com`
- Password: `sales123`

### **Backend Staff:**
- Email: `backend1@loanagency.com`
- Password: `backend123`

### **Bank Manager (HDFC):**
- Email: `hdfc@loanagency.com`
- Password: `bank123`

**⚠️ Remove these for production!**

---

## 📱 **Android App Features**

✅ **Everything from the web app, plus:**
- Native Android performance
- Offline capability with localStorage
- Hardware back button support
- Native Android UI feel
- Install from Play Store (when published)
- Push notification support (configurable)
- Device API access via Capacitor plugins

---

## 🏪 **Publishing to Google Play Store**

See `README_ANDROID.md` for complete guide.

**Quick checklist:**
- [ ] Google Play Developer account ($25)
- [ ] App icon (512x512)
- [ ] Screenshots (minimum 2)
- [ ] Privacy policy
- [ ] Signed release bundle

**Steps:**
1. `Build → Generate Signed Bundle`
2. Create app in Play Console
3. Upload AAB file
4. Submit for review (1-7 days)

---

## 🗂️ **Project Structure**

```
src/
├── app/
│   ├── components/
│   │   ├── ui/              # shadcn/ui components
│   │   ├── Login.tsx        # Login page
│   │   └── Layout.tsx       # Main layout
│   ├── pages/
│   │   ├── Dashboard.tsx
│   │   ├── Applications.tsx
│   │   ├── MemberApplications.tsx  # NEW: Approval system
│   │   ├── Signup.tsx       # NEW: User registration
│   │   ├── Tickets.tsx
│   │   ├── Calculators.tsx
│   │   └── ...
│   ├── context/
│   │   ├── AuthContext.tsx  # Enhanced with approval logic
│   │   └── DataContext.tsx  # Data management
│   └── types/
│       └── index.ts         # TypeScript types
│   └── constants/
│       └── index.ts         # System constants (BANKS, LOAN_TYPES)
├── styles/
│   └── theme.css            # Custom theme
└── public/
    ├── manifest.json         # PWA manifest
    └── sw.js                 # Service worker

android/                      # Generated after setup
capacitor.config.ts           # Capacitor config
ANDROID_SETUP.sh/.bat         # Setup scripts
```

---

## 📋 **Available NPM Scripts**

| Command | Description |
|---------|-------------|
| `npm run build` | Build web app |
| `npm run android:setup` | Initial Android setup |
| `npm run android:sync` | Sync web changes to Android |
| `npm run android:open` | Open Android Studio |
| `npm run android:build` | Full rebuild |

---

## 🔄 **Data Persistence**

- **Backend:** Supabase (PostgreSQL)
- **Real-time:** Supabase Realtime Channels
- **Auth:** Supabase Auth (integrated with internal `users` table)
- **Cache:** localStorage (for session only)

All data is synchronized in real-time across all devices.
- ✅ Page refreshes
- ✅ Multi-device sync
- ✅ App restarts (Android)

---

## 🚧 **Roadmap**

- [x] User signup system
- [x] Owner approval workflow
- [x] Lock/unlock functionality
- [x] Android deployment setup
- [x] PWA configuration
- [x] Backend database integration (Supabase fully integrated)
- [ ] iOS deployment
- [ ] Push notifications
- [ ] Real-time sync (Implemented)
- [ ] Advanced analytics (Implemented)

---

## 🤝 **Contributing**

This is a production-ready template. Feel free to:
- Customize for your needs
- Add features
- Report issues
- Suggest improvements

---

## 📄 **License**

Proprietary - TFS Management System

---

## 🆘 **Support**

### **Need Help?**

1. **Android Deployment:** See `README_ANDROID.md`
2. **Quick Start:** See `QUICK_START_ANDROID.md`
3. **Detailed Guide:** See `ANDROID_DEPLOYMENT_GUIDE.md`
4. **Summary:** See `DEPLOYMENT_SUMMARY.md`

### **Common Issues:**
- Check troubleshooting sections in documentation files
- Ensure Node.js and Android Studio are installed
- Verify internet connection for dependencies

---

## 🎉 **What's Included**

### **✅ Features:**
- Complete loan management system
- 4 user roles with permissions
- Self-service signup with approval
- 15-day lock system with override
- Tickets, calculators, analytics
- Messaging and announcements

### **✅ Android Ready:**
- Capacitor configuration
- PWA manifest
- Service worker
- Setup scripts
- Complete documentation

### **✅ UI/UX:**
- Modern, professional design
- Fully responsive
- Touch-friendly (mobile)
- Accessibility features
- Loading states and animations

---

## 🎯 **Getting Started**

### **For Web Development:**
```bash
npm install
npm run dev
```

### **For Android Deployment:**
```bash
npm run android:setup
npm run android:open
# Click Run ▶️ in Android Studio
```

### **For Testing:**
Open browser to login page and use demo credentials above.

---

## 📊 **Stats**

- **Pages:** 11+ functional pages
- **Components:** 50+ UI components
- **User Roles:** 4 with distinct permissions
- **Features:** 10+ major features
- **Android Ready:** ✅ Yes
- **PWA Ready:** ✅ Yes
- **Production Ready:** ✅ Yes

---

## 🌟 **Highlights**

✨ **Role-Based Access Control** - Secure multi-role system
✨ **Self-Service Signup** - Users apply, owners approve
✨ **Lock System** - Prevents client poaching
✨ **Android App** - Deploy to Play Store
✨ **PWA Support** - Install from browser
✨ **Offline Support** - Works without internet
✨ **Modern UI** - Tailwind CSS + shadcn/ui
✨ **TypeScript** - Type-safe codebase
✨ **Responsive** - Works on all devices
✨ **Complete Docs** - Everything documented

---

**🚀 Start building your loan agency management system today!**

**📱 Deploy to Android in under 5 minutes with `npm run android:setup`**

---

*Built with ❤️ using React, TypeScript, and Tailwind CSS*

*Android deployment powered by Capacitor*

*Last updated: April 4, 2026*
