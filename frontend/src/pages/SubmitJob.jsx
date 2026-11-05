import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Navbar from '../components/Navbar';

function SubmitJob() {
  const { api, updateUserCoins } = useAuth();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    title: '',
    company: '',
    applicationUrl: '',
    location: '',
    jobType: 'INTERNSHIP',
    skills: '',
    eligibility: '',
    graduationYears: '2025, 2026',
    description: '',
  });

  const [loading, setLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [error, setError] = useState('');

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccessMessage('');

    try {
      const skillsArray = formData.skills
        .split(',')
        .map(s => s.trim())
        .filter(Boolean);

      const gradYearsArray = formData.graduationYears
        .split(',')
        .map(y => parseInt(y.trim(), 10))
        .filter(Boolean);

      const response = await api.post('/jobs/submit', {
        ...formData,
        skills: skillsArray,
        graduationYears: gradYearsArray,
      });

      setSuccessMessage(response.data.message || 'Job submitted and verified! You earned +5 coins!');
      if (response.data.newBalance !== undefined) {
        updateUserCoins(response.data.newBalance);
      }

      setFormData({
        title: '',
        company: '',
        applicationUrl: '',
        location: '',
        jobType: 'INTERNSHIP',
        skills: '',
        eligibility: '',
        graduationYears: '2025, 2026',
        description: '',
      });
    } catch (err) {
      console.error('Job submission failed', err);
      setError(err.response?.data?.message || 'Failed to submit job. Please ensure the URL is valid and active.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col font-sans">
      <Navbar />

      <main className="flex-1 max-w-2xl w-full mx-auto px-4 py-8">
        <div className="text-center mb-8">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-amber-100 text-amber-800 border border-amber-200">
            <span>🪙</span> Community Reward System
          </span>
          <h1 className="text-3xl font-extrabold text-gray-900 mt-2">
            Contribute a Job & Earn +5 Coins
          </h1>
          <p className="text-sm text-gray-600 mt-1 max-w-md mx-auto">
            Found an active internship or job opening? Submit the genuine career link. If it's valid and new, you immediately receive 5 coins to spend on AI searches!
          </p>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 sm:p-8">
          {successMessage && (
            <div className="mb-6 p-4 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl text-sm flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="text-xl">🎉</span>
                <span className="font-semibold">{successMessage}</span>
              </div>
              <button
                onClick={() => navigate('/dashboard')}
                className="text-xs bg-emerald-700 hover:bg-emerald-800 text-white px-3 py-1.5 rounded-lg font-bold"
              >
                Go to Dashboard
              </button>
            </div>
          )}

          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 text-red-700 rounded-xl text-sm flex items-center justify-between">
              <span>{error}</span>
              <button onClick={() => setError('')} className="text-red-500 hover:text-red-700 font-bold ml-2">✕</button>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1">
                  Job / Internship Title *
                </label>
                <input
                  type="text"
                  name="title"
                  required
                  placeholder="e.g. Software Engineer Intern"
                  value={formData.title}
                  onChange={handleChange}
                  className="w-full px-3.5 py-2.5 rounded-lg border border-gray-200 text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1">
                  Company Name *
                </label>
                <input
                  type="text"
                  name="company"
                  required
                  placeholder="e.g. Stripe, Razorpay, Microsoft"
                  value={formData.company}
                  onChange={handleChange}
                  className="w-full px-3.5 py-2.5 rounded-lg border border-gray-200 text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1">
                Official Career / Application URL *
              </label>
              <input
                type="url"
                name="applicationUrl"
                required
                placeholder="https://company.com/careers/role-id or direct portal link"
                value={formData.applicationUrl}
                onChange={handleChange}
                className="w-full px-3.5 py-2.5 rounded-lg border border-gray-200 text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none"
              />
              <p className="text-[11px] text-gray-400 mt-1">Must be an active, genuine external link. Duplicates will be rejected.</p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1">
                  Location
                </label>
                <input
                  type="text"
                  name="location"
                  placeholder="e.g. Remote, Bangalore, Hyderabad"
                  value={formData.location}
                  onChange={handleChange}
                  className="w-full px-3.5 py-2.5 rounded-lg border border-gray-200 text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1">
                  Job Type
                </label>
                <select
                  name="jobType"
                  value={formData.jobType}
                  onChange={handleChange}
                  className="w-full px-3.5 py-2.5 rounded-lg border border-gray-200 text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                >
                  <option value="INTERNSHIP">Internship</option>
                  <option value="FULL_TIME">Full Time</option>
                  <option value="CONTRACT">Contract</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1">
                  Required Skills (comma separated)
                </label>
                <input
                  type="text"
                  name="skills"
                  placeholder="React, Python, SQL, Git"
                  value={formData.skills}
                  onChange={handleChange}
                  className="w-full px-3.5 py-2.5 rounded-lg border border-gray-200 text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1">
                  Eligible Graduation Batches
                </label>
                <input
                  type="text"
                  name="graduationYears"
                  placeholder="2025, 2026"
                  value={formData.graduationYears}
                  onChange={handleChange}
                  className="w-full px-3.5 py-2.5 rounded-lg border border-gray-200 text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1">
                Description / Responsibilities (Optional)
              </label>
              <textarea
                name="description"
                rows={3}
                placeholder="Brief overview of what this role entails..."
                value={formData.description}
                onChange={handleChange}
                className="w-full px-3.5 py-2.5 rounded-lg border border-gray-200 text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none"
              ></textarea>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 px-6 rounded-xl font-bold text-white bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2 text-sm disabled:opacity-50"
            >
              {loading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  <span>Validating Link & Saving...</span>
                </>
              ) : (
                <>
                  <span>Submit & Earn +5 Coins 🪙</span>
                </>
              )}
            </button>
          </form>
        </div>
      </main>
    </div>
  );
}

export default SubmitJob;

