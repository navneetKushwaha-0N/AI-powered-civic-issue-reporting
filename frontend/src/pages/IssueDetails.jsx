import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import { issueAPI } from '../services/api';
import Card from '../components/Card';
import Badge from '../components/Badge';
import Button from '../components/Button';
import { MapPin, Users, Calendar, ThumbsUp } from 'lucide-react';

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
      fetchIssueDetails();
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
