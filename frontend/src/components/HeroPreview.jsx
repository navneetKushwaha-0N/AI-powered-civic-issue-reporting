const HeroPreview = () => {
  return (
    <div className="relative">

      {/* glow */}
      <div className="absolute -inset-6 bg-gradient-to-r from-indigo-500/20 to-cyan-500/20 blur-3xl rounded-3xl"></div>

      <div className="relative backdrop-blur-2xl bg-white/5 border border-white/10 rounded-3xl p-6 shadow-[0_20px_80px_rgba(0,0,0,0.5)]">

        {/* Header */}
        <div className="flex items-center gap-2 mb-6">
          <div className="p-2 rounded-lg bg-gradient-to-r from-indigo-500 to-cyan-500">
            <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3" />
            </svg>
          </div>
          <span className="text-sm text-gray-300">Civic Dashboard</span>
        </div>

        <div className="text-xs text-gray-400 mb-4">
          Real-time Issue Overview
        </div>

        {/* Map */}
        <div className="relative rounded-2xl h-64 mb-5 bg-gradient-to-br from-[#0f172a] to-[#1e293b] border border-white/10 overflow-hidden">

          {/* subtle grid */}
          <div className="absolute inset-0 opacity-20 bg-[linear-gradient(rgba(255,255,255,0.05)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.05)_1px,transparent_1px)] bg-[size:40px_40px]"></div>

          {/* pulse marker */}
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="relative">
              <div className="absolute w-20 h-20 bg-indigo-500/30 rounded-full animate-ping"></div>
              <div className="relative w-12 h-12 rounded-full bg-gradient-to-r from-indigo-500 to-cyan-500 flex items-center justify-center shadow-lg">
                <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
              </div>
            </div>
          </div>

          {/* label */}
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 px-4 py-1.5 rounded-xl bg-white/10 backdrop-blur text-xs text-white border border-white/10">
            Smart Detection Active
          </div>
        </div>

        {/* stats */}
        <div className="grid grid-cols-3 gap-3">
          {['Total', 'Pending', 'Resolved'].map((item, i) => (
            <div
              key={i}
              className="p-3 rounded-xl bg-white/5 border border-white/10 text-center"
            >
              <p className="text-xs text-gray-400">{item}</p>
              <p className="text-white font-semibold mt-1">128</p>
            </div>
          ))}
        </div>

      </div>
    </div>
  );
};

export default HeroPreview;