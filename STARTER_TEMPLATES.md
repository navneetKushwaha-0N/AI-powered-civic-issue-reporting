# Starter Templates for Remaining Pages

Copy these templates to complete your application.

---

## Dashboard.jsx
`frontend/src/pages/Dashboard.jsx`

```jsx
import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { issueAPI } from '../services/api';
import Card from '../components/Card';
import Badge from '../components/Badge';
import { PlusCircle, AlertCircle, Clock, CheckCircle } from 'lucide-react';

const Dashboard = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState(null);
  const [issues, setIssues] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
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

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <Card className="flex items-center space-x-4">
          <div className="p-3 bg-blue-100 rounded-lg">
            <AlertCircle className="h-8 w-8 text-blue-600" />
          </div>
          <div>
            <p className="text-sm text-gray-500">Total Issues</p>
            <p className="text-2xl font-bold">{stats?.total || 0}</p>
          </div>
        </Card>

        <Card className="flex items-center space-x-4">
          <div className="p-3 bg-yellow-100 rounded-lg">
            <Clock className="h-8 w-8 text-yellow-600" />
          </div>
          <div>
            <p className="text-sm text-gray-500">Pending</p>
            <p className="text-2xl font-bold">{stats?.pending || 0}</p>
          </div>
        </Card>

        <Card className="flex items-center space-x-4">
          <div className="p-3 bg-blue-100 rounded-lg">
            <Clock className="h-8 w-8 text-blue-600" />
          </div>
          <div>
            <p className="text-sm text-gray-500">Processing</p>
            <p className="text-2xl font-bold">{stats?.processing || 0}</p>
          </div>
        </Card>

        <Card className="flex items-center space-x-4">
          <div className="p-3 bg-green-100 rounded-lg">
            <CheckCircle className="h-8 w-8 text-green-600" />
          </div>
          <div>
            <p className="text-sm text-gray-500">Resolved</p>
            <p className="text-2xl font-bold">{stats?.resolved || 0}</p>
          </div>
        </Card>
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
```

---

## ReportIssue.jsx
`frontend/src/pages/ReportIssue.jsx`

```jsx
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { issueAPI } from '../services/api';
import Input from '../components/Input';
import Button from '../components/Button';
import Card from '../components/Card';
import { MapPin, Image as ImageIcon, AlertCircle } from 'lucide-react';

const categories = [
  { value: 'pothole', label: 'Pothole' },
  { value: 'streetlight', label: 'Street Light' },
  { value: 'garbage', label: 'Garbage' },
  { value: 'drainage', label: 'Drainage' },
  { value: 'water_supply', label: 'Water Supply' },
  { value: 'road_damage', label: 'Road Damage' },
  { value: 'traffic_signal', label: 'Traffic Signal' },
  { value: 'illegal_parking', label: 'Illegal Parking' },
  { value: 'graffiti', label: 'Graffiti' },
  { value: 'other', label: 'Other' }
];

const ReportIssue = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [locationLoading, setLocationLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [formData, setFormData] = useState({
    description: '',
    category: '',
    latitude: '',
    longitude: '',
    address: '',
    image: null
  });
  const [imagePreview, setImagePreview] = useState(null);

  const handleGetLocation = () => {
    setLocationLoading(true);
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setFormData({
            ...formData,
            latitude: position.coords.latitude,
            longitude: position.coords.longitude
          });
          setLocationLoading(false);
        },
        (error) => {
          setError('Unable to get location. Please enable location services.');
          setLocationLoading(false);
        }
      );
    } else {
      setError('Geolocation is not supported by your browser');
      setLocationLoading(false);
    }
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 10 * 1024 * 1024) {
        setError('Image size should be less than 10MB');
        return;
      }
      setFormData({ ...formData, image: file });
      setImagePreview(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    if (!formData.image) {
      setError('Please upload an image');
      setLoading(false);
      return;
    }

    if (!formData.latitude || !formData.longitude) {
      setError('Please detect your location');
      setLoading(false);
      return;
    }

    const submitData = new FormData();
    submitData.append('image', formData.image);
    submitData.append('description', formData.description);
    submitData.append('latitude', formData.latitude);
    submitData.append('longitude', formData.longitude);
    if (formData.category) submitData.append('category', formData.category);
    if (formData.address) submitData.append('address', formData.address);

    try {
      const response = await issueAPI.createIssue(submitData);
      
      if (response.data.duplicate) {
        setSuccess(`Similar issue found! Your support has been added (Issue ID: ${response.data.data.existingIssueId})`);
        setTimeout(() => {
          navigate(`/issue/${response.data.data.existingIssueId}`);
        }, 2000);
      } else {
        setSuccess('Issue reported successfully!');
        setTimeout(() => {
          navigate('/dashboard');
        }, 2000);
      }
    } catch (error) {
      setError(error.response?.data?.message || 'Failed to report issue');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-3xl font-bold text-gray-900 mb-8">Report Civic Issue</h1>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg mb-6">
          {error}
        </div>
      )}

      {success && (
        <div className="bg-green-50 border border-green-200 text-green-600 px-4 py-3 rounded-lg mb-6">
          {success}
        </div>
      )}

      <form onSubmit={handleSubmit}>
        <Card className="mb-6">
          <h3 className="text-lg font-semibold mb-4">Issue Details</h3>

          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Upload Image *
            </label>
            <div className="flex items-center space-x-4">
              <label className="cursor-pointer bg-gray-100 hover:bg-gray-200 text-gray-700 px-4 py-2 rounded-lg transition flex items-center space-x-2">
                <ImageIcon className="h-5 w-5" />
                <span>Choose Image</span>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageChange}
                  className="hidden"
                  required
                />
              </label>
            </div>
            {imagePreview && (
              <div className="mt-4">
                <img src={imagePreview} alt="Preview" className="max-w-xs rounded-lg shadow-md" />
              </div>
            )}
          </div>

          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Category (Optional - AI will predict)
            </label>
            <select
              name="category"
              value={formData.category}
              onChange={(e) => setFormData({ ...formData, category: e.target.value })}
              className="input-field"
            >
              <option value="">Let AI predict</option>
              {categories.map((cat) => (
                <option key={cat.value} value={cat.value}>
                  {cat.label}
                </option>
              ))}
            </select>
          </div>

          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Description *
            </label>
            <textarea
              name="description"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              required
              rows="4"
              className="input-field"
              placeholder="Describe the issue in detail"
            />
          </div>

          <Input
            label="Address (Optional)"
            name="address"
            value={formData.address}
            onChange={(e) => setFormData({ ...formData, address: e.target.value })}
            placeholder="Street address or landmark"
          />
        </Card>

        <Card className="mb-6">
          <h3 className="text-lg font-semibold mb-4">Location</h3>

          <Button
            type="button"
            onClick={handleGetLocation}
            disabled={locationLoading}
            variant="outline"
            className="mb-4"
          >
            <MapPin className="h-5 w-5 mr-2" />
            {locationLoading ? 'Detecting...' : 'Auto-Detect My Location'}
          </Button>

          {formData.latitude && formData.longitude && (
            <div className="bg-green-50 p-4 rounded-lg">
              <p className="text-sm text-green-800">
                <strong>Location detected:</strong> {formData.latitude.toFixed(6)}, {formData.longitude.toFixed(6)}
              </p>
            </div>
          )}
        </Card>

        <div className="flex space-x-4">
          <Button type="submit" disabled={loading} className="flex-1">
            {loading ? 'Submitting...' : 'Submit Issue'}
          </Button>
          <Button
            type="button"
            variant="secondary"
            onClick={() => navigate('/dashboard')}
          >
            Cancel
          </Button>
        </div>
      </form>
    </div>
  );
};

export default ReportIssue;
```

---

## IssueDetails.jsx
`frontend/src/pages/IssueDetails.jsx`

```jsx
import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import { issueAPI } from '../services/api';
import Card from '../components/Card';
import Badge from '../components/Badge';
import Button from '../components/Button';
import { MapPin, Users, Calendar, ThumbsUp } from 'lucide-react';
import 'leaflet/dist/leaflet.css';

const IssueDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [issue, setIssue] = useState(null);
  const [loading, setLoading] = useState(true);
  const [supportLoading, setSupportLoading] = useState(false);

  useEffect(() => {
    fetchIssueDetails();
  }, [id]);

  const fetchIssueDetails = async () => {
    try {
      const response = await issueAPI.getIssueById(id);
      setIssue(response.data.data.issue);
    } catch (error) {
      console.error('Error fetching issue:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSupport = async () => {
    setSupportLoading(true);
    try {
      await issueAPI.supportIssue(id);
      fetchIssueDetails(); // Refresh data
    } catch (error) {
      alert(error.response?.data?.message || 'Failed to support issue');
    } finally {
      setSupportLoading(false);
    }
  };

  if (loading) {
    return <div className="flex justify-center items-center h-screen">Loading...</div>;
  }

  if (!issue) {
    return <div className="text-center py-8">Issue not found</div>;
  }

  const position = [issue.location.coordinates[1], issue.location.coordinates[0]];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <Button onClick={() => navigate(-1)} variant="outline" className="mb-6">
        ← Back
      </Button>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Left Column - Details */}
        <div className="space-y-6">
          <Card>
            <div className="flex justify-between items-start mb-4">
              <h1 className="text-2xl font-bold text-gray-900 capitalize">
                {issue.category.replace('_', ' ')}
              </h1>
              <Badge status={issue.status}>{issue.status}</Badge>
            </div>

            <img
              src={issue.imageUrl}
              alt="Issue"
              className="w-full rounded-lg mb-4"
            />

            <div className="space-y-3">
              <div className="flex items-start space-x-2">
                <MapPin className="h-5 w-5 text-gray-400 mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-gray-700">Location</p>
                  <p className="text-sm text-gray-500">
                    {issue.address || `${position[0].toFixed(4)}, ${position[1].toFixed(4)}`}
                  </p>
                </div>
              </div>

              <div className="flex items-start space-x-2">
                <Users className="h-5 w-5 text-gray-400 mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-gray-700">Reported By</p>
                  <p className="text-sm text-gray-500">{issue.reporterId.name}</p>
                </div>
              </div>

              <div className="flex items-start space-x-2">
                <Calendar className="h-5 w-5 text-gray-400 mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-gray-700">Reported On</p>
                  <p className="text-sm text-gray-500">
                    {new Date(issue.createdAt).toLocaleString()}
                  </p>
                </div>
              </div>

              <div className="flex items-start space-x-2">
                <ThumbsUp className="h-5 w-5 text-gray-400 mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-gray-700">Support Count</p>
                  <p className="text-sm text-gray-500">{issue.supportCount} supporters</p>
                </div>
              </div>
            </div>

            <div className="mt-6">
              <h3 className="font-semibold text-gray-900 mb-2">Description</h3>
              <p className="text-gray-700">{issue.description}</p>
            </div>

            <div className="mt-6">
              <Button
                onClick={handleSupport}
                disabled={supportLoading}
                variant="success"
                className="w-full"
              >
                {supportLoading ? 'Adding Support...' : 'Support This Issue'}
              </Button>
            </div>
          </Card>
        </div>

        {/* Right Column - Map */}
        <div>
          <Card title="Location on Map">
            <div className="h-96 rounded-lg overflow-hidden">
              <MapContainer
                center={position}
                zoom={15}
                style={{ height: '100%', width: '100%' }}
              >
                <TileLayer
                  url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                  attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
                />
                <Marker position={position}>
                  <Popup>{issue.category.replace('_', ' ')}</Popup>
                </Marker>
              </MapContainer>
            </div>
          </Card>

          {issue.mlConfidence && (
            <Card title="AI Prediction" className="mt-6">
              <p className="text-sm text-gray-600 mb-2">
                Predicted Category: <strong className="text-gray-900 capitalize">{issue.category.replace('_', ' ')}</strong>
              </p>
              <p className="text-sm text-gray-600">
                Confidence: <strong className="text-gray-900">{(issue.mlConfidence * 100).toFixed(1)}%</strong>
              </p>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
};

export default IssueDetails;
```

---

## Admin Pages (Simplified Templates)

### AdminDashboard.jsx
`frontend/src/pages/admin/AdminDashboard.jsx`

```jsx
import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { issueAPI } from '../../services/api';
import Card from '../../components/Card';
import { AlertCircle, Users, CheckCircle, Clock } from 'lucide-react';

const AdminDashboard = () => {
  const [stats, setStats] = useState(null);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const response = await issueAPI.getDashboardStats();
      setStats(response.data.data);
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-3xl font-bold mb-8">Admin Dashboard</h1>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <Card>
          <div className="flex items-center space-x-4">
            <AlertCircle className="h-10 w-10 text-blue-600" />
            <div>
              <p className="text-gray-500">Total Issues</p>
              <p className="text-3xl font-bold">{stats?.total || 0}</p>
            </div>
          </div>
        </Card>

        <Card>
          <div className="flex items-center space-x-4">
            <Clock className="h-10 w-10 text-yellow-600" />
            <div>
              <p className="text-gray-500">Pending</p>
              <p className="text-3xl font-bold">{stats?.pending || 0}</p>
            </div>
          </div>
        </Card>

        <Card>
          <div className="flex items-center space-x-4">
            <Users className="h-10 w-10 text-blue-600" />
            <div>
              <p className="text-gray-500">Processing</p>
              <p className="text-3xl font-bold">{stats?.processing || 0}</p>
            </div>
          </div>
        </Card>

        <Card>
          <div className="flex items-center space-x-4">
            <CheckCircle className="h-10 w-10 text-green-600" />
            <div>
              <p className="text-gray-500">Resolved</p>
              <p className="text-3xl font-bold">{stats?.resolved || 0}</p>
            </div>
          </div>
        </Card>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Link to="/admin/issues" className="card hover:shadow-lg transition">
          <h3 className="font-semibold text-lg">Manage Issues</h3>
          <p className="text-gray-500 mt-2">View and update all issues</p>
        </Link>

        <Link to="/admin/analytics" className="card hover:shadow-lg transition">
          <h3 className="font-semibold text-lg">Analytics</h3>
          <p className="text-gray-500 mt-2">View charts and statistics</p>
        </Link>

        <Link to="/admin/map" className="card hover:shadow-lg transition">
          <h3 className="font-semibold text-lg">Map View</h3>
          <p className="text-gray-500 mt-2">Visualize issues on map</p>
        </Link>
      </div>
    </div>
  );
};

export default AdminDashboard;
```

### AllIssues.jsx, Analytics.jsx, MapView.jsx
Create similar templates following the same pattern - fetch data from API, display in tables/charts/maps.

---

## Constants and Utils

### constants.js
`frontend/src/utils/constants.js`

```jsx
export const ISSUE_CATEGORIES = {
  pothole: 'Pothole',
  streetlight: 'Street Light',
  garbage: 'Garbage',
  drainage: 'Drainage',
  water_supply: 'Water Supply',
  road_damage: 'Road Damage',
  traffic_signal: 'Traffic Signal',
  illegal_parking: 'Illegal Parking',
  graffiti: 'Graffiti',
  other: 'Other'
};

export const ISSUE_STATUSES = {
  pending: 'Pending',
  processing: 'Processing',
  resolved: 'Resolved',
  rejected: 'Rejected'
};
```

### useGeolocation.js
`frontend/src/hooks/useGeolocation.js`

```jsx
import { useState, useEffect } from 'react';

export const useGeolocation = () => {
  const [location, setLocation] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  const getLocation = () => {
    setLoading(true);
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setLocation({
            latitude: position.coords.latitude,
            longitude: position.coords.longitude
          });
          setLoading(false);
        },
        (err) => {
          setError(err.message);
          setLoading(false);
        }
      );
    } else {
      setError('Geolocation not supported');
      setLoading(false);
    }
  };

  return { location, error, loading, getLocation };
};
```

---

## Instructions

1. Copy each template to its respective file path
2. Customize styling and logic as needed
3. Add error handling and loading states
4. Test each component individually
5. Connect to your backend API

The templates provide the complete structure - you just need to create the files!
