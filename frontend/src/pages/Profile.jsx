import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Navbar from '../components/Navbar';

function Profile() {
  const { api, user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState(location.state?.justUploaded ? 'Resume parsed successfully! Review and edit your profile below.' : '');
  const [error, setError] = useState('');

  const [profile, setProfile] = useState({
    fullName: '',
    email: '',
    phone: '',
    graduationYear: 2025,
    preferredRoles: [],
    preferredLocations: [],
    skills: [],
    programmingLanguages: [],
    frameworks: [],
    databases: [],
    tools: [],
  });

  const [newSkill, setNewSkill] = useState('');
  const [newRole, setNewRole] = useState('');

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    setLoading(true);
    try {
      const res = await api.get('/profile');
      if (res.data.profile) {
        setProfile({
          ...res.data.profile,
          skills: res.data.profile.skills || [],
          preferredRoles: res.data.profile.preferredRoles || [],
          preferredLocations: res.data.profile.preferredLocations || [],
          programmingLanguages: res.data.profile.programmingLanguages || [],
          frameworks: res.data.profile.frameworks || [],
          databases: res.data.profile.databases || [],
          tools: res.data.profile.tools || [],
        });
      }
    } catch (err) {
      if (err.response?.status === 404) {
        setError('No profile found. Please upload your resume first.');
      } else {
        setError('Failed to load profile.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async (e) => {
    if (e) e.preventDefault();
    setSaving(true);
    setError('');
    try {
      await api.put('/profile', profile);
      setMessage('Profile updated successfully!');
      setTimeout(() => setMessage(''), 3000);
    } catch (err) {
      setError('Failed to update profile.');
    } finally {
      setSaving(false);
    }
  };

  const handleAddSkill = (e) => {
    e.preventDefault();
    if (newSkill.trim() && !profile.skills.includes(newSkill.trim())) {
      setProfile({
        ...profile,
        skills: [...profile.skills, newSkill.trim()]
      });
      setNewSkill('');
    }
  };

  const handleRemoveSkill = (skillToRemove) => {
    setProfile({
      ...profile,
      skills: profile.skills.filter(s => s !== skillToRemove)
    });
  };

  const handleAddRole = (e) => {
    e.preventDefault();
    if (newRole.trim() && !profile.preferredRoles.includes(newRole.trim())) {
      setProfile({
        ...profile,
        preferredRoles: [...profile.preferredRoles, newRole.trim()]
      });
      setNewRole('');
    }
  };

  const handleRemoveRole = (roleToRemove) => {
    setProfile({
      ...profile,
      preferredRoles: profile.preferredRoles.filter(r => r !== roleToRemove)
    });
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

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col font-sans">
      <Navbar />

      <main className="flex-1 max-w-4xl w-full mx-auto px-4 py-8">
        {/* Header bar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900">AI Candidate Profile</h1>
            <p className="text-sm text-gray-500 mt-1">Review and refine your profile to maximize matching accuracy.</p>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate('/dashboard')}
              className="px-4 py-2 bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-700 hover:to-violet-700 text-white rounded-xl text-sm font-semibold shadow-sm hover:shadow transition-all flex items-center gap-2"
            >
              <span>Search Jobs (-10🪙)</span>
              <span>&rarr;</span>
            </button>
          </div>
        </div>

        {message && (
          <div className="mb-6 p-4 bg-green-50 border border-green-200 text-green-800 rounded-xl text-sm font-medium">
            {message}
          </div>
        )}

        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 text-red-700 rounded-xl text-sm flex items-center justify-between">
            <span>{error}</span>
            {error.includes('upload') && (
              <button
                onClick={() => navigate('/upload-resume')}
                className="underline font-semibold ml-2 hover:text-red-900"
              >
                Go to Upload
              </button>
            )}
          </div>
        )}

        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 sm:p-8 space-y-8">
          {/* Basic Details */}
          <section>
            <h3 className="text-base font-bold text-gray-900 mb-4 pb-2 border-b border-gray-100 flex items-center gap-2">
              <span>👤</span> Candidate Details
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-gray-600 uppercase tracking-wider mb-1">
                  Full Name
                </label>
                <input
                  type="text"
                  value={profile.fullName || ''}
                  onChange={(e) => setProfile({ ...profile, fullName: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-lg border border-gray-200 text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-600 uppercase tracking-wider mb-1">
                  Graduation Batch / Year
                </label>
                <input
                  type="number"
                  placeholder="e.g. 2025"
                  value={profile.graduationYear || ''}
                  onChange={(e) => setProfile({ ...profile, graduationYear: parseInt(e.target.value, 10) || null })}
                  className="w-full px-3.5 py-2.5 rounded-lg border border-gray-200 text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-600 uppercase tracking-wider mb-1">
                  Email
                </label>
                <input
                  type="email"
                  value={profile.email || ''}
                  onChange={(e) => setProfile({ ...profile, email: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-lg border border-gray-200 text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-600 uppercase tracking-wider mb-1">
                  Phone
                </label>
                <input
                  type="text"
                  value={profile.phone || ''}
                  onChange={(e) => setProfile({ ...profile, phone: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-lg border border-gray-200 text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                />
              </div>
            </div>
          </section>

          {/* Preferred Target Roles */}
          <section>
            <h3 className="text-base font-bold text-gray-900 mb-4 pb-2 border-b border-gray-100 flex items-center gap-2">
              <span>🎯</span> Target Roles
            </h3>
            <div className="flex flex-wrap gap-2 mb-3">
              {profile.preferredRoles?.map((role, idx) => (
                <span
                  key={idx}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-indigo-50 text-indigo-700 border border-indigo-100"
                >
                  {role}
                  <button
                    type="button"
                    onClick={() => handleRemoveRole(role)}
                    className="hover:text-red-500 font-bold"
                  >
                    ×
                  </button>
                </span>
              ))}
            </div>
            <form onSubmit={handleAddRole} className="flex gap-2 max-w-sm">
              <input
                type="text"
                placeholder="Add role (e.g. Backend Intern)"
                value={newRole}
                onChange={(e) => setNewRole(e.target.value)}
                className="flex-1 px-3 py-1.5 rounded-lg border border-gray-200 text-xs focus:ring-2 focus:ring-indigo-500 focus:outline-none"
              />
              <button
                type="submit"
                className="px-3 py-1.5 bg-gray-100 hover:bg-gray-200 text-gray-800 text-xs rounded-lg font-medium transition-colors"
              >
                + Add
              </button>
            </form>
          </section>

          {/* Technical Skills */}
          <section>
            <h3 className="text-base font-bold text-gray-900 mb-4 pb-2 border-b border-gray-100 flex items-center gap-2">
              <span>💻</span> Technical Skills & Stack
            </h3>
            <div className="flex flex-wrap gap-2 mb-3">
              {profile.skills?.map((skill, idx) => (
                <span
                  key={idx}
                  className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-emerald-50 text-emerald-800 border border-emerald-100"
                >
                  {skill}
                  <button
                    type="button"
                    onClick={() => handleRemoveSkill(skill)}
                    className="hover:text-red-500 font-bold"
                  >
                    ×
                  </button>
                </span>
              ))}
            </div>
            <form onSubmit={handleAddSkill} className="flex gap-2 max-w-sm">
              <input
                type="text"
                placeholder="Add skill (e.g. Docker, Redis)"
                value={newSkill}
                onChange={(e) => setNewSkill(e.target.value)}
                className="flex-1 px-3 py-1.5 rounded-lg border border-gray-200 text-xs focus:ring-2 focus:ring-indigo-500 focus:outline-none"
              />
              <button
                type="submit"
                className="px-3 py-1.5 bg-gray-100 hover:bg-gray-200 text-gray-800 text-xs rounded-lg font-medium transition-colors"
              >
                + Add
              </button>
            </form>
          </section>

          {/* Save Button */}
          <div className="pt-4 border-t border-gray-100 flex justify-end gap-3">
            <button
              onClick={() => navigate('/upload-resume')}
              className="px-5 py-2.5 rounded-xl border border-gray-200 text-gray-700 hover:bg-gray-50 text-sm font-semibold transition-colors"
            >
              Re-upload Resume
            </button>
            <button
              onClick={handleSave}
              disabled={saving}
              className="px-6 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold shadow-sm hover:shadow transition-all disabled:opacity-50"
            >
              {saving ? 'Saving...' : 'Save Profile Changes'}
            </button>
          </div>
        </div>
      </main>
    </div>
  );
}

export default Profile;

