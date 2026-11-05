import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import Navbar from '../components/Navbar';

function Admin() {
  const { api } = useAuth();

  const [stats, setStats] = useState(null);
  const [submissions, setSubmissions] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('SUBMISSIONS'); // SUBMISSIONS, USERS
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  // Coin Adjustment Modal State
  const [adjustModalUser, setAdjustModalUser] = useState(null);
  const [adjustAmount, setAdjustAmount] = useState('');
  const [adjustReason, setAdjustReason] = useState('');
  const [adjusting, setAdjusting] = useState(false);

  useEffect(() => {
    fetchAdminData();
  }, []);

  const fetchAdminData = async () => {
    setLoading(true);
    setError('');
    try {
      const [statsRes, subsRes, usersRes] = await Promise.all([
        api.get('/admin/stats'),
        api.get('/admin/submissions'),
        api.get('/admin/users'),
      ]);

      setStats(statsRes.data.stats);
      setSubmissions(subsRes.data.jobs || []);
      setUsers(usersRes.data.users || []);
    } catch (err) {
      console.error('Failed to fetch admin data', err);
      setError(err.response?.data?.message || 'Access denied or error loading admin portal.');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateJobStatus = async (jobId, newStatus) => {
    try {
      await api.patch(`/admin/submissions/${jobId}`, { verificationStatus: newStatus });
      setSubmissions(prev =>
        prev.map(j => (j.id === jobId ? { ...j, verificationStatus: newStatus } : j))
      );
      setSuccessMsg(`Job marked as ${newStatus}`);
      setTimeout(() => setSuccessMsg(''), 3000);
    } catch (err) {
      setError('Failed to update job status');
    }
  };

  const handleDeleteJob = async (jobId) => {
    if (!window.confirm('Are you sure you want to delete this job listing permanently?')) return;
    try {
      await api.delete(`/admin/submissions/${jobId}`);
      setSubmissions(prev => prev.filter(j => j.id !== jobId));
      setSuccessMsg('Job deleted successfully');
      setTimeout(() => setSuccessMsg(''), 3000);
    } catch (err) {
      setError('Failed to delete job');
    }
  };

  const handleAdjustCoins = async (e) => {
    e.preventDefault();
    if (!adjustModalUser || !adjustAmount) return;

    setAdjusting(true);
    try {
      const res = await api.post('/admin/adjust-coins', {
        userId: adjustModalUser.id,
        amount: adjustAmount,
        reason: adjustReason || 'Admin coin balance adjustment',
      });

      setUsers(prev =>
        prev.map(u => (u.id === adjustModalUser.id ? { ...u, coins: res.data.newBalance } : u))
      );
      setSuccessMsg(`Coins adjusted for ${adjustModalUser.name}`);
      setAdjustModalUser(null);
      setAdjustAmount('');
      setAdjustReason('');
      setTimeout(() => setSuccessMsg(''), 3000);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to adjust coins');
    } finally {
      setAdjusting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col font-sans">
        <Navbar />
        <div className="flex-1 flex items-center justify-center">
          <div className="w-8 h-8 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
        </div>
      </div>
    );
  }

  if (error && !stats) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col font-sans">
        <Navbar />
        <div className="flex-1 max-w-xl mx-auto px-4 py-16 text-center">
          <div className="text-4xl mb-3">🛡️</div>
          <h2 className="text-xl font-bold text-gray-900 mb-2">Admin Portal Access Restricted</h2>
          <p className="text-sm text-gray-600 mb-4">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col font-sans">
      <Navbar />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-purple-700 bg-purple-50 px-3 py-1 rounded-full border border-purple-200">
              Admin Moderation Center
            </span>
            <h1 className="text-3xl font-extrabold text-gray-900 mt-2">Platform Overview & Management</h1>
          </div>
          <button
            onClick={fetchAdminData}
            className="px-4 py-2 bg-white border border-gray-200 hover:bg-gray-50 text-gray-700 text-xs font-semibold rounded-xl transition-colors self-start"
          >
            Refresh Data ⟳
          </button>
        </div>

        {successMsg && (
          <div className="mb-6 p-4 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl text-sm font-semibold">
            {successMsg}
          </div>
        )}

        {/* Stats Grid */}
        {stats && (
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-4 mb-8">
            <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-2xs">
              <p className="text-xs font-semibold text-gray-500 uppercase">Total Users</p>
              <h3 className="text-2xl font-black text-gray-900 mt-1">{stats.totalUsers}</h3>
            </div>
            <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-2xs">
              <p className="text-xs font-semibold text-gray-500 uppercase">Jobs Stored</p>
              <h3 className="text-2xl font-black text-gray-900 mt-1">{stats.totalJobs}</h3>
            </div>
            <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-2xs">
              <p className="text-xs font-semibold text-gray-500 uppercase">Verified Openings</p>
              <h3 className="text-2xl font-black text-emerald-600 mt-1">{stats.verifiedJobs}</h3>
            </div>
            <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-2xs">
              <p className="text-xs font-semibold text-gray-500 uppercase">AI Searches Run</p>
              <h3 className="text-2xl font-black text-indigo-600 mt-1">{stats.totalSearches}</h3>
            </div>
            <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-2xs">
              <p className="text-xs font-semibold text-gray-500 uppercase">Total Coins Supply</p>
              <h3 className="text-2xl font-black text-amber-600 mt-1">🪙 {stats.totalCoinsInCirculation}</h3>
            </div>
          </div>
        )}

        {/* Tab switcher */}
        <div className="flex gap-2 border-b border-gray-200 mb-6">
          <button
            onClick={() => setActiveTab('SUBMISSIONS')}
            className={`pb-3 px-4 font-bold text-sm border-b-2 transition-all ${
              activeTab === 'SUBMISSIONS'
                ? 'border-indigo-600 text-indigo-600'
                : 'border-transparent text-gray-500 hover:text-gray-900'
            }`}
          >
            Job Moderation Queue ({submissions.length})
          </button>
          <button
            onClick={() => setActiveTab('USERS')}
            className={`pb-3 px-4 font-bold text-sm border-b-2 transition-all ${
              activeTab === 'USERS'
                ? 'border-indigo-600 text-indigo-600'
                : 'border-transparent text-gray-500 hover:text-gray-900'
            }`}
          >
            User Accounts & Coins ({users.length})
          </button>
        </div>

        {/* Tab 1: Moderation Queue */}
        {activeTab === 'SUBMISSIONS' && (
          <div className="bg-white rounded-2xl shadow-2xs border border-gray-100 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="bg-gray-50 border-b border-gray-100 text-xs uppercase font-bold text-gray-500">
                  <tr>
                    <th className="px-6 py-3.5">Role / Company</th>
                    <th className="px-6 py-3.5">Source</th>
                    <th className="px-6 py-3.5">Status</th>
                    <th className="px-6 py-3.5">Application Link</th>
                    <th className="px-6 py-3.5 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {submissions.map((job) => (
                    <tr key={job.id} className="hover:bg-gray-50/70 transition-colors">
                      <td className="px-6 py-4">
                        <p className="font-bold text-gray-900">{job.title}</p>
                        <p className="text-xs text-gray-500">{job.company} • {job.location || 'Remote'}</p>
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-xs px-2 py-0.5 rounded font-semibold bg-gray-100 text-gray-700">
                          {job.sourceType}
                        </span>
                        {job.createdBy && (
                          <p className="text-[11px] text-gray-400 mt-0.5">by {job.createdBy.name}</p>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        <span
                          className={`text-xs px-2.5 py-1 rounded-full font-bold ${
                            job.verificationStatus === 'VERIFIED'
                              ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                              : job.verificationStatus === 'REJECTED'
                              ? 'bg-red-50 text-red-700 border border-red-200'
                              : 'bg-amber-50 text-amber-700 border border-amber-200'
                          }`}
                        >
                          {job.verificationStatus}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <a
                          href={job.applicationUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-xs text-indigo-600 hover:underline max-w-xs truncate inline-block"
                        >
                          {job.applicationUrl}
                        </a>
                      </td>
                      <td className="px-6 py-4 text-right space-x-2">
                        {job.verificationStatus !== 'VERIFIED' && (
                          <button
                            onClick={() => handleUpdateJobStatus(job.id, 'VERIFIED')}
                            className="px-2.5 py-1 bg-emerald-600 text-white rounded-lg text-xs font-semibold hover:bg-emerald-700"
                          >
                            Approve
                          </button>
                        )}
                        {job.verificationStatus !== 'REJECTED' && (
                          <button
                            onClick={() => handleUpdateJobStatus(job.id, 'REJECTED')}
                            className="px-2.5 py-1 bg-amber-600 text-white rounded-lg text-xs font-semibold hover:bg-amber-700"
                          >
                            Reject
                          </button>
                        )}
                        <button
                          onClick={() => handleDeleteJob(job.id)}
                          className="px-2.5 py-1 bg-red-50 text-red-600 border border-red-200 rounded-lg text-xs font-semibold hover:bg-red-100"
                        >
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Tab 2: Users & Coins */}
        {activeTab === 'USERS' && (
          <div className="bg-white rounded-2xl shadow-2xs border border-gray-100 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="bg-gray-50 border-b border-gray-100 text-xs uppercase font-bold text-gray-500">
                  <tr>
                    <th className="px-6 py-3.5">User</th>
                    <th className="px-6 py-3.5">Role</th>
                    <th className="px-6 py-3.5">Coin Balance</th>
                    <th className="px-6 py-3.5">Activity</th>
                    <th className="px-6 py-3.5 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {users.map((u) => (
                    <tr key={u.id} className="hover:bg-gray-50/70 transition-colors">
                      <td className="px-6 py-4">
                        <p className="font-bold text-gray-900">{u.name}</p>
                        <p className="text-xs text-gray-500">{u.email}</p>
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-xs px-2 py-0.5 rounded font-bold bg-indigo-50 text-indigo-700">
                          {u.role}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span className="font-extrabold text-amber-700">🪙 {u.coins}</span>
                      </td>
                      <td className="px-6 py-4 text-xs text-gray-500">
                        {u._count.createdJobs} Jobs submitted • {u._count.applications} Tracked
                      </td>
                      <td className="px-6 py-4 text-right">
                        <button
                          onClick={() => setAdjustModalUser(u)}
                          className="px-3 py-1.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 rounded-lg text-xs font-semibold transition-colors"
                        >
                          Adjust Coins 🪙
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Coin Adjustment Modal */}
        {adjustModalUser && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4">
            <div className="bg-white rounded-2xl shadow-xl max-w-sm w-full p-6 animate-in fade-in zoom-in-95">
              <h3 className="text-lg font-bold text-gray-900 mb-1">Adjust Coin Balance</h3>
              <p className="text-xs text-gray-500 mb-4">
                User: <strong>{adjustModalUser.name}</strong> (Current: {adjustModalUser.coins} coins)
              </p>

              <form onSubmit={handleAdjustCoins} className="space-y-3">
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">
                    Amount (positive to add, negative to deduct)
                  </label>
                  <input
                    type="number"
                    required
                    placeholder="e.g. 50 or -20"
                    value={adjustAmount}
                    onChange={(e) => setAdjustAmount(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">Reason</label>
                  <input
                    type="text"
                    placeholder="e.g. Promotional bonus or moderation penalty"
                    value={adjustReason}
                    onChange={(e) => setAdjustReason(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                  />
                </div>

                <div className="pt-3 flex justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => setAdjustModalUser(null)}
                    className="px-3 py-1.5 text-xs text-gray-600 hover:bg-gray-100 rounded-lg"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={adjusting}
                    className="px-4 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-semibold shadow-xs"
                  >
                    {adjusting ? 'Saving...' : 'Apply Adjustment'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

export default Admin;

