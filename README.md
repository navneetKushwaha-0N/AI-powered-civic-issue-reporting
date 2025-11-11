# AI-Powered Civic Issue Reporting System

A full-stack application for reporting and managing civic issues with ML-powered duplicate detection and category prediction.

## 🏗️ Architecture

### **Backend** (Node.js + Express + MongoDB)
- RESTful API with JWT authentication
- Image upload to Cloudinary
- ML API integration for category prediction
- Duplicate detection using geospatial queries + image similarity (perceptual hashing)
- Role-based access control (User/Admin)

### **Frontend** (React + Vite + Tailwind CSS)
- Context API for global state management
- React Router for navigation
- Axios for API calls with interceptors
- Leaflet for interactive maps
- Recharts for analytics visualization

---

## 📁 Project Structure

```
civic-issue-system/
├── backend/
│   ├── config/
│   │   └── database.js
│   ├── controllers/
│   │   ├── authController.js
│   │   └── issueController.js
│   ├── middleware/
│   │   ├── authMiddleware.js
│   │   └── multer.js
│   ├── models/
│   │   ├── User.js
│   │   └── Issue.js
│   ├── routes/
│   │   ├── authRoutes.js
│   │   └── issueRoutes.js
│   ├── utils/
│   │   ├── cloudinary.js
│   │   └── imageSimilarity.js
│   ├── .env.example
│   ├── .gitignore
│   ├── package.json
│   └── server.js
│
└── frontend/
    ├── public/
    ├── src/
    │   ├── components/
    │   │   ├── Badge.jsx
    │   │   ├── Button.jsx
    │   │   ├── Card.jsx
    │   │   ├── Input.jsx
    │   │   ├── Navbar.jsx
    │   │   └── Sidebar.jsx
    │   ├── context/
    │   │   └── AuthContext.jsx
    │   ├── pages/
    │   │   ├── Login.jsx
    │   │   ├── Register.jsx
    │   │   ├── Dashboard.jsx
    │   │   ├── ReportIssue.jsx
    │   │   ├── IssueDetails.jsx
    │   │   └── admin/
    │   │       ├── AdminDashboard.jsx
    │   │       ├── AllIssues.jsx
    │   │       ├── Analytics.jsx
    │   │       └── MapView.jsx
    │   ├── services/
    │   │   ├── api.js
    │   │   └── axiosInstance.js
    │   ├── layouts/
    │   │   ├── MainLayout.jsx
    │   │   └── AdminLayout.jsx
    │   ├── hooks/
    │   │   └── useGeolocation.js
    │   ├── utils/
    │   │   └── constants.js
    │   ├── App.jsx
    │   ├── main.jsx
    │   └── index.css
    ├── .env.example
    ├── .gitignore
    ├── index.html
    ├── package.json
    ├── postcss.config.js
    ├── tailwind.config.js
    └── vite.config.js
```

---

## 🚀 Setup Instructions

### **Prerequisites**
- Node.js 18+ and npm
- MongoDB (local or Atlas)
- Cloudinary account
- ML API endpoint (optional)

### **Backend Setup**

```bash
cd backend

# Install dependencies
npm install

# Create .env file
cp .env.example .env

# Edit .env with your credentials:
# - MongoDB URI
# - JWT Secret
# - Cloudinary credentials
# - ML API URL (if available)

# Start development server
npm run dev
```

Backend will run on `http://localhost:5000`

### **Frontend Setup**

```bash
cd frontend

# Install dependencies
npm install

# Create .env file
cp .env.example .env

# Edit .env
echo "VITE_API_BASE_URL=http://localhost:5000/api" > .env

# Start development server
npm run dev
```

Frontend will run on `http://localhost:5173`

---

## 🔑 API Endpoints

### **Authentication**
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `POST /api/auth/logout` - Logout user
- `GET /api/auth/me` - Get current user

### **Issues (User)**
- `POST /api/issues/create` - Create issue (with image upload)
- `GET /api/issues/user/:userId` - Get user's issues
- `GET /api/issues/nearby?lat=&lng=&radius=` - Get nearby issues
- `GET /api/issues/:id` - Get single issue
- `POST /api/issues/support/:id` - Support an issue
- `GET /api/issues/stats/dashboard` - Get dashboard stats

### **Issues (Admin)**
- `GET /api/issues?status=&category=&page=&limit=` - Get all issues
- `PUT /api/issues/status/:id` - Update issue status
- `PUT /api/issues/category/:id` - Update issue category

---

## 🎨 Features

### **User Features**
- ✅ Register/Login with JWT authentication
- ✅ Auto-detect location using browser geolocation
- ✅ Upload issue image with preview
- ✅ ML-powered category prediction
- ✅ Duplicate detection (location + image similarity)
- ✅ Support existing issues
- ✅ View personal issue dashboard
- ✅ View issue details on interactive map

### **Admin Features**
- ✅ View all issues with filters
- ✅ Update issue status (pending/processing/resolved/rejected)
- ✅ Correct ML predictions (update category)
- ✅ Analytics dashboard with charts
- ✅ Map view with issue clusters
- ✅ Monthly and category-wise statistics

### **Duplicate Detection Logic**
1. Upload image → Cloudinary
2. Call ML API → Get predicted category
3. Search nearby issues within 80m radius with same category
4. Compare images using perceptual hashing
5. If similarity > 85% → Add supporter to existing issue
6. Else → Create new issue

---

## 🛠️ Tech Stack

### Backend
- Node.js + Express.js
- MongoDB + Mongoose
- JWT + bcryptjs
- Cloudinary
- Multer
- Sharp (image processing)
- Axios
- Helmet + CORS + Rate Limiting

### Frontend
- React 18
- Vite
- Tailwind CSS
- React Router v6
- Context API
- Axios
- Leaflet + React-Leaflet
- Recharts
- Lucide React (icons)

---

## 🔒 Security Features
- JWT token authentication
- HTTP-only cookies support
- Password hashing with bcryptjs
- Rate limiting on sensitive routes
- CORS configuration
- Helmet security headers
- Input validation
- Protected routes

---

## 📱 Responsive Design
- Mobile-first approach
- Tailwind CSS utilities
- Responsive navbar
- Mobile-friendly forms
- Adaptive layouts

---

## 🗺️ Map Integration
- OpenStreetMap tiles
- Issue markers with popups
- Geolocation detection
- Clustered markers for admin view
- Color-coded by status

---

## 📊 Analytics (Admin)
- Total issues breakdown
- Status distribution
- Category-wise statistics
- Monthly trends (bar charts)
- Support count analysis

---

## 🚧 Future Enhancements
- Push notifications
- Email notifications
- Real-time updates (WebSockets)
- Mobile app (React Native)
- Advanced analytics
- Export reports to PDF/CSV
- Image compression before upload
- Multi-language support

---

## 📄 License
MIT

---

## 👥 Contributors
Your Name :Satyam Yadav (@satyam2747)

---

## 🐛 Known Issues
- ML API integration is optional (falls back to 'other' category if unavailable)
- Image similarity requires Sharp library (may need additional setup on some systems)

---

## 📞 Support
For issues and questions, please open a GitHub issue.
