import React from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

function UploadResume() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center font-sans">
      <div className="bg-white p-8 rounded-xl shadow-md text-center max-w-md w-full">
        <h1 className="text-3xl font-bold text-indigo-600 mb-4">Welcome, {user?.name || 'User'}!</h1>
        <p className="text-gray-600 mb-8">Authentication was successful. You are now logged in securely with JWT.</p>
        
        <div className="p-4 bg-indigo-50 border border-indigo-100 rounded-lg mb-8">
          <p className="text-sm text-indigo-800 font-medium">This is where the Resume Upload Drag-and-Drop area will go in Phase 3.</p>
        </div>

        <button 
          onClick={handleLogout}
          className="bg-red-500 text-white px-6 py-2 rounded-lg font-medium hover:bg-red-600 transition-colors"
        >
          Logout
        </button>
      </div>
    </div>
  );
}

export default UploadResume;
