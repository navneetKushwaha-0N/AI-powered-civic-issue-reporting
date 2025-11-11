import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { issueAPI } from '../../services/api';
import Card from '../../components/Card';
import Badge from '../../components/Badge';
import AdminIssueDetailsModal from '../../components/AdminIssueDetailsModal';
import { Search, Filter, Eye, CheckCircle, Clock, XCircle, FileText } from 'lucide-react';
import { toast } from 'react-hot-toast';

const ManageIssues = () => {
  const [issues, setIssues] = useState([]);
  const [filteredIssues, setFilteredIssues] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [selectedIssue, setSelectedIssue] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [updating, setUpdating] = useState(false);
  const [detailsModalIssueId, setDetailsModalIssueId] = useState(null);

  useEffect(() => {
    fetchIssues();
  }, []);

  useEffect(() => {
    filterIssues();
  }, [searchTerm, statusFilter, categoryFilter, issues]);

  const fetchIssues = async () => {
    try {
      setLoading(true);
      const response = await issueAPI.getAllIssues();
      setIssues(response.data.data.issues);
      setFilteredIssues(response.data.data.issues);
    } catch (error) {
      console.error('Error fetching issues:', error);
      toast.error('Failed to fetch issues');
    } finally {
      setLoading(false);
    }
  };

  const filterIssues = () => {
    let filtered = [...issues];

    if (searchTerm) {
      filtered = filtered.filter(issue =>
        issue.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        issue.category.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (statusFilter) {
      filtered = filtered.filter(issue => issue.status === statusFilter);
    }

    if (categoryFilter) {
      filtered = filtered.filter(issue => issue.category === categoryFilter);
    }

    setFilteredIssues(filtered);
  };

  const handleStatusUpdate = async (issueId, newStatus) => {
    try {
      setUpdating(true);
      await issueAPI.updateIssueStatus(issueId, { status: newStatus });
      toast.success(`Issue status updated to ${newStatus}`);
      fetchIssues(); // Refresh list
      setShowModal(false);
    } catch (error) {
      console.error('Error updating status:', error);
      toast.error('Failed to update status');
    } finally {
      setUpdating(false);
    }
  };

  const getNextStatus = (currentStatus) => {
    switch(currentStatus) {
      case 'pending': return 'processing';
      case 'processing': return 'resolved';
      default: return null;
    }
  };

  const getStatusButton = (issue) => {
    const nextStatus = getNextStatus(issue.status);
    
    if (!nextStatus) {
      return (
        <span className="text-sm text-gray-500">No action available</span>
      );
    }

    return (
      <button
        onClick={() => handleStatusUpdate(issue._id, nextStatus)}
        disabled={updating}
        className={`flex items-center space-x-1 px-3 py-1 rounded text-sm font-medium transition ${
          nextStatus === 'processing'
            ? 'bg-blue-100 text-blue-700 hover:bg-blue-200'
            : 'bg-green-100 text-green-700 hover:bg-green-200'
        } ${updating ? 'opacity-50 cursor-not-allowed' : ''}`}
      >
        {nextStatus === 'processing' ? (
          <>
            <Clock className="h-4 w-4" />
            <span>Mark as Processing</span>
          </>
        ) : (
          <>
            <CheckCircle className="h-4 w-4" />
            <span>Mark as Resolved</span>
          </>
        )}
      </button>
    );
  };

  const categories = [...new Set(issues.map(i => i.category))];

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
        <h1 className="text-3xl font-bold text-gray-900">Manage Issues</h1>
        <p className="text-gray-600 mt-2">View and manage all reported issues</p>
      </div>

      {/* Filters */}
      <Card className="mb-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search issues..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            />
          </div>

          {/* Status Filter */}
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
          >
            <option value="">All Status</option>
            <option value="pending">Pending</option>
            <option value="processing">Processing</option>
            <option value="resolved">Resolved</option>
            <option value="rejected">Rejected</option>
          </select>

          {/* Category Filter */}
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
          >
            <option value="">All Categories</option>
            {categories.map(cat => (
              <option key={cat} value={cat}>{cat}</option>
            ))}
          </select>
        </div>

        <div className="mt-4 flex items-center justify-between">
          <p className="text-sm text-gray-600">
            Showing {filteredIssues.length} of {issues.length} issues
          </p>
          <button
            onClick={() => {
              setSearchTerm('');
              setStatusFilter('');
              setCategoryFilter('');
            }}
            className="text-sm text-primary-600 hover:text-primary-700"
          >
            Clear Filters
          </button>
        </div>
      </Card>

      {/* Issues Table */}
      <Card>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Issue
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Reporter
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Support
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Date
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredIssues.length === 0 ? (
                <tr>
                  <td colSpan="6" className="px-6 py-8 text-center text-gray-500">
                    No issues found
                  </td>
                </tr>
              ) : (
                filteredIssues.map((issue) => (
                  <tr key={issue._id} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <div className="flex items-center space-x-3">
                        {issue.imageUrl && (
                          <img
                            src={issue.imageUrl}
                            alt="Issue"
                            className="h-12 w-12 rounded object-cover"
                          />
                        )}
                        <div>
                          <p className="text-sm font-medium text-gray-900 line-clamp-1">
                            {issue.description}
                          </p>
                          <p className="text-xs text-gray-500">{issue.category}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <p className="text-sm text-gray-900">
                        {issue.reporterId?.name || 'Unknown'}
                      </p>
                      <p className="text-xs text-gray-500">
                        {issue.reporterId?.email}
                      </p>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <Badge status={issue.status}>{issue.status}</Badge>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {issue.supportCount}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(issue.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => setDetailsModalIssueId(issue._id)}
                          className="text-primary-600 hover:text-primary-900 transition"
                          title="View Details"
                        >
                          <FileText className="h-5 w-5" />
                        </button>
                        <Link
                          to={`/issue/${issue._id}`}
                          className="text-blue-600 hover:text-blue-900"
                          title="Public View"
                        >
                          <Eye className="h-5 w-5" />
                        </Link>
                        <div onClick={(e) => e.stopPropagation()}>
                          {getStatusButton(issue)}
                        </div>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Admin Issue Details Modal */}
      {detailsModalIssueId && (
        <AdminIssueDetailsModal
          issueId={detailsModalIssueId}
          onClose={() => setDetailsModalIssueId(null)}
        />
      )}
    </div>
  );
};

export default ManageIssues;
