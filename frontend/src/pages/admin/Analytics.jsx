import Card from '../../components/Card';

const Analytics = () => {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-3xl font-bold text-gray-900 mb-8">Analytics</h1>

      <Card>
        <div className="text-center py-12">
          <p className="text-gray-500 text-lg">
            Analytics dashboard with charts coming soon...
          </p>
          <p className="text-sm text-gray-400 mt-2">
            Install recharts: npm install recharts
          </p>
        </div>
      </Card>
    </div>
  );
};

export default Analytics;
