import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import Navbar from './components/Navbar';
import LandingPage from './pages/LandingPage';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import ReportIssue from './pages/ReportIssue';
import IssueDetailsEnhanced from './pages/IssueDetailsEnhanced';
import AdminDashboard from './pages/admin/AdminDashboard';
import Profile from './pages/Profile';
import AllIssues from './pages/admin/AllIssues';
import Analytics from './pages/admin/Analytics';
import MapView from './pages/admin/MapView';

// Protected Route Component
const ProtectedRoute = ({ children, adminOnly = false }) => {
  const { isAuthenticated, user } = useAuth();

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (adminOnly && user?.role !== 'admin') {
    return <Navigate to="/dashboard" replace />;
  }

  return children;
};

// Public Route (redirect if authenticated)
const PublicRoute = ({ children }) => {
  const { isAuthenticated } = useAuth();
  
  if (isAuthenticated) {
    return <Navigate to="/dashboard" replace />;
  }

  return children;
};

function AppContent() {
  const { isAuthenticated } = useAuth();

  return (
    <div className="min-h-screen bg-gray-50">
      <Routes>
        {/* Landing Page - no navbar */}
        <Route path="/" element={isAuthenticated ? <Navigate to="/dashboard" replace /> : <LandingPage />} />
        <Route path="/report" element={isAuthenticated ? <Navigate to="/report-issue" replace /> : <Navigate to="/register" replace />} />
        
        {/* Public Routes with Navbar */}
        <Route 
          path="/login" 
          element={
            <>
              <Navbar />
              <PublicRoute>
                <Login />
              </PublicRoute>
            </>
          } 
        />
        <Route 
          path="/register" 
          element={
            <>
              <Navbar />
              <PublicRoute>
                <Register />
              </PublicRoute>
            </>
          } 
        />

        {/* Protected User Routes with Navbar */}
        <Route
          path="/dashboard"
          element={
            <>
              <Navbar />
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            </>
          }
        />
        <Route
          path="/profile"
          element={
            <>
              <Navbar />
              <ProtectedRoute>
                <Profile />
              </ProtectedRoute>
            </>
          }
        />
        <Route
          path="/report-issue"
          element={
            <>
              <Navbar />
              <ProtectedRoute>
                <ReportIssue />
              </ProtectedRoute>
            </>
          }
        />
        <Route
          path="/issue/:id"
          element={
            <>
              <Navbar />
              <ProtectedRoute>
                <IssueDetailsEnhanced />
              </ProtectedRoute>
            </>
          }
        />

        {/* Protected Admin Routes with Navbar */}
        <Route
          path="/admin"
          element={
            <>
              <Navbar />
              <ProtectedRoute adminOnly>
                <AdminDashboard />
              </ProtectedRoute>
            </>
          }
        />
        <Route
          path="/admin/issues"
          element={
            <>
              <Navbar />
              <ProtectedRoute adminOnly>
                <AllIssues />
              </ProtectedRoute>
            </>
          }
        />
        <Route
          path="/admin/analytics"
          element={
            <>
              <Navbar />
              <ProtectedRoute adminOnly>
                <Analytics />
              </ProtectedRoute>
            </>
          }
        />
        <Route
          path="/admin/map"
          element={
            <>
              <Navbar />
              <ProtectedRoute adminOnly>
                <MapView />
              </ProtectedRoute>
            </>
          }
        />

        {/* 404 */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </div>
  );
}

function App() {
  return (
    <Router>
      <AuthProvider>
        <AppContent />
      </AuthProvider>
    </Router>
  );
}

export default App;
