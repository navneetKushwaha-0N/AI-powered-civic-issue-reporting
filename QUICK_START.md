# Quick Start Guide - VS Code

## ✅ Setup Complete!

Dependencies are installed and VS Code is open. Follow these steps to run the application.

---

## 🚀 Running the Application

### Option 1: Using VS Code Tasks (Recommended)

1. **Press** `Cmd + Shift + P` (Command Palette)
2. **Type:** `Tasks: Run Task`
3. **Select:** `Start All`

This will start both backend and frontend servers in split terminals.

### Option 2: Manual Terminal Commands

#### Terminal 1 - Backend:
```bash
cd ~/civic-issue-system/backend
npm run dev
```

#### Terminal 2 - Frontend (New Terminal):
```bash
cd ~/civic-issue-system/frontend
npm run dev
```

---

## 🌐 Access the Application

Once both servers are running:

- **Frontend:** http://localhost:5173
- **Backend API:** http://localhost:6000
- **API Health Check:** http://localhost:6000/health

---

## 🔧 Configuration Required

### Backend Environment (.env)

The backend `.env` file has been created with your credentials:

```bash
# Already configured from .env.example:
PORT=6000
MONGODB_URI=mongodb+srv://mollen_0_mist:notebook@mollencluster01...
CLOUDINARY_CLOUD_NAME=dq5chmnsk
CLOUDINARY_API_KEY=198927272667298
CLOUDINARY_API_SECRET=QK3nl7aGfk5CSIRWa4WhZDf9e_w
```

**Action needed:**
- Verify MongoDB connection is working
- Cloudinary credentials are already set

### Frontend Environment (.env)

The frontend `.env` file is configured:

```bash
VITE_API_BASE_URL=http://localhost:6000/api
```

✅ Ready to use!

---

## 📝 Next Steps

### 1. Complete Remaining Pages

Copy templates from `STARTER_TEMPLATES.md` to create:

```bash
# Create directories
mkdir -p frontend/src/pages/admin
mkdir -p frontend/src/hooks
mkdir -p frontend/src/utils

# Copy these templates from STARTER_TEMPLATES.md:
# - src/pages/Dashboard.jsx
# - src/pages/ReportIssue.jsx
# - src/pages/IssueDetails.jsx
# - src/pages/admin/AdminDashboard.jsx
# - src/pages/admin/AllIssues.jsx
# - src/pages/admin/Analytics.jsx
# - src/pages/admin/MapView.jsx
# - src/hooks/useGeolocation.js
# - src/utils/constants.js
```

### 2. Test the Application

1. **Register a user:**
   - Go to http://localhost:5173/register
   - Fill in details and submit

2. **Login:**
   - Use your registered credentials

3. **Report an issue:**
   - Click "Report Issue"
   - Upload image, detect location, submit

### 3. Create Admin User

To access admin features, manually update a user in MongoDB:

```javascript
// In MongoDB Compass or Shell:
db.users.updateOne(
  { email: "your-email@example.com" },
  { $set: { role: "admin" } }
)
```

Then login with that user to access `/admin`.

---

## 🛠️ VS Code Features Configured

### Tasks Available:
- **Start Backend** - Runs backend only
- **Start Frontend** - Runs frontend only  
- **Start All** - Runs both simultaneously

Access via: `Cmd + Shift + P` → `Tasks: Run Task`

### Settings:
- ✅ Auto-format on save
- ✅ ESLint auto-fix
- ✅ Single quotes preference

---

## 📂 VS Code Workspace

Open the integrated terminal in VS Code:
- **Terminal 1:** Backend (port 6000)
- **Terminal 2:** Frontend (port 5173)

You can split terminals: Right-click in terminal area → "Split Terminal"

---

## 🐛 Troubleshooting

### MongoDB Connection Error
```bash
# Check if MongoDB is accessible
# Your connection string is: mongodb+srv://mollen_0_mist:notebook@mollencluster01...
# Make sure your IP is whitelisted in MongoDB Atlas
```

### Port Already in Use
```bash
# Kill process on port 6000:
lsof -ti:6000 | xargs kill -9

# Kill process on port 5173:
lsof -ti:5173 | xargs kill -9
```

### "code" Command Not Found
The `code` command is not in PATH, but we used `open -a` instead which worked.

To add `code` to PATH:
1. Open VS Code
2. Press `Cmd + Shift + P`
3. Type "Shell Command: Install 'code' command in PATH"

---

## 📊 Application Structure

```
civic-issue-system/
├── backend/           ✅ Ready to run
│   ├── server.js      Entry point
│   └── .env           Configured
├── frontend/          🟡 Core ready + templates needed
│   ├── src/
│   │   ├── App.jsx    ✅ Routing configured
│   │   └── pages/     📝 Add templates
│   └── .env           ✅ Configured
└── .vscode/           ✅ VS Code tasks configured
```

---

## 🎯 Current Status

✅ **Dependencies installed**  
✅ **Environment files created**  
✅ **VS Code opened**  
✅ **Backend ready to run**  
✅ **Frontend core ready**  
📝 **Copy page templates from STARTER_TEMPLATES.md**

---

## 💡 Useful Commands

```bash
# Check if servers are running
lsof -i :6000  # Backend
lsof -i :5173  # Frontend

# View logs
tail -f backend/logs/*.log  # If logging is enabled

# Install additional packages
npm install --prefix backend <package-name>
npm install --prefix frontend <package-name>
```

---

## 🎉 Ready to Start!

Run the task: `Cmd + Shift + P` → `Tasks: Run Task` → `Start All`

Then visit: http://localhost:5173

Happy coding! 🚀
