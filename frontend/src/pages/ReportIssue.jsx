import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { issueAPI } from '../services/api';
import Input from '../components/Input';
import Button from '../components/Button';
import Card from '../components/Card';
import { MapPin, Image as ImageIcon } from 'lucide-react';

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
