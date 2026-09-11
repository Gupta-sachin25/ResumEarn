import React from 'react';
import { Link } from 'react-router-dom';

function Home() {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col font-sans">
      {/* Navigation */}
      <header className="bg-white shadow-sm py-4">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex justify-between items-center">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-xl">I</span>
            </div>
            <h1 className="text-2xl font-bold text-gray-900">InternMatch AI</h1>
          </div>
          <nav className="space-x-4">
            <Link to="/login" className="text-gray-600 hover:text-indigo-600 font-medium transition-colors">Login</Link>
            <Link to="/signup" className="bg-indigo-600 text-white px-5 py-2.5 rounded-lg hover:bg-indigo-700 font-medium transition-all shadow-sm hover:shadow-md inline-block">
              Get Started
            </Link>
          </nav>
        </div>
      </header>

      {/* Hero Section */}
      <main className="flex-grow flex items-center justify-center bg-gradient-to-br from-indigo-50 via-white to-purple-50">
        <div className="text-center px-4 max-w-4xl mx-auto">
          <h2 className="text-5xl sm:text-6xl font-extrabold text-gray-900 tracking-tight mb-6">
            Find internships and jobs <br className="hidden sm:block" />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-purple-600">made for YOU.</span>
          </h2>
          <p className="text-xl text-gray-600 mb-10 max-w-2xl mx-auto leading-relaxed">
            Upload your resume once. Let AI discover opportunities that actually match your skills, education, and preferences.
          </p>
          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <Link to="/upload-resume" className="bg-indigo-600 text-white px-8 py-4 rounded-xl text-lg font-semibold hover:bg-indigo-700 shadow-lg hover:shadow-xl hover:-translate-y-0.5 transition-all">
              Upload Resume
            </Link>
            <button className="bg-white text-gray-700 border border-gray-200 px-8 py-4 rounded-xl text-lg font-semibold hover:bg-gray-50 shadow-sm hover:shadow transition-all">
              See How It Works
            </button>
          </div>
        </div>
      </main>
    </div>
  );
}

export default Home;
