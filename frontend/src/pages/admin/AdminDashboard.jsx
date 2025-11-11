import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { issueAPI } from '../../services/api';
import Card from '../../components/Card';
import { AlertCircle, Users, CheckCircle, Clock, BarChart3, Map } from 'lucide-react';

const AdminDashboard = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const response = await issueAPI.getDashboardStats();
      setStats(response.data.data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="flex justify-center items-center h-screen">Loading...</div>;
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-3xl font-bold text-gray-900 mb-8">Admin Dashboard</h1>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <Card>
          <button onClick={() => navigate('/admin/issues')} className="w-full text-left">
            <div className="flex items-center space-x-4">
              <div className="p-3 bg-blue-100 rounded-lg">
                <AlertCircle className="h-10 w-10 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-gray-500">Total Issues</p>
                <p className="text-3xl font-bold text-gray-900">{stats?.total || 0}</p>
              </div>
            </div>
          </button>
        </Card>

        <Card>
          <button onClick={() => navigate('/admin/issues?status=pending')} className="w-full text-left">
            <div className="flex items-center space-x-4">
              <div className="p-3 bg-yellow-100 rounded-lg">
                <Clock className="h-10 w-10 text-yellow-600" />
              </div>
              <div>
                <p className="text-sm text-gray-500">Pending</p>
                <p className="text-3xl font-bold text-gray-900">{stats?.pending || 0}</p>
              </div>
            </div>
          </button>
        </Card>

        <Card>
          <button onClick={() => navigate('/admin/issues?status=processing')} className="w-full text-left">
            <div className="flex items-center space-x-4">
              <div className="p-3 bg-blue-100 rounded-lg">
                <Users className="h-10 w-10 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-gray-500">Processing</p>
                <p className="text-3xl font-bold text-gray-900">{stats?.processing || 0}</p>
              </div>
            </div>
          </button>
        </Card>

        <Card>
          <button onClick={() => navigate('/admin/issues?status=resolved')} className="w-full text-left">
            <div className="flex items-center space-x-4">
              <div className="p-3 bg-green-100 rounded-lg">
                <CheckCircle className="h-10 w-10 text-green-600" />
              </div>
              <div>
                <p className="text-sm text-gray-500">Resolved</p>
                <p className="text-3xl font-bold text-gray-900">{stats?.resolved || 0}</p>
              </div>
            </div>
          </button>
        </Card>
      </div>

      {/* Quick Links */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Link to="/admin/issues" className="card hover:shadow-lg transition group">
          <div className="flex items-start space-x-4">
            <div className="p-3 bg-primary-100 rounded-lg group-hover:bg-primary-200 transition">
              <AlertCircle className="h-8 w-8 text-primary-600" />
            </div>
            <div>
              <h3 className="font-semibold text-lg text-gray-900">Manage Issues</h3>
              <p className="text-gray-500 mt-2">View and update all reported issues</p>
            </div>
          </div>
        </Link>

        <Link to="/admin/analytics" className="card hover:shadow-lg transition group">
          <div className="flex items-start space-x-4">
            <div className="p-3 bg-purple-100 rounded-lg group-hover:bg-purple-200 transition">
              <BarChart3 className="h-8 w-8 text-purple-600" />
            </div>
            <div>
              <h3 className="font-semibold text-lg text-gray-900">Analytics</h3>
              <p className="text-gray-500 mt-2">View charts and statistics</p>
            </div>
          </div>
        </Link>

        <Link to="/admin/map" className="card hover:shadow-lg transition group">
          <div className="flex items-start space-x-4">
            <div className="p-3 bg-green-100 rounded-lg group-hover:bg-green-200 transition">
              <Map className="h-8 w-8 text-green-600" />
            </div>
            <div>
              <h3 className="font-semibold text-lg text-gray-900">Map View</h3>
              <p className="text-gray-500 mt-2">Visualize issues on interactive map</p>
            </div>
          </div>
        </Link>
      </div>

      {/* Category Breakdown */}
      {stats?.categoryStats && stats.categoryStats.length > 0 && (
        <Card title="Category Breakdown" className="mt-8">
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            {stats.categoryStats.map((cat) => (
              <div key={cat._id} className="text-center p-4 bg-gray-50 rounded-lg">
                <p className="text-2xl font-bold text-primary-600">{cat.count}</p>
                <p className="text-sm text-gray-600 capitalize mt-1">
                  {cat._id?.replace('_', ' ') || 'Unknown'}
                </p>
              </div>
            ))}
          </div>
        </Card>
      )}
    </div>
  );
};

export default AdminDashboard;
