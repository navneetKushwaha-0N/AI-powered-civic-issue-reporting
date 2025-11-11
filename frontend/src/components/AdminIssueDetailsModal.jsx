import { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import { X, MapPin, Calendar, User, Mail, Phone, Users, Image as ImageIcon, AlertCircle } from 'lucide-react';
import { issueAPI } from '../services/api';
import Badge from './Badge';
import { toast } from 'react-hot-toast';
import L from 'leaflet';

// Fix default marker icon issue in Leaflet
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

const AdminIssueDetailsModal = ({ issueId, onClose }) => {
  const [issueData, setIssueData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [imageZoomed, setImageZoomed] = useState(false);

  useEffect(() => {
    if (issueId) {
      fetchIssueDetails();
    }
  }, [issueId]);

  const fetchIssueDetails = async () => {
    try {
      setLoading(true);
      const response = await issueAPI.getIssueDetails(issueId);
      setIssueData(response.data.data);
    } catch (error) {
      console.error('Error fetching issue details:', error);
      toast.error('Failed to load issue details');
    } finally {
      setLoading(false);
    }
  };

  if (!issueId) return null;

  const handleBackdropClick = (e) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  if (loading) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50" onClick={handleBackdropClick}>
        <div className="bg-white rounded-lg p-8">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
        </div>
      </div>
    );
  }

  if (!issueData) return null;

  const { issue, supporters, nearbyIssues } = issueData;
  const [longitude, latitude] = issue.location.coordinates;

  return (
    <>
      {/* Main Modal */}
      <div 
        className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 overflow-y-auto p-4"
        onClick={handleBackdropClick}
      >
        <div className="bg-white rounded-lg shadow-xl max-w-6xl w-full max-h-[90vh] overflow-y-auto my-8">
          {/* Header */}
          <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between z-10">
            <h2 className="text-2xl font-bold text-gray-900">Issue Details</h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 transition"
            >
              <X className="h-6 w-6" />
            </button>
          </div>

          <div className="p-6 space-y-6">
            {/* 1. Issue Information */}
            <section className="bg-gray-50 rounded-lg p-6">
              <h3 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
                <AlertCircle className="h-5 w-5 mr-2 text-primary-600" />
                Issue Information
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {issue.title && (
                  <div>
                    <p className="text-sm font-medium text-gray-500">Title</p>
                    <p className="text-base text-gray-900">{issue.title}</p>
                  </div>
                )}
                <div>
                  <p className="text-sm font-medium text-gray-500">Category</p>
                  <p className="text-base text-gray-900 capitalize">{issue.category.replace('_', ' ')}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">Status</p>
                  <Badge status={issue.status}>{issue.status}</Badge>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">Date Reported</p>
                  <p className="text-base text-gray-900 flex items-center">
                    <Calendar className="h-4 w-4 mr-1" />
                    {new Date(issue.createdAt).toLocaleString()}
                  </p>
                </div>
                {issue.resolvedAt && (
                  <div>
                    <p className="text-sm font-medium text-gray-500">Resolved Date</p>
                    <p className="text-base text-gray-900">
                      {new Date(issue.resolvedAt).toLocaleString()}
                    </p>
                  </div>
                )}
                {issue.assignedTo && (
                  <div>
                    <p className="text-sm font-medium text-gray-500">Assigned To</p>
                    <p className="text-base text-gray-900">{issue.assignedTo}</p>
                  </div>
                )}
              </div>
              <div className="mt-4">
                <p className="text-sm font-medium text-gray-500">Description</p>
                <p className="text-base text-gray-900 mt-1">{issue.description}</p>
              </div>
              {issue.address && (
                <div className="mt-4">
                  <p className="text-sm font-medium text-gray-500">Location Address</p>
                  <p className="text-base text-gray-900 flex items-center mt-1">
                    <MapPin className="h-4 w-4 mr-1" />
                    {issue.address}
                  </p>
                </div>
              )}
              {issue.adminNotes && (
                <div className="mt-4 bg-yellow-50 border border-yellow-200 rounded p-3">
                  <p className="text-sm font-medium text-yellow-800">Admin Notes</p>
                  <p className="text-sm text-yellow-700 mt-1">{issue.adminNotes}</p>
                </div>
              )}
              {issue.mlConfidence && (
                <div className="mt-4">
                  <p className="text-sm font-medium text-gray-500">ML Confidence</p>
                  <p className="text-base text-gray-900">{(issue.mlConfidence * 100).toFixed(1)}%</p>
                </div>
              )}
            </section>

            {/* 2. Image & Location */}
            <section className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Image */}
              <div className="bg-gray-50 rounded-lg p-6">
                <h3 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
                  <ImageIcon className="h-5 w-5 mr-2 text-primary-600" />
                  Issue Photo
                </h3>
                <div className="relative">
                  <img
                    src={issue.imageUrl}
                    alt="Issue"
                    className="w-full h-64 object-cover rounded-lg cursor-pointer hover:opacity-90 transition"
                    onClick={() => setImageZoomed(true)}
                  />
                  <p className="text-xs text-gray-500 mt-2 text-center">Click to zoom</p>
                </div>
              </div>

              {/* Map */}
              <div className="bg-gray-50 rounded-lg p-6">
                <h3 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
                  <MapPin className="h-5 w-5 mr-2 text-primary-600" />
                  Location Map
                </h3>
                <div className="h-64 rounded-lg overflow-hidden">
                  <MapContainer
                    center={[latitude, longitude]}
                    zoom={16}
                    style={{ height: '100%', width: '100%' }}
                    scrollWheelZoom={false}
                  >
                    <TileLayer
                      attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                      url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                    />
                    <Marker position={[latitude, longitude]}>
                      <Popup>
                        <div className="text-sm">
                          <p className="font-semibold">{issue.category}</p>
                          <p className="text-gray-600">{issue.description.substring(0, 50)}...</p>
                        </div>
                      </Popup>
                    </Marker>
                  </MapContainer>
                </div>
                <p className="text-xs text-gray-500 mt-2">
                  Coordinates: {latitude.toFixed(6)}, {longitude.toFixed(6)}
                </p>
              </div>
            </section>

            {/* 3. Support Details */}
            <section className="bg-gray-50 rounded-lg p-6">
              <h3 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
                <Users className="h-5 w-5 mr-2 text-primary-600" />
                Support Details
              </h3>
              <div className="mb-4">
                <p className="text-lg font-medium text-gray-700">
                  Supported by {issue.supportCount} {issue.supportCount === 1 ? 'user' : 'users'}
                </p>
              </div>
              
              {supporters && supporters.length > 0 ? (
                <div className="space-y-2">
                  <p className="text-sm font-medium text-gray-500 mb-2">Supporter List:</p>
                  <div className="bg-white rounded-lg border border-gray-200 divide-y divide-gray-200 max-h-64 overflow-y-auto">
                    {supporters.map((supporter, index) => (
                      <div key={index} className="p-3 hover:bg-gray-50 transition">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <p className="text-sm font-medium text-gray-900">{supporter.name}</p>
                            <p className="text-xs text-gray-500">{supporter.email}</p>
                          </div>
                          <div className="text-right ml-4">
                            <p className="text-xs text-gray-400">
                              {new Date(supporter.supportedAt).toLocaleDateString()}
                            </p>
                            <p className="text-xs text-gray-400">
                              {new Date(supporter.supportedAt).toLocaleTimeString()}
                            </p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <p className="text-sm text-gray-500">No supporters yet</p>
              )}
            </section>

            {/* 4. Reporter Details */}
            <section className="bg-gray-50 rounded-lg p-6">
              <h3 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
                <User className="h-5 w-5 mr-2 text-primary-600" />
                Reporter Details
              </h3>
              <div className="flex items-start space-x-4">
                {issue.reporter.profileImage ? (
                  <img
                    src={issue.reporter.profileImage}
                    alt={issue.reporter.name}
                    className="w-20 h-20 rounded-full object-cover border-2 border-gray-200"
                  />
                ) : (
                  <div className="w-20 h-20 rounded-full bg-primary-100 flex items-center justify-center">
                    <User className="h-10 w-10 text-primary-600" />
                  </div>
                )}
                <div className="flex-1">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm font-medium text-gray-500">Name</p>
                      <p className="text-base text-gray-900">{issue.reporter.name}</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-500">Email</p>
                      <p className="text-base text-gray-900 flex items-center">
                        <Mail className="h-4 w-4 mr-1" />
                        {issue.reporter.email}
                      </p>
                    </div>
                    {issue.reporter.phone && issue.reporter.phone !== 'N/A' && (
                      <div>
                        <p className="text-sm font-medium text-gray-500">Phone</p>
                        <p className="text-base text-gray-900 flex items-center">
                          <Phone className="h-4 w-4 mr-1" />
                          {issue.reporter.phone}
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </section>

            {/* 5. Nearby Issues */}
            {nearbyIssues && nearbyIssues.length > 0 && (
              <section className="bg-gray-50 rounded-lg p-6">
                <h3 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
                  <MapPin className="h-5 w-5 mr-2 text-primary-600" />
                  Nearby Issues (Within 100m)
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {nearbyIssues.map((nearby) => (
                    <div
                      key={nearby._id}
                      className="bg-white rounded-lg border border-gray-200 p-4 hover:shadow-md transition"
                    >
                      {nearby.imageUrl && (
                        <img
                          src={nearby.imageUrl}
                          alt="Nearby issue"
                          className="w-full h-32 object-cover rounded mb-3"
                        />
                      )}
                      <div className="space-y-2">
                        {nearby.title && (
                          <p className="font-medium text-gray-900 text-sm line-clamp-1">
                            {nearby.title}
                          </p>
                        )}
                        <div className="flex items-center justify-between">
                          <p className="text-xs text-gray-500 capitalize">
                            {nearby.category.replace('_', ' ')}
                          </p>
                          <Badge status={nearby.status} className="text-xs">
                            {nearby.status}
                          </Badge>
                        </div>
                        <div className="flex items-center justify-between text-xs text-gray-400">
                          <span>{new Date(nearby.createdAt).toLocaleDateString()}</span>
                          <span className="flex items-center">
                            <Users className="h-3 w-3 mr-1" />
                            {nearby.supportCount}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            )}
          </div>
        </div>
      </div>

      {/* Image Zoom Modal */}
      {imageZoomed && (
        <div
          className="fixed inset-0 bg-black bg-opacity-90 flex items-center justify-center z-[60] p-4"
          onClick={() => setImageZoomed(false)}
        >
          <button
            onClick={() => setImageZoomed(false)}
            className="absolute top-4 right-4 text-white hover:text-gray-300 transition"
          >
            <X className="h-8 w-8" />
          </button>
          <img
            src={issue.imageUrl}
            alt="Issue zoomed"
            className="max-w-full max-h-full object-contain"
          />
        </div>
      )}
    </>
  );
};

export default AdminIssueDetailsModal;
