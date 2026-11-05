import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

function Navbar() {
  const { user, logout, api } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [showHistoryModal, setShowHistoryModal] = useState(false);
  const [history, setHistory] = useState([]);
  const [loadingHistory, setLoadingHistory] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const handleOpenHistory = async () => {
    setShowHistoryModal(true);
    setLoadingHistory(true);
    try {
      const res = await api.get('/coins/history');
      setHistory(res.data.history || []);
    } catch (err) {
      console.error('Failed to load transaction history', err);
    } finally {
      setLoadingHistory(false);
    }
  };

  const isActive = (path) => location.pathname === path;

  return (
    <>
      <header className="bg-white border-b border-gray-100 sticky top-0 z-40 shadow-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          {/* Logo */}
          <div className="flex items-center gap-6">
            <Link to={user ? "/dashboard" : "/"} className="flex items-center gap-2.5">
              <div className="w-9 h-9 bg-gradient-to-tr from-indigo-600 to-violet-600 rounded-xl flex items-center justify-center shadow-xs">
                <span className="text-white font-extrabold text-lg">I</span>
              </div>
              <div className="flex flex-col">
                <span className="font-bold text-gray-900 text-lg leading-tight tracking-tight">InternMatch</span>
                <span className="text-[10px] uppercase font-semibold text-indigo-600 tracking-wider">AI Powered</span>
              </div>
            </Link>

            {/* Nav links */}
            {user && (
              <nav className="hidden lg:flex items-center gap-1">
                <Link
                  to="/dashboard"
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                    isActive('/dashboard')
                      ? 'bg-indigo-50 text-indigo-700'
                      : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                  }`}
                >
                  Jobs & Match
                </Link>
                <Link
                  to="/applications"
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                    isActive('/applications')
                      ? 'bg-indigo-50 text-indigo-700'
                      : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                  }`}
                >
                  Tracker 📋
                </Link>
                <Link
                  to="/profile"
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                    isActive('/profile')
                      ? 'bg-indigo-50 text-indigo-700'
                      : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                  }`}
                >
                  AI Profile
                </Link>
                <Link
                  to="/upload-resume"
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                    isActive('/upload-resume')
                      ? 'bg-indigo-50 text-indigo-700'
                      : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                  }`}
                >
                  Upload Resume
                </Link>
                <Link
                  to="/submit-job"
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                    isActive('/submit-job')
                      ? 'bg-amber-50 text-amber-800'
                      : 'text-amber-700 hover:bg-amber-50'
                  }`}
                >
                  Submit Job (+5🪙)
                </Link>

                {/* Hirer Portal */}
                {(user.role === 'HIRER' || user.role === 'ADMIN') && (
                  <Link
                    to="/hirer"
                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                      isActive('/hirer')
                        ? 'bg-blue-50 text-blue-700'
                        : 'text-blue-600 hover:bg-blue-50'
                    }`}
                  >
                    Hirer
                  </Link>
                )}

                {/* Admin Portal */}
                {user.role === 'ADMIN' && (
                  <Link
                    to="/admin"
                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                      isActive('/admin')
                        ? 'bg-purple-50 text-purple-700'
                        : 'text-purple-700 hover:bg-purple-50'
                    }`}
                  >
                    Admin 🛡️
                  </Link>
                )}
              </nav>
            )}
          </div>

          {/* Right section */}
          <div className="flex items-center gap-3">
            {user ? (
              <>
                {/* Coins Pill */}
                <button
                  onClick={handleOpenHistory}
                  title="Click to view Coin History"
                  className="flex items-center gap-1.5 bg-gradient-to-r from-amber-50 to-yellow-50 border border-amber-200/80 px-3 py-1.5 rounded-full hover:border-amber-300 transition-all shadow-xs group"
                >
                  <span className="text-base group-hover:scale-110 transition-transform">🪙</span>
                  <span className="font-bold text-amber-900 text-sm">{user.coins ?? 0}</span>
                  <span className="text-xs text-amber-700 font-medium hidden sm:inline">Coins</span>
                </button>

                {/* User avatar / Logout */}
                <div className="flex items-center gap-2 pl-2 border-l border-gray-200">
                  <div className="w-8 h-8 rounded-full bg-indigo-100 text-indigo-700 font-bold flex items-center justify-center text-xs">
                    {(user.name || 'U').charAt(0).toUpperCase()}
                  </div>
                  <button
                    onClick={handleLogout}
                    className="text-xs text-gray-500 hover:text-red-600 font-medium px-2 py-1 rounded hover:bg-gray-50 transition-colors"
                  >
                    Logout
                  </button>
                </div>
              </>
            ) : (
              <div className="flex items-center gap-2">
                <Link to="/login" className="text-sm font-medium text-gray-600 hover:text-gray-900 px-3 py-2">
                  Sign in
                </Link>
                <Link
                  to="/signup"
                  className="text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 px-4 py-2 rounded-lg transition-colors shadow-sm"
                >
                  Claim 100 Coins Free
                </Link>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Coin History Modal */}
      {showHistoryModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4">
          <div className="bg-white rounded-2xl shadow-xl max-w-md w-full p-6 animate-in fade-in zoom-in-95">
            <div className="flex justify-between items-center pb-4 border-b border-gray-100">
              <div className="flex items-center gap-2">
                <span className="text-2xl">🪙</span>
                <div>
                  <h3 className="text-lg font-bold text-gray-900">Coin Ledger</h3>
                  <p className="text-xs text-gray-500">Current Balance: <span className="font-semibold text-amber-700">{user?.coins ?? 0} coins</span></p>
                </div>
              </div>
              <button
                onClick={() => setShowHistoryModal(false)}
                className="text-gray-400 hover:text-gray-600 rounded-lg p-1.5"
              >
                ✕
              </button>
            </div>

            <div className="mt-4 max-h-72 overflow-y-auto space-y-2">
              {loadingHistory ? (
                <div className="py-8 text-center text-gray-400 text-sm">Loading transactions...</div>
              ) : history.length === 0 ? (
                <div className="py-8 text-center text-gray-400 text-sm">No transactions found.</div>
              ) : (
                history.map((tx) => (
                  <div key={tx.id} className="flex items-center justify-between p-3 rounded-xl bg-gray-50/70 border border-gray-100 text-sm">
                    <div>
                      <p className="font-medium text-gray-900">{tx.description || tx.type}</p>
                      <p className="text-[11px] text-gray-400">
                        {new Date(tx.createdAt).toLocaleDateString()} {new Date(tx.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </p>
                    </div>
                    <span
                      className={`font-bold text-sm px-2.5 py-1 rounded-full ${
                        tx.amount > 0 ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                      }`}
                    >
                      {tx.amount > 0 ? `+${tx.amount}` : tx.amount}
                    </span>
                  </div>
                ))
              )}
            </div>

            <div className="mt-5 pt-3 border-t border-gray-100 flex justify-end">
              <button
                onClick={() => setShowHistoryModal(false)}
                className="px-4 py-2 text-sm bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg font-medium transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

export default Navbar;
