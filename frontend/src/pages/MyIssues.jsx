import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { issueAPI } from '../services/api';
import Card from '../components/Card';
import Badge from '../components/Badge';
import { ArrowLeft, Eye, MapPin, Calendar } from 'lucide-react';

const MyIssues = () => {
  const { status } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [issues, setIssues] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user?.id) {
      fetchIssues();
    }
  }, [status, user?.id]);

  const fetchIssues = async () => {
    if (!user?.id) return;
    
    try {
      setLoading(true);
      const response = await issueAPI.getUserIssuesByStatus(user.id, status);
      setIssues(response.data.data.issues);
    } catch (error) {
      console.error('Error fetching issues:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusTitle = () => {
    switch(status) {
      case 'all': return 'All Issues';
      case 'pending': return 'Pending Issues';
      case 'processing': return 'Processing Issues';
      case 'resolved': return 'Resolved Issues';
      default: return 'My Issues';
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="mb-8">
        <button
          onClick={() => navigate('/dashboard')}
          className="flex items-center text-gray-600 hover:text-gray-900 mb-4"
        >
          <ArrowLeft className="h-5 w-5 mr-2" />
          Back to Dashboard
        </button>
        <h1 className="text-3xl font-bold text-gray-900">{getStatusTitle()}</h1>
        <p className="text-gray-600 mt-2">
          Showing {issues.length} {status === 'all' ? '' : status} issue{issues.length !== 1 ? 's' : ''}
        </p>
      </div>

      {/* Issues Grid */}
      {issues.length === 0 ? (
        <Card>
          <div className="text-center py-12">
            <p className="text-gray-500 text-lg">No {status !== 'all' ? status : ''} issues found</p>
            <Link
              to="/report-issue"
              className="mt-4 inline-block text-primary-600 hover:text-primary-700"
            >
              Report your first issue
            </Link>
          </div>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {issues.map((issue) => (
            <Card
              key={issue._id}
              className="hover:shadow-lg transition cursor-pointer"
              onClick={() => navigate(`/issue/${issue._id}`)}
            >
              {/* Issue Image */}
              {issue.imageUrl && (
                <div className="relative h-48 -mx-6 -mt-6 mb-4">
                  <img
                    src={issue.imageUrl}
                    alt={issue.title}
                    className="w-full h-full object-cover rounded-t-lg"
                  />
                  <div className="absolute top-2 right-2">
                    <Badge status={issue.status}>{issue.status}</Badge>
                  </div>
                </div>
              )}

              {/* Issue Content */}
              <div className="space-y-3">
                <div>
                  <span className="inline-block px-2 py-1 text-xs font-medium bg-blue-100 text-blue-800 rounded">
                    {issue.category}
                  </span>
                </div>

                <h3 className="font-semibold text-lg text-gray-900 line-clamp-2">
                  {issue.title || issue.description}
                </h3>

                <p className="text-gray-600 text-sm line-clamp-3">
                  {issue.description}
                </p>

                <div className="flex items-center justify-between pt-3 border-t border-gray-200">
                  <div className="flex items-center text-sm text-gray-500">
                    <Calendar className="h-4 w-4 mr-1" />
                    {new Date(issue.createdAt).toLocaleDateString()}
                  </div>
                  <div className="text-sm text-gray-500">
                    {issue.supportCount} supporter{issue.supportCount !== 1 ? 's' : ''}
                  </div>
                </div>

                {issue.address && (
                  <div className="flex items-center text-sm text-gray-500">
                    <MapPin className="h-4 w-4 mr-1 flex-shrink-0" />
                    <span className="truncate">{issue.address}</span>
                  </div>
                )}

                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    navigate(`/issue/${issue._id}`);
                  }}
                  className="w-full mt-2 flex items-center justify-center space-x-2 bg-primary-600 text-white px-4 py-2 rounded-lg hover:bg-primary-700 transition"
                >
                  <Eye className="h-4 w-4" />
                  <span>View Details</span>
                </button>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default MyIssues;
