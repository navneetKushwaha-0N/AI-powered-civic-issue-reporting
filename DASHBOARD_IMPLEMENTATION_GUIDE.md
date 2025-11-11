# Dashboard Implementation Guide

## ✅ Completed Backend Work

### New API Endpoints Added:
1. `GET /api/issues/user/:userId/:status` - Get user issues filtered by status
2. `GET /api/analytics/stats` - Get comprehensive analytics for admin
3. `GET /api/issues/map` - Get all issues with coordinates for map view

### Updated Files:
- `backend/controllers/issueController.js` - Added 3 new controller functions
- `backend/routes/issueRoutes.js` - Added new routes
- `backend/routes/analyticsRoutes.js` - NEW FILE for analytics
- `backend/server.js` - Registered analytics routes
- `backend/models/Issue.js` - Updated to accept ML categories

---

## ✅ Completed Frontend Work

### New Files Created:
1. `frontend/src/pages/MyIssues.jsx` - Filtered issues view for users
2. `frontend/src/pages/admin/ManageIssues.jsx` - Enhanced admin issue management

### Updated Files:
1. `frontend/src/pages/Dashboard.jsx` - Made cards clickable
2. `frontend/src/services/api.js` - Added new API endpoints

---

## 🔧 Remaining Frontend Work

### 1. Update App Routing

**File:** `frontend/src/App.jsx`

Add these routes:

```jsx
// User routes
<Route path="/my-issues/:status" element={<MyIssues />} />

// Admin routes
<Route path="/admin/manage-issues" element={<ManageIssues />} />
<Route path="/admin/analytics" element={<AnalyticsImproved />} />
<Route path="/admin/map-view" element={<MapViewImproved />} />
```

Don't forget imports:
```jsx
import MyIssues from './pages/MyIssues';
import ManageIssues from './pages/admin/ManageIssues';
```

---

### 2. Enhanced Analytics Page

**File:** `frontend/src/pages/admin/Analytics.jsx`

```jsx
import { useState, useEffect } from 'react';
import { analyticsAPI } from '../../services/api';
import Card from '../../components/Card';
import { BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

const Analytics = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAnalytics();
  }, []);

  const fetchAnalytics = async () => {
    try {
      const response = await analyticsAPI.getStats();
      setStats(response.data.data);
    } catch (error) {
      console.error('Error fetching analytics:', error);
    } finally {
      setLoading(false);
    }
  };

  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8'];

  if (loading) return <div>Loading...</div>;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-3xl font-bold mb-8">Analytics Dashboard</h1>

      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-6 mb-8">
        <Card>
          <p className="text-gray-500 text-sm">Total</p>
          <p className="text-3xl font-bold">{stats?.overview.total}</p>
        </Card>
        <Card>
          <p className="text-gray-500 text-sm">Pending</p>
          <p className="text-3xl font-bold text-yellow-600">{stats?.overview.pending}</p>
        </Card>
        <Card>
          <p className="text-gray-500 text-sm">Processing</p>
          <p className="text-3xl font-bold text-blue-600">{stats?.overview.processing}</p>
        </Card>
        <Card>
          <p className="text-gray-500 text-sm">Resolved</p>
          <p className="text-3xl font-bold text-green-600">{stats?.overview.resolved}</p>
        </Card>
        <Card>
          <p className="text-gray-500 text-sm">Avg Resolution</p>
          <p className="text-2xl font-bold">{stats?.overview.avgResolutionTime}</p>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Category Distribution */}
        <Card title="Category Distribution">
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={stats?.categoryStats}
                dataKey="count"
                nameKey="_id"
                cx="50%"
                cy="50%"
                outerRadius={80}
                label
              >
                {stats?.categoryStats.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </Card>

        {/* Status Distribution */}
        <Card title="Status Distribution">
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={stats?.statusStats}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="_id" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="count" fill="#8884d8" />
            </BarChart>
          </ResponsiveContainer>
        </Card>
      </div>
    </div>
  );
};

export default Analytics;
```

---

### 3. Map View Page

**File:** `frontend/src/pages/admin/MapView.jsx`

```jsx
import { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import MarkerClusterGroup from 'react-leaflet-cluster';
import { issueAPI } from '../../services/api';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

// Fix marker icons
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

const MapView = () => {
  const [issues, setIssues] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchIssues();
  }, []);

  const fetchIssues = async () => {
    try {
      const response = await issueAPI.getIssuesForMap();
      setIssues(response.data.data.issues);
    } catch (error) {
      console.error('Error fetching map data:', error);
    } finally {
      setLoading(false);
    }
  };

  const getMarkerColor = (status) => {
    switch(status) {
      case 'pending': return 'yellow';
      case 'processing': return 'blue';
      case 'resolved': return 'green';
      default: return 'red';
    }
  };

  if (loading) return <div>Loading map...</div>;

  return (
    <div className="h-screen w-full">
      <div className="p-4 bg-white shadow-sm">
        <h1 className="text-2xl font-bold">Issue Map View</h1>
        <p className="text-gray-600">Showing {issues.length} issues on map</p>
      </div>
      
      <MapContainer
        center={[40.7128, -74.0060]}
        zoom={4}
        style={{ height: 'calc(100vh - 100px)', width: '100%' }}
      >
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
        />
        
        <MarkerClusterGroup>
          {issues.map((issue) => (
            <Marker
              key={issue._id}
              position={[
                issue.location.coordinates[1],
                issue.location.coordinates[0]
              ]}
            >
              <Popup>
                <div className="p-2">
                  <h3 className="font-bold">{issue.title}</h3>
                  <p className="text-sm text-gray-600">{issue.category}</p>
                  <p className="text-sm">
                    Status: <span className={`font-medium text-${getMarkerColor(issue.status)}-600`}>
                      {issue.status}
                    </span>
                  </p>
                  {issue.imageUrl && (
                    <img src={issue.imageUrl} alt="Issue" className="w-full h-32 object-cover mt-2 rounded" />
                  )}
                </div>
              </Popup>
            </Marker>
          ))}
        </MarkerClusterGroup>
      </MapContainer>
    </div>
  );
};

export default MapView;
```

**Install required packages:**
```bash
cd frontend
npm install react-leaflet leaflet react-leaflet-cluster recharts
```

---

### 4. Update Admin Dashboard

**File:** `frontend/src/pages/admin/AdminDashboard.jsx`

Make the cards clickable similar to user dashboard:

```jsx
// Add useNavigate
const navigate = useNavigate();

// Update card divs to be clickable
<div onClick={() => navigate('/admin/manage-issues?status=pending')} className="cursor-pointer...">
```

---

### 5. Install Toast Notifications

```bash
cd frontend
npm install react-hot-toast
```

Add to `App.jsx`:
```jsx
import { Toaster } from 'react-hot-toast';

// Inside your App component JSX
<Toaster position="top-right" />
```

---

## 🚀 Testing Guide

### Test User Dashboard:
1. Login as regular user
2. Click on each stat card (Total, Pending, Processing, Resolved)
3. Should navigate to `/my-issues/:status`
4. Verify filtered issues display correctly

### Test Admin Features:
1. Login as admin
2. Go to "Manage Issues"
3. Test search and filters
4. Click "Mark as Processing" on pending issue
5. Verify toast notification appears
6. Check status updated in list
7. Go to Analytics - verify charts display
8. Go to Map View - verify markers show on map

---

## 📝 Summary of Changes

### Backend (✅ Complete):
- 3 new API endpoints
- 1 new routes file
- Updated server.js
- Updated Issue model

### Frontend (⚠️ Needs Final Steps):
- ✅ Dashboard cards clickable
- ✅ MyIssues page created
- ✅ ManageIssues page created
- ✅ API service updated
- ⚠️ Need to update App.jsx routing
- ⚠️ Need to enhance Analytics page
- ⚠️ Need to create/update MapView page
- ⚠️ Need to install npm packages
- ⚠️ Need to add toast notifications

---

## 🎯 Quick Start Commands

```bash
# Backend - Already running, just restart if needed
cd backend
npm run dev

# Frontend - Install new packages
cd frontend
npm install react-leaflet leaflet react-leaflet-cluster recharts react-hot-toast
npm run dev
```

---

## 🔍 Verification Checklist

- [ ] User can click dashboard cards
- [ ] /my-issues/:status route works
- [ ] Admin can search/filter issues
- [ ] Status update buttons work
- [ ] Toast notifications appear
- [ ] Analytics page shows charts
- [ ] Map view displays markers
- [ ] All routes are registered

---

Everything is set up! Just need to complete the frontend routing and install packages.
