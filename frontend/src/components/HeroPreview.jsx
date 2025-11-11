const HeroPreview = () => {
  return (
    <div className="relative">
      <div className="bg-gray-200 rounded-2xl shadow-2xl p-8 border border-gray-300">
        <div className="bg-white rounded-lg p-6 mb-4">
          <div className="flex items-center gap-2 mb-6">
            <svg aria-hidden="true" focusable="false" className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
            </svg>
            <span className="text-sm text-gray-500">Civic Issue Dashboard</span>
          </div>
          <div className="text-sm text-gray-400 mb-4">Reported Overview</div>

          {/* Map Placeholder */}
          <div className="relative bg-gray-100 rounded-lg h-64 mb-4 flex items-center justify-center">
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-32 h-32 bg-gray-300 rounded-full flex items-center justify-center">
                <svg aria-hidden="true" focusable="false" className="w-12 h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
              </div>
            </div>
            <div className="absolute bottom-4 bg-white px-4 py-2 rounded-lg shadow-md text-sm text-gray-700">
              Smart Issue Detection
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-3 gap-2">
          <div className="bg-gray-100 rounded p-2 h-16"></div>
          <div className="bg-gray-100 rounded p-2 h-16"></div>
          <div className="bg-gray-100 rounded p-2 h-16"></div>
        </div>
      </div>
    </div>
  );
};

export default HeroPreview;
