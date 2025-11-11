import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { issueAPI } from '../services/api';
import Card from '../components/Card';
import Badge from '../components/Badge';
import { PlusCircle, AlertCircle, Clock, CheckCircle, ArrowRight } from 'lucide-react';

const Dashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [stats, setStats] = useState(null);
  const [issues, setIssues] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user?.id) {
      fetchDashboardData();
    }
  }, [user?.id]);

  const fetchDashboardData = async () => {
    if (!user?.id) return;
    
    try {
      const [statsRes, issuesRes] = await Promise.all([
        issueAPI.getDashboardStats(),
        issueAPI.getUserIssues(user.id)
      ]);
      
      setStats(statsRes.data.data);
      setIssues(issuesRes.data.data.issues);
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="flex justify-center items-center h-screen">Loading...</div>;
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-gray-900">My Dashboard</h1>
        <Link
          to="/report-issue"
          className="flex items-center space-x-2 bg-primary-600 text-white px-4 py-2 rounded-lg hover:bg-primary-700 transition"
        >
          <PlusCircle className="h-5 w-5" />
          <span>Report Issue</span>
        </Link>
      </div>

      {/* Stats Cards - Clickable */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div
          onClick={() => navigate(`/my-issues/all`)}
          className="cursor-pointer transform transition hover:scale-105 hover:shadow-lg"
        >
          <Card className="flex items-center justify-between space-x-4 h-full">
            <div className="flex items-center space-x-4">
              <div className="p-3 bg-blue-100 rounded-lg">
                <AlertCircle className="h-8 w-8 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-gray-500">Total Issues</p>
                <p className="text-2xl font-bold">{stats?.total || 0}</p>
              </div>
            </div>
            <ArrowRight className="h-5 w-5 text-gray-400" />
          </Card>
        </div>

        <div
          onClick={() => navigate(`/my-issues/pending`)}
          className="cursor-pointer transform transition hover:scale-105 hover:shadow-lg"
        >
          <Card className="flex items-center justify-between space-x-4 h-full">
            <div className="flex items-center space-x-4">
              <div className="p-3 bg-yellow-100 rounded-lg">
                <Clock className="h-8 w-8 text-yellow-600" />
              </div>
              <div>
                <p className="text-sm text-gray-500">Pending</p>
                <p className="text-2xl font-bold">{stats?.pending || 0}</p>
              </div>
            </div>
            <ArrowRight className="h-5 w-5 text-gray-400" />
          </Card>
        </div>

        <div
          onClick={() => navigate(`/my-issues/processing`)}
          className="cursor-pointer transform transition hover:scale-105 hover:shadow-lg"
        >
          <Card className="flex items-center justify-between space-x-4 h-full">
            <div className="flex items-center space-x-4">
              <div className="p-3 bg-blue-100 rounded-lg">
                <Clock className="h-8 w-8 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-gray-500">Processing</p>
                <p className="text-2xl font-bold">{stats?.processing || 0}</p>
              </div>
            </div>
            <ArrowRight className="h-5 w-5 text-gray-400" />
          </Card>
        </div>

        <div
          onClick={() => navigate(`/my-issues/resolved`)}
          className="cursor-pointer transform transition hover:scale-105 hover:shadow-lg"
        >
          <Card className="flex items-center justify-between space-x-4 h-full">
            <div className="flex items-center space-x-4">
              <div className="p-3 bg-green-100 rounded-lg">
                <CheckCircle className="h-8 w-8 text-green-600" />
              </div>
              <div>
                <p className="text-sm text-gray-500">Resolved</p>
                <p className="text-2xl font-bold">{stats?.resolved || 0}</p>
              </div>
            </div>
            <ArrowRight className="h-5 w-5 text-gray-400" />
          </Card>
        </div>
      </div>

      {/* Issues Table */}
      <Card title="My Issues">
        {issues.length === 0 ? (
          <p className="text-gray-500 text-center py-8">No issues reported yet</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Category</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Description</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Support</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {issues.map((issue) => (
                  <tr key={issue._id}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="text-sm font-medium text-gray-900 capitalize">
                        {issue.category.replace('_', ' ')}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <p className="text-sm text-gray-900 truncate max-w-xs">
                        {issue.description}
                      </p>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <Badge status={issue.status}>
                        {issue.status}
                      </Badge>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {issue.supportCount} supporters
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(issue.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      <Link
                        to={`/issue/${issue._id}`}
                        className="text-primary-600 hover:text-primary-900"
                      >
                        View Details
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>
    </div>
  );
};

export default Dashboard;
