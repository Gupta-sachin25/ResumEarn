import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Navbar from '../components/Navbar';

function Dashboard() {
  const { user, api, updateUserCoins } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const [jobs, setJobs] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);
  const [error, setError] = useState('');
  const [selectedJob, setSelectedJob] = useState(null);
  const [filterType, setFilterType] = useState('ALL'); // ALL, HIGH_MATCH, INTERNSHIP
  const [savedJobIds, setSavedJobIds] = useState(new Set());
  const [saveToast, setSaveToast] = useState('');

  // Fetch initial saved jobs
  useEffect(() => {
    const fetchSaved = async () => {
      try {
        const res = await api.get('/applications');
        const ids = new Set((res.data.applications || []).map(a => a.jobId));
        setSavedJobIds(ids);
      } catch (e) {
        // quiet error
      }
    };
    if (user) fetchSaved();
  }, [user]);

  const handleToggleSave = async (job) => {
    if (!job.id) return;
    try {
      const res = await api.post(`/applications/toggle-save/${job.id}`);
      setSavedJobIds(prev => {
        const next = new Set(prev);
        if (res.data.saved) {
          next.add(job.id);
          setSaveToast(`Saved "${job.title}" to Tracker!`);
        } else {
          next.delete(job.id);
          setSaveToast(`Removed from Tracker.`);
        }
        return next;
      });
      setTimeout(() => setSaveToast(''), 3000);
    } catch (err) {
      console.error('Failed to save job', err);
    }
  };

  // Check if auto-search was triggered via query params
  useEffect(() => {
    if (searchParams.get('auto') === 'true' && user?.coins >= 10 && !hasSearched) {
      handleSearch();
    }
  }, [searchParams, user]);

  const handleSearch = async (e) => {
    if (e) e.preventDefault();

    if (!user) {
      navigate('/login');
      return;
    }

    if ((user.coins ?? 0) < 10) {
      setError('Insufficient coins! You need at least 10 coins to run an AI job discovery search. You can earn +5 coins by submitting a job opening.');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const response = await api.post('/jobs/search', { query: searchQuery });
      setJobs(response.data.jobs || []);
      setHasSearched(true);
      if (response.data.remainingCoins !== undefined) {
        updateUserCoins(response.data.remainingCoins);
      }
    } catch (err) {
      console.error('Search failed', err);
      if (err.response?.status === 402) {
        setError('Insufficient coins! You need at least 10 coins to search.');
      } else if (err.response?.data?.message?.includes('resume')) {
        setError('Please upload your resume first so AI can match opportunities to your profile.');
      } else {
        setError(err.response?.data?.message || 'Failed to discover jobs. Please check your network or try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  const filteredJobs = jobs.filter(job => {
    if (filterType === 'HIGH_MATCH') return job.matchPercentage >= 75;
    if (filterType === 'INTERNSHIP') return job.jobType === 'INTERNSHIP';
    return true;
  });

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col font-sans">
      <Navbar />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Toast */}
        {saveToast && (
          <div className="fixed bottom-6 right-6 z-50 bg-gray-900 text-white px-4 py-2.5 rounded-xl shadow-lg text-xs font-semibold flex items-center gap-2 animate-in fade-in">
            <span>✨</span>
            <span>{saveToast}</span>
          </div>
        )}

        {/* Hero search banner */}
        <div className="bg-gradient-to-r from-indigo-900 via-indigo-800 to-violet-900 rounded-3xl p-6 sm:p-10 text-white shadow-lg mb-8 relative overflow-hidden">
          <div className="absolute right-0 top-0 w-96 h-96 bg-white/5 rounded-full blur-3xl pointer-events-none"></div>

          <div className="max-w-2xl relative z-10">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-indigo-500/30 text-indigo-200 border border-indigo-400/30 mb-3">
              <span>🤖</span> Powered by Google Gemini AI
            </span>
            <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight">
              Discover Jobs Tailored to You
            </h1>
            <p className="mt-2 text-indigo-100 text-sm sm:text-base leading-relaxed">
              Find verified internship & job openings matching your extracted profile. Each search utilizes AI discovery, validates company career links, and scores compatibility.
            </p>

            {/* Search Input Bar */}
            <form onSubmit={handleSearch} className="mt-6 flex flex-col sm:flex-row gap-3">
              <div className="relative flex-1">
                <input
                  type="text"
                  placeholder="Filter by keyword (e.g. React, Remote, AI, Bangalore)"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full px-4 py-3.5 pl-11 rounded-xl bg-white text-gray-900 placeholder-gray-400 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400 shadow-sm"
                />
                <span className="absolute left-4 top-3.5 text-gray-400 text-base">🔍</span>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="px-6 py-3.5 bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-500 hover:to-amber-600 text-gray-950 font-bold text-sm rounded-xl shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2 shrink-0 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-gray-900 border-t-transparent rounded-full animate-spin"></div>
                    <span>Discovering Jobs...</span>
                  </>
                ) : (
                  <>
                    <span>Search Jobs</span>
                    <span className="bg-amber-600/30 px-2 py-0.5 rounded text-xs font-extrabold">-10 🪙</span>
                  </>
                )}
              </button>
            </form>
          </div>

          {/* Quick stats / Coins pill info */}
          <div className="mt-6 pt-6 border-t border-indigo-700/50 flex flex-wrap items-center justify-between gap-4 text-xs text-indigo-200">
            <div className="flex items-center gap-4">
              <span>Your Balance: <strong className="text-white text-sm">🪙 {user?.coins ?? 0} Coins</strong></span>
              <span>•</span>
              <span>Cost: <strong className="text-white">10 Coins / Search</strong></span>
            </div>
            <Link
              to="/submit-job"
              className="text-amber-300 hover:text-amber-200 underline font-semibold flex items-center gap-1"
            >
              <span>+ Need more coins? Submit a job to earn +5 coins</span>
            </Link>
          </div>
        </div>

        {/* Alerts */}
        {error && (
          <div className="mb-6 p-4 bg-amber-50 border border-amber-200 text-amber-900 rounded-2xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-sm">
            <div className="flex items-center gap-2">
              <span className="text-xl">⚠️</span>
              <span>{error}</span>
            </div>
            {error.includes('upload') ? (
              <Link to="/upload-resume" className="px-3.5 py-1.5 bg-indigo-600 text-white rounded-lg text-xs font-semibold hover:bg-indigo-700 shrink-0">
                Upload Resume Now
              </Link>
            ) : error.includes('Insufficient') ? (
              <Link to="/submit-job" className="px-3.5 py-1.5 bg-amber-600 text-white rounded-lg text-xs font-semibold hover:bg-amber-700 shrink-0">
                Earn 5 Coins
              </Link>
            ) : null}
          </div>
        )}

        {/* Filters and Results Header */}
        {hasSearched && (
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
            <div className="flex items-center gap-2">
              <h2 className="text-xl font-bold text-gray-900">
                Discovered Opportunities
              </h2>
              <span className="bg-indigo-100 text-indigo-800 text-xs font-bold px-2.5 py-0.5 rounded-full">
                {filteredJobs.length} Found
              </span>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => setFilterType('ALL')}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                  filterType === 'ALL'
                    ? 'bg-indigo-600 text-white'
                    : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-50'
                }`}
              >
                All Jobs
              </button>
              <button
                onClick={() => setFilterType('HIGH_MATCH')}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                  filterType === 'HIGH_MATCH'
                    ? 'bg-indigo-600 text-white'
                    : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-50'
                }`}
              >
                High Match (&ge; 75%)
              </button>
              <button
                onClick={() => setFilterType('INTERNSHIP')}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                  filterType === 'INTERNSHIP'
                    ? 'bg-indigo-600 text-white'
                    : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-50'
                }`}
              >
                Internships Only
              </button>
            </div>
          </div>
        )}

        {/* Jobs Grid */}
        {loading ? (
          <div className="py-20 text-center">
            <div className="w-12 h-12 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <h3 className="text-lg font-bold text-gray-900">Gemini is Discovering Active Openings...</h3>
            <p className="text-sm text-gray-500 mt-1 max-w-md mx-auto">
              Scanning real-time career sources, validating live links, and scoring relevance against your resume profile.
            </p>
          </div>
        ) : !hasSearched ? (
          <div className="bg-white rounded-3xl border border-gray-100 p-12 text-center shadow-xs">
            <div className="w-16 h-16 bg-indigo-50 text-indigo-600 rounded-2xl flex items-center justify-center text-3xl mx-auto mb-4">
              🎯
            </div>
            <h3 className="text-lg font-bold text-gray-900">Ready to Match Your Profile</h3>
            <p className="text-sm text-gray-500 max-w-md mx-auto mt-1 mb-6">
              Click the search button above to spend 10 coins and discover current internship & job postings scored against your skills and graduation batch.
            </p>
            <button
              onClick={handleSearch}
              className="px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-sm rounded-xl shadow-sm hover:shadow transition-all"
            >
              Start Discovery (-10 🪙)
            </button>
          </div>
        ) : filteredJobs.length === 0 ? (
          <div className="bg-white rounded-3xl border border-gray-100 p-12 text-center shadow-xs">
            <p className="text-gray-500 text-sm">No jobs match your selected filter criteria. Try clearing filters or searching with different keywords.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredJobs.map((job) => {
              const score = job.matchPercentage || 70;
              const isHigh = score >= 80;
              const isMedium = score >= 60 && score < 80;

              return (
                <div
                  key={job.id || job.applicationUrl}
                  className="bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-all flex flex-col justify-between p-6 hover:-translate-y-0.5"
                >
                  <div>
                    {/* Top row: Company and Match Badge */}
                    <div className="flex items-start justify-between gap-3 mb-3">
                      <div>
                        <span className="text-xs font-bold text-indigo-600 uppercase tracking-wider">
                          {job.company}
                        </span>
                        <h3 className="text-lg font-bold text-gray-900 mt-0.5 leading-snug">
                          {job.title}
                        </h3>
                      </div>

                      {/* Match Percentage Badge & Save Bookmark */}
                      <div className="flex items-center gap-1.5 shrink-0">
                        {job.id && (
                          <button
                            onClick={() => handleToggleSave(job)}
                            className={`p-1.5 rounded-lg border transition-all ${
                              savedJobIds.has(job.id)
                                ? 'bg-amber-50 border-amber-300 text-amber-500'
                                : 'bg-gray-50 border-gray-200 text-gray-400 hover:text-amber-500'
                            }`}
                            title={savedJobIds.has(job.id) ? 'Saved to Tracker' : 'Save to Tracker'}
                          >
                            {savedJobIds.has(job.id) ? '★' : '☆'}
                          </button>
                        )}
                        <div
                          className={`px-3 py-1 rounded-full text-xs font-extrabold flex items-center gap-1 ${
                            isHigh
                              ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                              : isMedium
                              ? 'bg-indigo-50 text-indigo-700 border border-indigo-200'
                              : 'bg-amber-50 text-amber-700 border border-amber-200'
                          }`}
                        >
                          <span>{score}% Match</span>
                        </div>
                      </div>
                    </div>

                    {/* Location & Type metadata */}
                    <div className="flex flex-wrap items-center gap-2 text-xs text-gray-500 mb-4">
                      <span className="flex items-center gap-1">📍 {job.location || 'Remote'}</span>
                      <span>•</span>
                      <span className="bg-gray-100 px-2 py-0.5 rounded font-medium text-gray-700">
                        {job.jobType || 'INTERNSHIP'}
                      </span>
                      {job.sourceType && (
                        <span className="bg-blue-50 text-blue-700 px-2 py-0.5 rounded font-medium text-[11px]">
                          {job.sourceType}
                        </span>
                      )}
                    </div>

                    {/* Description preview */}
                    <p className="text-xs text-gray-600 line-clamp-2 mb-4 leading-relaxed">
                      {job.description || 'Exciting software opening with great growth opportunities and hands-on mentorship.'}
                    </p>

                    {/* Eligibility warning / confirmation */}
                    {job.eligibilityStatus && (
                      <div className="mb-4">
                        <span
                          className={`inline-block text-[11px] font-semibold px-2 py-0.5 rounded ${
                            job.eligibilityStatus === 'MATCHED'
                              ? 'bg-green-50 text-green-700'
                              : job.eligibilityStatus === 'MISMATCHED'
                              ? 'bg-red-50 text-red-600 font-bold'
                              : 'bg-gray-50 text-gray-600'
                          }`}
                        >
                          {job.eligibilityStatus === 'MATCHED'
                            ? '✓ Eligible Batch'
                            : job.eligibilityStatus === 'MISMATCHED'
                            ? '⚠ Batch Mismatch'
                            : 'Eligibility: Unspecified'}
                        </span>
                      </div>
                    )}

                    {/* Matched vs Missing Skills breakdown */}
                    <div className="space-y-2 mb-6">
                      {job.matchedSkills && job.matchedSkills.length > 0 && (
                        <div>
                          <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">
                            Matched Skills ({job.matchedSkills.length})
                          </p>
                          <div className="flex flex-wrap gap-1.5">
                            {job.matchedSkills.slice(0, 4).map((skill, i) => (
                              <span key={i} className="text-[11px] bg-emerald-50 text-emerald-800 border border-emerald-100 px-2 py-0.5 rounded-md font-medium">
                                ✓ {skill}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}

                      {job.missingSkills && job.missingSkills.length > 0 && (
                        <div>
                          <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">
                            Missing Skills ({job.missingSkills.length})
                          </p>
                          <div className="flex flex-wrap gap-1.5">
                            {job.missingSkills.slice(0, 3).map((skill, i) => (
                              <span key={i} className="text-[11px] bg-gray-100 text-gray-600 px-2 py-0.5 rounded-md font-medium">
                                {skill}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Actions: View Details and APPLY NOW */}
                  <div className="pt-4 border-t border-gray-100 flex items-center justify-between gap-2">
                    <button
                      onClick={() => setSelectedJob(job)}
                      className="px-3 py-2 text-xs font-semibold text-gray-600 hover:text-gray-900 hover:bg-gray-50 rounded-lg transition-colors"
                    >
                      Details & Breakdown
                    </button>

                    <a
                      href={job.applicationUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-xl shadow-xs hover:shadow transition-all inline-flex items-center gap-1.5"
                    >
                      <span>Apply Now</span>
                      <span className="text-indigo-200">↗</span>
                    </a>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Job Details Modal */}
        {selectedJob && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4">
            <div className="bg-white rounded-2xl shadow-xl max-w-lg w-full p-6 max-h-[90vh] overflow-y-auto animate-in fade-in zoom-in-95">
              <div className="flex justify-between items-start pb-4 border-b border-gray-100">
                <div>
                  <span className="text-xs font-bold text-indigo-600 uppercase">{selectedJob.company}</span>
                  <h3 className="text-xl font-bold text-gray-900 mt-0.5">{selectedJob.title}</h3>
                  <p className="text-xs text-gray-500 mt-1">📍 {selectedJob.location || 'Remote'} • {selectedJob.jobType}</p>
                </div>
                <button
                  onClick={() => setSelectedJob(null)}
                  className="text-gray-400 hover:text-gray-600 rounded-lg p-1.5"
                >
                  ✕
                </button>
              </div>

              <div className="mt-4 space-y-4">
                {/* Match Score overview */}
                <div className="bg-indigo-50/70 border border-indigo-100 rounded-xl p-4 flex items-center justify-between">
                  <div>
                    <p className="text-xs font-semibold text-indigo-900">Calculated Compatibility</p>
                    <p className="text-2xl font-extrabold text-indigo-600">{selectedJob.matchPercentage}% Match</p>
                  </div>
                  {selectedJob.eligibilityNotes && (
                    <span className="text-xs text-gray-600 max-w-[200px] text-right">
                      {selectedJob.eligibilityNotes}
                    </span>
                  )}
                </div>

                {/* Description */}
                <div>
                  <h4 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">Role Description</h4>
                  <p className="text-xs text-gray-700 leading-relaxed bg-gray-50 p-3 rounded-xl border border-gray-100">
                    {selectedJob.description}
                  </p>
                </div>

                {/* Eligibility */}
                {selectedJob.eligibility && (
                  <div>
                    <h4 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">Eligibility Criteria</h4>
                    <p className="text-xs text-gray-700 bg-gray-50 p-3 rounded-xl border border-gray-100">
                      {selectedJob.eligibility}
                    </p>
                  </div>
                )}

                {/* Score breakdown */}
                {selectedJob.breakdown && (
                  <div>
                    <h4 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Algorithm Scoring Breakdown</h4>
                    <div className="grid grid-cols-2 gap-2 text-xs">
                      <div className="bg-gray-50 p-2 rounded-lg border border-gray-100 flex justify-between">
                        <span className="text-gray-500">Skills (35%)</span>
                        <strong className="text-gray-800">{selectedJob.breakdown.skills}%</strong>
                      </div>
                      <div className="bg-gray-50 p-2 rounded-lg border border-gray-100 flex justify-between">
                        <span className="text-gray-500">Eligibility (25%)</span>
                        <strong className="text-gray-800">{selectedJob.breakdown.eligibility}%</strong>
                      </div>
                      <div className="bg-gray-50 p-2 rounded-lg border border-gray-100 flex justify-between">
                        <span className="text-gray-500">Role Relevance (20%)</span>
                        <strong className="text-gray-800">{selectedJob.breakdown.roleRelevance}%</strong>
                      </div>
                      <div className="bg-gray-50 p-2 rounded-lg border border-gray-100 flex justify-between">
                        <span className="text-gray-500">Experience (10%)</span>
                        <strong className="text-gray-800">{selectedJob.breakdown.experience}%</strong>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Bottom CTA */}
              <div className="mt-6 pt-4 border-t border-gray-100 flex justify-between items-center">
                <button
                  onClick={() => setSelectedJob(null)}
                  className="px-4 py-2 text-xs bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl font-medium transition-colors"
                >
                  Close
                </button>
                <a
                  href={selectedJob.applicationUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-xl shadow-sm hover:shadow transition-all inline-flex items-center gap-1.5"
                >
                  <span>Apply on Original Career Page</span>
                  <span>↗</span>
                </a>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

export default Dashboard;

