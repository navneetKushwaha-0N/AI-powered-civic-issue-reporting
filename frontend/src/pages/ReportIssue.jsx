import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { issueAPI } from '../services/api';
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
  const [imagePreview, setImagePreview] = useState(null);

  const [formData, setFormData] = useState({
    description: '',
    category: '',
    latitude: '',
    longitude: '',
    address: '',
    image: null
  });

  const handleGetLocation = () => {
    setLocationLoading(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setFormData({
          ...formData,
          latitude: pos.coords.latitude,
          longitude: pos.coords.longitude
        });
        setLocationLoading(false);
      },
      () => {
        setError('Enable location access');
        setLocationLoading(false);
      }
    );
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setFormData({ ...formData, image: file });
    setImagePreview(URL.createObjectURL(file));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    if (!formData.image) {
      setError('Upload image');
      setLoading(false);
      return;
    }

    if (!formData.latitude) {
      setError('Detect location');
      setLoading(false);
      return;
    }

    const data = new FormData();
    Object.entries(formData).forEach(([k, v]) => v && data.append(k, v));

    try {
      await issueAPI.createIssue(data);
      setSuccess('Issue submitted');
      setTimeout(() => navigate('/dashboard'), 1500);
    } catch {
      setError('Submission failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0b1220] relative overflow-hidden px-4 py-12">

      {/* balanced premium background */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_15%_20%,rgba(99,102,241,0.25),transparent_40%),radial-gradient(circle_at_85%_80%,rgba(14,165,233,0.25),transparent_40%),linear-gradient(to_bottom,#0b1220,#0f172a)]"></div>

      <div className="max-w-4xl mx-auto relative z-10">

        {/* title */}
        <div className="mb-10 text-center">
          <h1 className="text-4xl font-semibold text-white tracking-tight">
            Report an Issue
          </h1>
          <p className="text-gray-400 mt-2 text-sm">
            Help improve your city by reporting problems
          </p>
        </div>

        {error && (
          <div className="mb-6 text-red-400 bg-red-500/10 border border-red-500/20 px-4 py-3 rounded-2xl">
            {error}
          </div>
        )}

        {success && (
          <div className="mb-6 text-green-400 bg-green-500/10 border border-green-500/20 px-4 py-3 rounded-2xl">
            {success}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-8">

          {/* main card */}
          <div className="p-8 rounded-3xl backdrop-blur-2xl bg-white/5 border border-white/10 shadow-[0_20px_60px_rgba(0,0,0,0.5)]">

            {/* image */}
            <div className="mb-6">
              <label className="text-sm text-gray-300">Upload Image</label>

              <label className="mt-3 flex flex-col items-center justify-center gap-3 cursor-pointer h-44 rounded-2xl border border-dashed border-white/20 hover:border-white/40 transition bg-white/5">
                <ImageIcon className="h-6 w-6 text-gray-400" />
                <span className="text-sm text-gray-400">Click to upload</span>
                <input type="file" className="hidden" onChange={handleImageChange} />
              </label>

              {imagePreview && (
                <img src={imagePreview} className="mt-4 rounded-xl max-h-72 object-cover" />
              )}
            </div>

            {/* fields */}
            <div className="grid md:grid-cols-2 gap-4">

              <select
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                className="px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-gray-300"
              >
                <option value="">AI Category</option>
                {categories.map(c => (
                  <option key={c.value} value={c.value}>{c.label}</option>
                ))}
              </select>

              <input
                placeholder="Address (optional)"
                value={formData.address}
                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                className="px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-gray-400"
              />

            </div>

            <textarea
              rows="4"
              placeholder="Describe the issue clearly..."
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="mt-4 w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-gray-400"
            />

          </div>

          {/* location */}
          <div className="p-6 rounded-3xl backdrop-blur-2xl bg-white/5 border border-white/10 flex items-center justify-between">

            <div>
              <p className="text-white text-sm">Location</p>
              <p className="text-gray-500 text-xs">
                {formData.latitude ? 'Detected successfully' : 'Not detected'}
              </p>
            </div>

            <button
              type="button"
              onClick={handleGetLocation}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-indigo-500 to-cyan-500 text-white shadow-md"
            >
              <MapPin className="h-4 w-4" />
              {locationLoading ? 'Detecting...' : 'Detect'}
            </button>

          </div>

          {/* actions */}
          <div className="flex gap-4">

            <button
              type="submit"
              disabled={loading}
              className="flex-1 py-3 rounded-xl bg-gradient-to-r from-indigo-500 via-purple-500 to-cyan-500 text-white font-medium shadow-lg hover:opacity-90 transition"
            >
              {loading ? 'Submitting...' : 'Submit Issue'}
            </button>

            <button
              type="button"
              onClick={() => navigate('/dashboard')}
              className="px-6 py-3 rounded-xl border border-white/10 text-gray-300 hover:bg-white/5 transition"
            >
              Cancel
            </button>

          </div>

        </form>
      </div>
    </div>
  );
};

export default ReportIssue;