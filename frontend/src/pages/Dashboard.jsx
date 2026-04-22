import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { issueAPI } from '../services/api';
import { PlusCircle, AlertCircle, Clock, CheckCircle, ArrowRight } from 'lucide-react';

const Dashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [stats, setStats] = useState(null);
  const [issues, setIssues] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user?.id) fetchData();
  }, [user?.id]);

  const fetchData = async () => {
    try {
      const [statsRes, issuesRes] = await Promise.all([
        issueAPI.getDashboardStats(),
        issueAPI.getUserIssues(user.id)
      ]);
      setStats(statsRes.data.data);
      setIssues(issuesRes.data.data.issues);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#0b1220]">
        <div className="h-10 w-10 border-2 border-white/20 border-t-white rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0b1220] relative overflow-hidden px-4 py-10">

      {/* balanced bg */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(99,102,241,0.15),transparent_40%),radial-gradient(circle_at_80%_80%,rgba(14,165,233,0.15),transparent_40%)]"></div>

      <div className="max-w-7xl mx-auto relative z-10">

        {/* header */}
        <div className="flex justify-between items-center mb-10">
          <div>
            <h1 className="text-3xl font-semibold text-white">Dashboard</h1>
            <p className="text-gray-400 text-sm">Overview of your activity</p>
          </div>

          <Link
            to="/report-issue"
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-indigo-500 to-cyan-500 text-white shadow-lg hover:opacity-90 transition"
          >
            <PlusCircle className="h-5 w-5" />
            Report Issue
          </Link>
        </div>

        {/* stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-10">

          {[
            { label: 'Total', value: stats?.total, icon: AlertCircle },
            { label: 'Pending', value: stats?.pending, icon: Clock },
            { label: 'Processing', value: stats?.processing, icon: Clock },
            { label: 'Resolved', value: stats?.resolved, icon: CheckCircle }
          ].map((item, i) => {
            const Icon = item.icon;
            return (
              <div
                key={i}
                onClick={() => navigate(`/my-issues/${item.label.toLowerCase()}`)}
                className="cursor-pointer p-5 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-xl hover:scale-[1.02] transition"
              >
                <div className="flex justify-between items-center">
                  <div>
                    <p className="text-gray-400 text-sm">{item.label}</p>
                    <p className="text-2xl font-semibold text-white mt-1">
                      {item.value || 0}
                    </p>
                  </div>
                  <div className="p-3 rounded-xl bg-white/10">
                    <Icon className="h-5 w-5 text-white" />
                  </div>
                </div>
              </div>
            );
          })}

        </div>

        {/* table */}
        <div className="rounded-3xl bg-white/5 border border-white/10 backdrop-blur-xl overflow-hidden">

          <div className="p-6 border-b border-white/10">
            <h2 className="text-white font-medium">Recent Issues</h2>
          </div>

          {issues.length === 0 ? (
            <div className="p-10 text-center text-gray-400">
              No issues yet
            </div>
          ) : (
            <div className="overflow-x-auto">

              <table className="w-full text-sm text-left">
                <thead className="text-gray-400 border-b border-white/10">
                  <tr>
                    <th className="px-6 py-4">Category</th>
                    <th className="px-6 py-4">Description</th>
                    <th className="px-6 py-4">Status</th>
                    <th className="px-6 py-4">Support</th>
                    <th className="px-6 py-4">Date</th>
                    <th className="px-6 py-4">Action</th>
                  </tr>
                </thead>

                <tbody>
                  {issues.map((issue) => (
                    <tr
                      key={issue._id}
                      className="border-b border-white/5 hover:bg-white/5 transition"
                    >
                      <td className="px-6 py-4 text-white capitalize">
                        {issue.category.replace('_', ' ')}
                      </td>

                      <td className="px-6 py-4 text-gray-400 max-w-xs truncate">
                        {issue.description}
                      </td>

                      <td className="px-6 py-4">
                        <span className="px-2 py-1 rounded-lg text-xs bg-white/10 text-white">
                          {issue.status}
                        </span>
                      </td>

                      <td className="px-6 py-4 text-gray-400">
                        {issue.supportCount}
                      </td>

                      <td className="px-6 py-4 text-gray-400">
                        {new Date(issue.createdAt).toLocaleDateString()}
                      </td>

                      <td className="px-6 py-4">
                        <Link
                          to={`/issue/${issue._id}`}
                          className="text-indigo-400 hover:text-indigo-300"
                        >
                          View
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>

              </table>

            </div>
          )}
        </div>

      </div>
    </div>
  );
};

export default Dashboard;