import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Navbar from '../components/Navbar';

const STATUS_COLUMNS = [
  { key: 'SAVED', label: 'Saved', color: 'border-blue-200 bg-blue-50/50 text-blue-700', badge: 'bg-blue-100 text-blue-800' },
  { key: 'APPLIED', label: 'Applied', color: 'border-indigo-200 bg-indigo-50/50 text-indigo-700', badge: 'bg-indigo-100 text-indigo-800' },
  { key: 'INTERVIEW', label: 'Interviewing', color: 'border-amber-200 bg-amber-50/50 text-amber-700', badge: 'bg-amber-100 text-amber-800' },
  { key: 'OFFER', label: 'Offer Received', color: 'border-emerald-200 bg-emerald-50/50 text-emerald-700', badge: 'bg-emerald-100 text-emerald-800' },
  { key: 'REJECTED', label: 'Rejected', color: 'border-gray-200 bg-gray-50/50 text-gray-700', badge: 'bg-gray-100 text-gray-700' },
];

function Applications() {
  const { api } = useAuth();
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingNotesId, setEditingNotesId] = useState(null);
  const [notesText, setNotesText] = useState('');

  useEffect(() => {
    fetchApplications();
  }, []);

  const fetchApplications = async () => {
    setLoading(true);
    try {
      const res = await api.get('/applications');
      setApplications(res.data.applications || []);
    } catch (err) {
      console.error('Failed to fetch applications', err);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (appId, newStatus) => {
    try {
      await api.patch(`/applications/${appId}/status`, { status: newStatus });
      setApplications(prev =>
        prev.map(app => (app.id === appId ? { ...app, status: newStatus } : app))
      );
    } catch (err) {
      console.error('Failed to update status', err);
    }
  };

  const handleSaveNotes = async (appId) => {
    try {
      await api.patch(`/applications/${appId}/status`, { notes: notesText });
      setApplications(prev =>
        prev.map(app => (app.id === appId ? { ...app, notes: notesText } : app))
      );
      setEditingNotesId(null);
    } catch (err) {
      console.error('Failed to update notes', err);
    }
  };

  const handleDelete = async (appId) => {
    if (!window.confirm('Remove this job from your tracker?')) return;
    try {
      await api.delete(`/applications/${appId}`);
      setApplications(prev => prev.filter(app => app.id !== appId));
    } catch (err) {
      console.error('Failed to delete application', err);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col font-sans">
      <Navbar />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900">Application Tracker</h1>
            <p className="text-sm text-gray-500 mt-1">Organize and monitor the progress of your internship & job applications.</p>
          </div>
          <Link
            to="/dashboard"
            className="px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-sm font-semibold shadow-xs transition-colors inline-flex items-center gap-2 self-start"
          >
            <span>+ Discover More Jobs</span>
          </Link>
        </div>

        {loading ? (
          <div className="py-20 text-center">
            <div className="w-8 h-8 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto mb-3"></div>
            <p className="text-sm text-gray-500">Loading your tracker...</p>
          </div>
        ) : applications.length === 0 ? (
          <div className="bg-white rounded-3xl border border-gray-100 p-12 text-center shadow-xs">
            <div className="w-16 h-16 bg-indigo-50 text-indigo-600 rounded-2xl flex items-center justify-center text-3xl mx-auto mb-4">
              📋
            </div>
            <h3 className="text-lg font-bold text-gray-900">Your Tracker is Empty</h3>
            <p className="text-sm text-gray-500 max-w-md mx-auto mt-1 mb-6">
              You haven't saved or tracked any jobs yet. Browse matched opportunities on your Dashboard and click "Save Job" to track your applications here.
            </p>
            <Link
              to="/dashboard"
              className="px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-sm rounded-xl shadow-xs transition-colors"
            >
              Go to Jobs Dashboard
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
            {STATUS_COLUMNS.map(col => {
              const colApps = applications.filter(app => app.status === col.key);

              return (
                <div key={col.key} className="flex flex-col bg-gray-100/70 rounded-2xl p-3 min-h-[500px]">
                  {/* Column Header */}
                  <div className="flex items-center justify-between pb-3 mb-3 border-b border-gray-200">
                    <span className="font-bold text-xs uppercase tracking-wider text-gray-700">{col.label}</span>
                    <span className="bg-white text-gray-700 text-xs font-bold px-2 py-0.5 rounded-full border border-gray-200">
                      {colApps.length}
                    </span>
                  </div>

                  {/* Cards */}
                  <div className="space-y-3 flex-1 overflow-y-auto">
                    {colApps.map(app => (
                      <div
                        key={app.id}
                        className="bg-white rounded-xl p-4 shadow-2xs border border-gray-200 hover:shadow-xs transition-all flex flex-col justify-between"
                      >
                        <div>
                          <div className="flex items-start justify-between gap-1 mb-1">
                            <span className="text-[11px] font-bold text-indigo-600 uppercase">
                              {app.job?.company}
                            </span>
                            <button
                              onClick={() => handleDelete(app.id)}
                              className="text-gray-300 hover:text-red-500 text-xs"
                              title="Delete from tracker"
                            >
                              ✕
                            </button>
                          </div>

                          <h4 className="text-sm font-bold text-gray-900 leading-snug">
                            {app.job?.title}
                          </h4>
                          <p className="text-[11px] text-gray-400 mt-0.5">
                            📍 {app.job?.location || 'Remote'}
                          </p>

                          {/* Notes */}
                          <div className="mt-2.5">
                            {editingNotesId === app.id ? (
                              <div className="space-y-1.5">
                                <textarea
                                  value={notesText}
                                  onChange={(e) => setNotesText(e.target.value)}
                                  placeholder="Add interview notes, deadlines..."
                                  rows={2}
                                  className="w-full text-xs p-1.5 border border-gray-300 rounded focus:ring-1 focus:ring-indigo-500 focus:outline-none"
                                />
                                <div className="flex justify-end gap-1">
                                  <button
                                    onClick={() => setEditingNotesId(null)}
                                    className="text-[10px] px-2 py-0.5 text-gray-500 hover:bg-gray-100 rounded"
                                  >
                                    Cancel
                                  </button>
                                  <button
                                    onClick={() => handleSaveNotes(app.id)}
                                    className="text-[10px] px-2 py-0.5 bg-indigo-600 text-white rounded font-medium"
                                  >
                                    Save
                                  </button>
                                </div>
                              </div>
                            ) : (
                              <div
                                onClick={() => {
                                  setEditingNotesId(app.id);
                                  setNotesText(app.notes || '');
                                }}
                                className="text-[11px] text-gray-500 bg-gray-50 p-1.5 rounded border border-gray-100 cursor-pointer hover:bg-gray-100 transition-colors"
                              >
                                {app.notes ? app.notes : <span className="italic text-gray-400">+ Add note</span>}
                              </div>
                            )}
                          </div>
                        </div>

                        {/* Status select & Apply link */}
                        <div className="mt-3 pt-2.5 border-t border-gray-100 flex items-center justify-between gap-1">
                          <select
                            value={app.status}
                            onChange={(e) => handleStatusChange(app.id, e.target.value)}
                            className="text-[11px] font-semibold bg-gray-50 border border-gray-200 rounded px-1.5 py-1 text-gray-700 focus:outline-none"
                          >
                            <option value="SAVED">Saved</option>
                            <option value="APPLIED">Applied</option>
                            <option value="INTERVIEW">Interview</option>
                            <option value="OFFER">Offer</option>
                            <option value="REJECTED">Rejected</option>
                          </select>

                          {app.job?.applicationUrl && (
                            <a
                              href={app.job.applicationUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-[11px] text-indigo-600 hover:text-indigo-800 font-bold flex items-center gap-0.5"
                            >
                              <span>Apply</span>
                              <span>↗</span>
                            </a>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
}

export default Applications;

