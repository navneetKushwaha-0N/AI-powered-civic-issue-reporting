import { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { issueAPI } from '../../services/api';
import Card from '../../components/Card';
import Badge from '../../components/Badge';

const AllIssues = () => {
  const [issues, setIssues] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('');
  const [assigning, setAssigning] = useState({});
  const location = useLocation();

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const status = params.get('status') || '';
    setStatusFilter(status);
    fetchIssues(status);
  }, [location.search]);

  const fetchIssues = async (status) => {
    try {
      const response = await issueAPI.getAllIssues(status ? { status } : {});
      setIssues(response.data.data.issues);
    } catch (error) {
      console.error('Error fetching issues:', error);
    } finally {
      setLoading(false);
    }
  };

  const changeStatus = async (id, status) => {
    await issueAPI.updateIssueStatus(id, { status });
    fetchIssues(statusFilter);
  };

  const changeCategory = async (id, category) => {
    await issueAPI.updateIssueCategory(id, { category });
    fetchIssues(statusFilter);
  };

  const assignWorker = async (id, name) => {
    setAssigning(prev => ({ ...prev, [id]: true }));
    try {
      await issueAPI.assignIssue(id, { assignedTo: name });
      fetchIssues(statusFilter);
    } finally {
      setAssigning(prev => ({ ...prev, [id]: false }));
    }
  };

  if (loading) {
    return <div className="flex justify-center items-center h-screen">Loading...</div>;
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-3xl font-bold text-gray-900 mb-8">All Issues</h1>

      <Card>
        <div className="flex items-center space-x-2 p-4 border-b border-gray-100">
          {['', 'pending', 'processing', 'resolved'].map(s => (
            <button key={s || 'all'} onClick={() => { setStatusFilter(s); setLoading(true); fetchIssues(s); }} className={`px-3 py-1 rounded-md text-sm ${statusFilter===s? 'bg-primary-600 text-white':'bg-gray-100 text-gray-700'}`}>
              {s ? s.charAt(0).toUpperCase()+s.slice(1) : 'All'}
            </button>
          ))}
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">ID</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Category</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Reporter</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Support</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Assigned To</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {issues.map((issue) => (
                <tr key={issue._id}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {issue._id.slice(-6)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    <select value={issue.category} onChange={(e)=>changeCategory(issue._id, e.target.value)} className="border border-gray-300 rounded-md p-1 bg-white text-sm">
                      {['pothole','streetlight','garbage','drainage','water_supply','road_damage','traffic_signal','illegal_parking','graffiti','other','Garbage Issue','Road Damage / Pothole','Street Light Failure','Water Leakage','Sewer Overflow','Other'].map(c=> (
                        <option key={c} value={c}>{c.replace('_',' ')}</option>
                      ))}
                    </select>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {issue.reporterId?.name || 'Unknown User'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <select value={issue.status} onChange={(e)=>changeStatus(issue._id, e.target.value)} className="border border-gray-300 rounded-md p-1 bg-white text-sm">
                      <option value="pending">pending</option>
                      <option value="processing">processing</option>
                      <option value="resolved">resolved</option>
                      <option value="rejected">rejected</option>
                    </select>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {issue.supportCount}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    <div className="flex items-center space-x-2">
                      <input defaultValue={issue.assignedTo || ''} onBlur={(e)=>{ if(e.target.value && e.target.value!==issue.assignedTo) assignWorker(issue._id, e.target.value); }} placeholder="Assign worker name" className="border border-gray-300 rounded-md p-1 bg-white" />
                      {assigning[issue._id] && <span className="text-xs text-gray-400">Saving...</span>}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {new Date(issue.createdAt).toLocaleDateString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
};

export default AllIssues;
