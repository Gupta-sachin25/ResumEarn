import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

function Home() {
  const { user } = useAuth();

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col font-sans">
      {/* Navigation */}
      <header className="bg-white border-b border-gray-100 shadow-xs py-4 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex justify-between items-center">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 bg-gradient-to-tr from-indigo-600 to-violet-600 rounded-xl flex items-center justify-center shadow-xs">
              <span className="text-white font-extrabold text-lg">I</span>
            </div>
            <div className="flex flex-col">
              <span className="font-bold text-gray-900 text-lg leading-tight tracking-tight">InternMatch AI</span>
              <span className="text-[10px] uppercase font-semibold text-indigo-600 tracking-wider">Smart Resume Career Search</span>
            </div>
          </div>
          <nav className="space-x-3 flex items-center">
            {user ? (
              <Link
                to="/dashboard"
                className="bg-indigo-600 text-white px-5 py-2.5 rounded-xl hover:bg-indigo-700 font-medium transition-all shadow-sm hover:shadow inline-flex items-center gap-2 text-sm"
              >
                <span>Dashboard</span>
                <span className="bg-indigo-500 text-xs px-2 py-0.5 rounded-full font-bold">🪙 {user.coins ?? 0}</span>
              </Link>
            ) : (
              <>
                <Link to="/login" className="text-gray-600 hover:text-indigo-600 font-medium transition-colors text-sm px-3 py-2">
                  Sign in
                </Link>
                <Link
                  to="/signup"
                  className="bg-indigo-600 text-white px-5 py-2.5 rounded-xl hover:bg-indigo-700 font-semibold transition-all shadow-sm hover:shadow inline-block text-sm"
                >
                  Claim 100 Coins Free
                </Link>
              </>
            )}
          </nav>
        </div>
      </header>

      {/* Hero Section */}
      <main className="flex-1 flex flex-col items-center justify-center bg-gradient-to-br from-indigo-50/70 via-white to-purple-50/60 px-4 py-16 sm:py-24">
        <div className="text-center max-w-4xl mx-auto">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-indigo-50 border border-indigo-100 text-indigo-700 text-xs font-semibold mb-6 shadow-2xs">
            <span className="flex h-2 w-2 rounded-full bg-indigo-600 animate-pulse"></span>
            <span>Instant Gemini AI Resume Discovery & Match Engine</span>
          </div>

          <h2 className="text-4xl sm:text-6xl font-black text-gray-950 tracking-tight leading-tight mb-6">
            Upload your resume. <br />
            Find internships that <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-violet-600">actually match.</span>
          </h2>

          <p className="text-lg sm:text-xl text-gray-600 mb-10 max-w-2xl mx-auto leading-relaxed">
            Every user receives <strong className="text-gray-900 font-bold">100 Free Coins</strong> on registration. Our AI extracts your exact skills and graduation batch, checks active openings, and links directly to verified company career pages.
          </p>

          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <Link
              to={user ? "/dashboard" : "/signup"}
              className="bg-indigo-600 text-white px-8 py-4 rounded-2xl text-base font-bold hover:bg-indigo-700 shadow-md hover:shadow-xl hover:-translate-y-0.5 transition-all flex items-center justify-center gap-2"
            >
              <span>{user ? "Go to Dashboard" : "Get Started (100 Coins Bonus)"}</span>
              <span>&rarr;</span>
            </Link>
            <Link
              to="/upload-resume"
              className="bg-white text-gray-700 border border-gray-200 px-8 py-4 rounded-2xl text-base font-bold hover:bg-gray-50 shadow-xs hover:shadow transition-all flex items-center justify-center gap-2"
            >
              <span>Upload Resume (PDF)</span>
            </Link>
          </div>

          {/* Workflow Cards */}
          <div className="mt-20 grid grid-cols-1 md:grid-cols-4 gap-4 text-left">
            <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-xs">
              <div className="text-2xl mb-2">🎁</div>
              <h3 className="font-bold text-gray-900 text-sm">1. Register & Get Coins</h3>
              <p className="text-xs text-gray-500 mt-1">Receive 100 free coins instantly in your secure platform wallet.</p>
            </div>
            <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-xs">
              <div className="text-2xl mb-2">📄</div>
              <h3 className="font-bold text-gray-900 text-sm">2. AI Parses Resume</h3>
              <p className="text-xs text-gray-500 mt-1">Gemini structures your skills, batch year, and frameworks.</p>
            </div>
            <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-xs">
              <div className="text-2xl mb-2">🔍</div>
              <h3 className="font-bold text-gray-900 text-sm">3. Search Openings (-10🪙)</h3>
              <p className="text-xs text-gray-500 mt-1">Discover verified internships with deterministic compatibility scores.</p>
            </div>
            <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-xs">
              <div className="text-2xl mb-2">🚀</div>
              <h3 className="font-bold text-gray-900 text-sm">4. Direct Career Page</h3>
              <p className="text-xs text-gray-500 mt-1">Open original company application pages without middleman redirects.</p>
            </div>
          </div>
        </div>
      </main>

      <footer className="bg-white border-t border-gray-100 py-6 text-center text-xs text-gray-400">
        InternMatch AI • Free & Low-Cost AI-Powered Internship & Job Matching Platform
      </footer>
    </div>
  );
}

export default Home;
