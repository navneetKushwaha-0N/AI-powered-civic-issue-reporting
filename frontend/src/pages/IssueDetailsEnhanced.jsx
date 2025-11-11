import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import { issueAPI } from '../services/api';
import Card from '../components/Card';
import Badge from '../components/Badge';
import Button from '../components/Button';
import { 
  MapPin, Users, Calendar, ThumbsUp, ArrowLeft, 
  User, Mail, Phone, MapPinned, Image as ImageIcon,
  AlertCircle, CheckCircle, Clock
} from 'lucide-react';
import { toast } from 'react-hot-toast';

const IssueDetailsEnhanced = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [details, setDetails] = useState(null);
  const [loading, setLoading] = useState(true);
  const [imageZoomed, setImageZoomed] = useState(false);

  useEffect(() => {
    fetchDetails();
  }, [id]);

  const fetchDetails = async () => {
    try {
      const response = await issueAPI.getIssueDetails(id);
      setDetails(response.data.data);
    } catch (error) {
      console.error('Error fetching issue details:', error);
      toast.error('Failed to load issue details');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  if (!details) {
    return (
      <div className="text-center py-12">
        <AlertCircle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
        <p className="text-gray-600">Issue not found</p>
      </div>
    );
  }

  const { issue, supporters, nearbyIssues } = details;
  const position = [issue.location.coordinates[1], issue.location.coordinates[0]];

  const getStatusIcon = (status) => {
    switch(status) {
      case 'pending': return <Clock className="h-5 w-5 text-yellow-500" />;
      case 'processing': return <Clock className="h-5 w-5 text-blue-500" />;
      case 'resolved': return <CheckCircle className="h-5 w-5 text-green-500" />;
      default: return <AlertCircle className="h-5 w-5 text-gray-500" />;
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Back Button */}
      <button
        onClick={() => navigate(-1)}
        className="flex items-center text-gray-600 hover:text-gray-900 mb-6 transition"
      >
        <ArrowLeft className="h-5 w-5 mr-2" />
        Back
      </button>

      {/* Header */}
      <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              {issue.title || issue.description.substring(0, 50) + '...'}
            </h1>
            <div className="flex items-center space-x-4">
              <span className="inline-block px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-medium">
                {issue.category}
              </span>
              <Badge status={issue.status}>{issue.status}</Badge>
            </div>
          </div>
          <div className="text-right">
            <p className="text-sm text-gray-500">Issue ID</p>
            <p className="font-mono text-sm text-gray-700">{issue._id.slice(-8)}</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column - Main Info */}
        <div className="lg:col-span-2 space-y-6">
          {/* Image */}
          <Card>
            <h3 className="text-lg font-semibold mb-4 flex items-center">
              <ImageIcon className="h-5 w-5 mr-2" />
              Uploaded Image
            </h3>
            <div 
              className={`relative ${imageZoomed ? 'fixed inset-0 z-50 bg-black bg-opacity-90 flex items-center justify-center p-4' : ''}`}
              onClick={() => imageZoomed && setImageZoomed(false)}
            >
              <img
                src={issue.imageUrl}
                alt="Issue"
                className={`rounded-lg ${imageZoomed ? 'max-h-screen max-w-full cursor-zoom-out' : 'w-full cursor-zoom-in'}`}
                onClick={(e) => {
                  e.stopPropagation();
                  setImageZoomed(!imageZoomed);
                }}
              />
              {!imageZoomed && (
                <p className="text-xs text-gray-500 mt-2 text-center">
                  Click image to zoom
                </p>
              )}
            </div>
          </Card>

          {/* Description */}
          <Card>
            <h3 className="text-lg font-semibold mb-4">Description</h3>
            <p className="text-gray-700 leading-relaxed">{issue.description}</p>
            
            <div className="mt-4 pt-4 border-t border-gray-200 grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-500">Reported On</p>
                <p className="text-sm font-medium text-gray-900">
                  {new Date(issue.createdAt).toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit'
                  })}
                </p>
              </div>
              {issue.address && (
                <div>
                  <p className="text-sm text-gray-500">Address</p>
                  <p className="text-sm font-medium text-gray-900">{issue.address}</p>
                </div>
              )}
            </div>

            {issue.mlPredictions && (
              <div className="mt-4 pt-4 border-t border-gray-200">
                <h4 className="text-sm font-semibold text-gray-700 mb-2">AI Analysis</h4>
                <div className="grid grid-cols-2 gap-4">
                  {issue.mlConfidence && (
                    <div>
                      <p className="text-xs text-gray-500">Confidence</p>
                      <p className="text-sm font-medium text-gray-900">
                        {(issue.mlConfidence * 100).toFixed(1)}%
                      </p>
                    </div>
                  )}
                  {issue.mlPredictions.priority && (
                    <div>
                      <p className="text-xs text-gray-500">Priority</p>
                      <p className="text-sm font-medium text-gray-900">
                        {issue.mlPredictions.priority}
                      </p>
                    </div>
                  )}
                  {issue.mlPredictions.authentic !== undefined && (
                    <div>
                      <p className="text-xs text-gray-500">Authenticity</p>
                      <p className="text-sm font-medium text-gray-900">
                        {issue.mlPredictions.authentic ? 'Verified' : 'Unverified'}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            )}

            {issue.adminNotes && (
              <div className="mt-4 pt-4 border-t border-gray-200">
                <h4 className="text-sm font-semibold text-gray-700 mb-2">Admin Notes</h4>
                <p className="text-sm text-gray-600 bg-yellow-50 p-3 rounded">
                  {issue.adminNotes}
                </p>
              </div>
            )}
          </Card>

          {/* Support Details */}
          <Card>
            <h3 className="text-lg font-semibold mb-4 flex items-center">
              <ThumbsUp className="h-5 w-5 mr-2" />
              Support Details
            </h3>
            <div className="mb-4">
              <p className="text-2xl font-bold text-gray-900">{issue.supportCount}</p>
              <p className="text-sm text-gray-600">
                {issue.supportCount === 1 ? 'Person supports' : 'People support'} this issue
              </p>
            </div>

            {supporters && supporters.length > 0 && (
              <div>
                <h4 className="text-sm font-semibold text-gray-700 mb-3">Supporters</h4>
                <div className="space-y-3">
                  {supporters.map((supporter, index) => (
                    <div 
                      key={index}
                      className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                    >
                      <div className="flex items-center space-x-3">
                        <div className="h-10 w-10 rounded-full bg-primary-100 flex items-center justify-center">
                          <User className="h-5 w-5 text-primary-600" />
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-900">{supporter.name}</p>
                          <p className="text-xs text-gray-500">{supporter.email}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-xs text-gray-500">
                          {new Date(supporter.supportedAt).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </Card>

          {/* Map */}
          <Card>
            <h3 className="text-lg font-semibold mb-4 flex items-center">
              <MapPinned className="h-5 w-5 mr-2" />
              Location on Map
            </h3>
            <div className="h-96 rounded-lg overflow-hidden">
              <MapContainer
                center={position}
                zoom={16}
                style={{ height: '100%', width: '100%' }}
              >
                <TileLayer
                  url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                  attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
                />
                <Marker position={position}>
                  <Popup>
                    <div className="text-sm">
                      <p className="font-semibold">{issue.category}</p>
                      <p className="text-gray-600">{issue.status}</p>
                    </div>
                  </Popup>
                </Marker>
              </MapContainer>
            </div>
            <p className="text-xs text-gray-500 mt-2">
              Coordinates: {position[0].toFixed(6)}, {position[1].toFixed(6)}
            </p>
          </Card>
        </div>

        {/* Right Column - Reporter & Nearby Issues */}
        <div className="space-y-6">
          {/* Reporter Details */}
          <Card>
            <h3 className="text-lg font-semibold mb-4 flex items-center">
              <Users className="h-5 w-5 mr-2" />
              Reporter Details
            </h3>
            <div className="space-y-4">
              <div className="flex items-center space-x-3">
                <div className="h-16 w-16 rounded-full bg-gradient-to-br from-primary-400 to-primary-600 flex items-center justify-center text-white text-xl font-bold">
                  {issue.reporter.name.charAt(0).toUpperCase()}
                </div>
                <div>
                  <p className="font-semibold text-gray-900">{issue.reporter.name}</p>
                  <p className="text-sm text-gray-500">Reporter</p>
                </div>
              </div>

              <div className="space-y-3">
                <div className="flex items-center space-x-3">
                  <Mail className="h-4 w-4 text-gray-400" />
                  <div>
                    <p className="text-xs text-gray-500">Email</p>
                    <p className="text-sm text-gray-900">{issue.reporter.email}</p>
                  </div>
                </div>

                {issue.reporter.phone && issue.reporter.phone !== 'N/A' && (
                  <div className="flex items-center space-x-3">
                    <Phone className="h-4 w-4 text-gray-400" />
                    <div>
                      <p className="text-xs text-gray-500">Phone</p>
                      <p className="text-sm text-gray-900">{issue.reporter.phone}</p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </Card>

          {/* Assignment Info (if assigned) */}
          {issue.assignedTo && (
            <Card>
              <h3 className="text-sm font-semibold text-gray-700 mb-3">Assignment</h3>
              <div className="bg-blue-50 p-3 rounded">
                <p className="text-sm font-medium text-blue-900">
                  Assigned to: {issue.assignedTo}
                </p>
                {issue.assignedAt && (
                  <p className="text-xs text-blue-700 mt-1">
                    {new Date(issue.assignedAt).toLocaleDateString()}
                  </p>
                )}
              </div>
            </Card>
          )}

          {/* Nearby Issues */}
          {nearbyIssues && nearbyIssues.length > 0 && (
            <Card>
              <h3 className="text-lg font-semibold mb-4 flex items-center">
                <MapPin className="h-5 w-5 mr-2" />
                Nearby Issues ({nearbyIssues.length})
              </h3>
              <p className="text-sm text-gray-600 mb-4">
                Within 100 meters
              </p>
              <div className="space-y-3">
                {nearbyIssues.map((nearby) => (
                  <Link
                    key={nearby._id}
                    to={`/issue/${nearby._id}`}
                    className="block p-3 border border-gray-200 rounded-lg hover:border-primary-300 hover:shadow-sm transition"
                  >
                    <div className="flex items-start space-x-3">
                      {nearby.imageUrl && (
                        <img
                          src={nearby.imageUrl}
                          alt={nearby.title}
                          className="h-12 w-12 rounded object-cover"
                        />
                      )}
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900 truncate">
                          {nearby.title || nearby.category}
                        </p>
                        <div className="flex items-center space-x-2 mt-1">
                          <Badge status={nearby.status} className="text-xs">
                            {nearby.status}
                          </Badge>
                          <span className="text-xs text-gray-500">
                            {getStatusIcon(nearby.status)}
                          </span>
                        </div>
                        <div className="flex items-center justify-between mt-2">
                          <span className="text-xs text-gray-500">
                            {new Date(nearby.createdAt).toLocaleDateString()}
                          </span>
                          <span className="text-xs text-gray-500">
                            {nearby.supportCount} supporters
                          </span>
                        </div>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            </Card>
          )}

          {(!nearbyIssues || nearbyIssues.length === 0) && (
            <Card>
              <h3 className="text-lg font-semibold mb-4 flex items-center">
                <MapPin className="h-5 w-5 mr-2" />
                Nearby Issues
              </h3>
              <p className="text-sm text-gray-500 text-center py-4">
                No other issues reported nearby
              </p>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
};

export default IssueDetailsEnhanced;
