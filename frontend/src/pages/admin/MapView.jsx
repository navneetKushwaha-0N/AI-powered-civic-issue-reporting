import Card from '../../components/Card';

const MapView = () => {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-3xl font-bold text-gray-900 mb-8">Map View</h1>

      <Card>
        <div className="text-center py-12">
          <p className="text-gray-500 text-lg">
            Interactive map with issue markers coming soon...
          </p>
          <p className="text-sm text-gray-400 mt-2">
            Using React-Leaflet with marker clustering
          </p>
        </div>
      </Card>
    </div>
  );
};

export default MapView;
