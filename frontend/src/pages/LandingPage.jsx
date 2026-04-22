import { Link } from 'react-router-dom';
import { lazy, Suspense, memo } from 'react';

const HeroPreview = lazy(() => import('../components/HeroPreview.jsx'));

const LandingPage = memo(() => {
  return (
    <div className="min-h-screen bg-[#0b1220] text-white relative overflow-hidden">

      {/* background */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(99,102,241,0.18),transparent_40%),radial-gradient(circle_at_80%_80%,rgba(14,165,233,0.18),transparent_40%)]"></div>

      {/* Navbar */}
      <nav className="fixed top-0 w-full z-50 backdrop-blur-xl bg-[#0b1220]/70 border-b border-white/10">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex items-center justify-between h-16">

            <Link to="/" className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-r from-indigo-500 to-cyan-500 flex items-center justify-center shadow-lg">
                <span className="text-white font-bold">C</span>
              </div>
              <span className="font-semibold text-lg">CivicReport</span>
            </Link>

            <div className="hidden md:flex items-center gap-8 text-sm text-gray-400">
              <a href="#features" className="hover:text-white transition">Features</a>
              <a href="#how-it-works" className="hover:text-white transition">How It Works</a>
              <a href="#impact" className="hover:text-white transition">Impact</a>
            </div>

            <div className="flex items-center gap-3">
              <Link to="/login" className="text-gray-400 hover:text-white text-sm">
                Sign In
              </Link>
              <Link
                to="/register"
                className="px-4 py-2 rounded-xl bg-gradient-to-r from-indigo-500 to-cyan-500 text-white text-sm shadow-md"
              >
                Get Started
              </Link>
            </div>

          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="pt-32 pb-24 relative z-10">
        <div className="max-w-7xl mx-auto px-6 grid lg:grid-cols-2 gap-12 items-center">

          <div>
            <h1 className="text-5xl lg:text-6xl font-semibold leading-tight mb-6">
              Fix Your City <br />
              <span className="bg-gradient-to-r from-indigo-400 to-cyan-400 bg-clip-text text-transparent">
                Smarter & Faster
              </span>
            </h1>

            <p className="text-gray-400 text-lg mb-8 max-w-lg">
              Report civic issues instantly. AI analyzes, prioritizes and routes them to authorities for faster resolution.
            </p>

            <div className="flex gap-4">
              <Link
                to="/report"
                className="px-6 py-3 rounded-xl bg-gradient-to-r from-indigo-500 to-cyan-500 text-white shadow-lg"
              >
                Report Issue
              </Link>

              <button className="px-6 py-3 rounded-xl border border-white/10 text-gray-300 hover:bg-white/5 transition">
                Learn More
              </button>
            </div>

            <div className="flex gap-10 mt-12 text-sm text-gray-400">
              <div>
                <p className="text-white text-2xl font-semibold">2.3K+</p>
                Issues Resolved
              </div>
              <div>
                <p className="text-white text-2xl font-semibold">94%</p>
                Success Rate
              </div>
              <div>
                <p className="text-white text-2xl font-semibold">5.2d</p>
                Avg Time
              </div>
            </div>
          </div>

          <div className="relative">
            <div className="absolute inset-0 bg-gradient-to-r from-indigo-500/20 to-cyan-500/20 blur-3xl rounded-3xl"></div>

            <div className="relative rounded-3xl bg-white/5 border border-white/10 backdrop-blur-xl p-6 shadow-2xl">
              <Suspense fallback={<div className="h-80 bg-white/10 rounded-xl animate-pulse"></div>}>
                <HeroPreview />
              </Suspense>
            </div>
          </div>

        </div>
      </section>

      {/* Features */}
      <section id="features" className="py-20 relative z-10">
        <div className="max-w-7xl mx-auto px-6 text-center mb-12">
          <h2 className="text-3xl font-semibold text-white mb-2">
            Powerful Features
          </h2>
          <p className="text-gray-400">
            Everything you need for civic reporting
          </p>
        </div>

        <div className="max-w-7xl mx-auto px-6 grid md:grid-cols-2 lg:grid-cols-3 gap-6">

          {[
            { title: "AI Smart Detection", icon: "🧠" },
            { title: "Fast Processing", icon: "⚡" },
            { title: "Community Driven", icon: "👥" },
            { title: "Live Tracking", icon: "📍" },
            { title: "Notifications", icon: "🔔" },
            { title: "Secure System", icon: "🔒" }
          ].map((item, i) => (
            <div
              key={i}
              className="p-6 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-xl hover:bg-white/10 transition"
            >
              <div className="h-12 w-12 rounded-xl bg-gradient-to-r from-indigo-500 to-cyan-500 flex items-center justify-center text-xl shadow-lg mb-4">
                {item.icon}
              </div>

              <h3 className="text-white font-medium mb-2">
                {item.title}
              </h3>

              <p className="text-gray-400 text-sm">
                Clean and efficient feature designed for real world usage.
              </p>
            </div>
          ))}

        </div>
      </section>

      {/* CTA */}
      <section className="py-20 text-center relative z-10">
        <h2 className="text-3xl font-semibold text-white mb-4">
          Start Reporting Today
        </h2>
        <p className="text-gray-400 mb-6">
          Be part of the change
        </p>

        <Link
          to="/report"
          className="px-8 py-4 rounded-xl bg-gradient-to-r from-indigo-500 to-cyan-500 text-white shadow-lg"
        >
          Get Started
        </Link>
      </section>

    </div>
  );
});

export default LandingPage;