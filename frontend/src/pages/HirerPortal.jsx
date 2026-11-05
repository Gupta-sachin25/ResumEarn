import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import Navbar from '../components/Navbar';

function HirerPortal() {
  const { api } = useAuth();
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    company: '',
    location: '',
    jobType: 'INTERNSHIP',
    skills: '',
    eligibility: '',
    graduationYears: '2025, 2026',
    applicationUrl: '',
    description: '',
  });
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    fetchHirerJobs();
  }, []);

  const fetchHirerJobs = async () => {
    setLoading(true);
    try {
      const res = await api.get('/jobs/hirer/my-jobs');
      setJobs(res.data.jobs || []);
    } catch (err) {
      console.error('Failed to load hirer jobs', err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateJob = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError('');
    setMessage('');

    try {
      const skillsArray = formData.skills.split(',').map(s => s.trim()).filter(Boolean);
      const gradYears = formData.graduationYears.split(',').map(y => parseInt(y.trim(), 10)).filter(Boolean);

      const res = await api.post('/jobs/hirer/post', {
        ...formData,
        skills: skillsArray,
        graduationYears: gradYears,
      });

      setJobs([res.data.job, ...jobs]);
      setMessage('Job posting created successfully!');
      setShowCreateForm(false);
      setFormData({
        title: '',
        company: '',
        location: '',
        jobType: 'INTERNSHIP',
        skills: '',
        eligibility: '',
        graduationYears: '2025, 2026',
        applicationUrl: '',
        description: '',
      });
      setTimeout(() => setMessage(''), 3000);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to post job');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col font-sans">
      <Navbar />

      <main className="flex-1 max-w-5xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-indigo-700 bg-indigo-50 px-3 py-1 rounded-full border border-indigo-200">
              Recruiter & Hirer Portal
            </span>
            <h1 className="text-3xl font-extrabold text-gray-900 mt-2">Manage Job Postings</h1>
            <p className="text-sm text-gray-500 mt-1">Post and manage direct company opportunities visible to all matching candidates.</p>
          </div>
          <button
            onClick={() => setShowCreateForm(!showCreateForm)}
            className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-sm font-bold shadow-xs transition-colors self-start"
          >
            {showCreateForm ? 'Cancel' : '+ Post New Opportunity'}
          </button>
        </div>

        {message && (
          <div className="mb-6 p-4 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl text-sm font-semibold">
            {message}
          </div>
        )}

        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 text-red-700 rounded-xl text-sm">
            {error}
          </div>
        )}

        {/* Post Form */}
        {showCreateForm && (
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 sm:p-8 mb-8 animate-in fade-in">
            <h3 className="text-lg font-bold text-gray-900 mb-4">Post Direct Company Opportunity</h3>
            <form onSubmit={handleCreateJob} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">Title *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Graduate Software Engineer"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-lg border border-gray-200 text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">Company *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Acme Tech"
                    value={formData.company}
                    onChange={(e) => setFormData({ ...formData, company: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-lg border border-gray-200 text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">Application URL *</label>
                <input
                  type="url"
                  required
                  placeholder="https://company.com/apply/123"
                  value={formData.applicationUrl}
                  onChange={(e) => setFormData({ ...formData, applicationUrl: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-lg border border-gray-200 text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">Location</label>
                  <input
                    type="text"
                    placeholder="e.g. Bangalore or Remote"
                    value={formData.location}
                    onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-lg border border-gray-200 text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">Job Type</label>
                  <select
                    value={formData.jobType}
                    onChange={(e) => setFormData({ ...formData, jobType: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-lg border border-gray-200 text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                  >
                    <option value="INTERNSHIP">Internship</option>
                    <option value="FULL_TIME">Full Time</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">Graduation Batches</label>
                  <input
                    type="text"
                    placeholder="2025, 2026"
                    value={formData.graduationYears}
                    onChange={(e) => setFormData({ ...formData, graduationYears: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-lg border border-gray-200 text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">Required Skills (comma separated)</label>
                <input
                  type="text"
                  placeholder="React, TypeScript, Node.js"
                  value={formData.skills}
                  onChange={(e) => setFormData({ ...formData, skills: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-lg border border-gray-200 text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">Description</label>
                <textarea
                  rows={3}
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-lg border border-gray-200 text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowCreateForm(false)}
                  className="px-4 py-2 border border-gray-200 text-gray-600 rounded-xl text-xs font-semibold hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="px-6 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold shadow-xs"
                >
                  {saving ? 'Publishing...' : 'Publish Job Posting'}
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Existing Jobs List */}
        {loading ? (
          <div className="py-16 text-center text-gray-400">Loading your postings...</div>
        ) : jobs.length === 0 ? (
          <div className="bg-white rounded-3xl border border-gray-100 p-12 text-center shadow-xs">
            <h3 className="text-lg font-bold text-gray-900">No Postings Yet</h3>
            <p className="text-sm text-gray-500 mt-1 mb-4">Click "Post New Opportunity" above to publish your first job opening.</p>
          </div>
        ) : (
          <div className="bg-white rounded-2xl shadow-2xs border border-gray-100 divide-y divide-gray-100 overflow-hidden">
            {jobs.map((job) => (
              <div key={job.id} className="p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-gray-50/50">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-indigo-600 uppercase">{job.company}</span>
                    <span className="text-xs bg-emerald-50 text-emerald-700 font-bold px-2 py-0.5 rounded-full border border-emerald-100">
                      Live
                    </span>
                  </div>
                  <h4 className="text-base font-bold text-gray-900 mt-0.5">{job.title}</h4>
                  <p className="text-xs text-gray-500 mt-0.5">📍 {job.location || 'Remote'} • {job.jobType}</p>
                </div>
                <div className="flex items-center gap-2">
                  <a
                    href={job.applicationUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-3.5 py-1.5 bg-gray-100 hover:bg-gray-200 text-gray-800 text-xs font-semibold rounded-lg"
                  >
                    View Page ↗
                  </a>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}

export default HirerPortal;

