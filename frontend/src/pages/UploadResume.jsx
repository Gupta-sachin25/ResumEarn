import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Navbar from '../components/Navbar';

function UploadResume() {
  const { api, refreshUser } = useAuth();
  const navigate = useNavigate();

  const [file, setFile] = useState(null);
  const [dragActive, setDragActive] = useState(false);
  const [loading, setLoading] = useState(false);
  const [statusMessage, setStatusMessage] = useState('');
  const [error, setError] = useState('');
  const fileInputRef = useRef(null);

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileSelected(e.dataTransfer.files[0]);
    }
  };

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      handleFileSelected(e.target.files[0]);
    }
  };

  const handleFileSelected = (selectedFile) => {
    setError('');
    if (selectedFile.type !== 'application/pdf' && !selectedFile.name.toLowerCase().endsWith('.pdf')) {
      setError('Please select a valid PDF file.');
      return;
    }
    if (selectedFile.size > 5 * 1024 * 1024) {
      setError('File size exceeds the 5MB limit.');
      return;
    }
    setFile(selectedFile);
  };

  const handleUpload = async () => {
    if (!file) {
      setError('Please choose a PDF file first.');
      return;
    }

    setLoading(true);
    setError('');
    setStatusMessage('Reading PDF and extracting text...');

    const formData = new FormData();
    formData.append('resume', file);

    try {
      setStatusMessage('Gemini AI is analyzing your skills, education, and experience...');
      const response = await api.post('/resumes/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      setStatusMessage('Profile extracted! Redirecting to review...');
      await refreshUser();

      setTimeout(() => {
        navigate('/profile', { state: { profile: response.data.profile, justUploaded: true } });
      }, 700);
    } catch (err) {
      console.error('Upload failed', err);
      setError(err.response?.data?.message || 'Failed to process resume. Please try again.');
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col font-sans">
      <Navbar />

      <main className="flex-1 max-w-3xl w-full mx-auto px-4 py-12 flex flex-col items-center justify-center">
        <div className="text-center mb-8">
          <span className="text-xs font-semibold uppercase tracking-wider text-indigo-600 bg-indigo-50 px-3 py-1 rounded-full">
            Step 1: Profile Initialization
          </span>
          <h1 className="text-3xl font-extrabold text-gray-900 mt-3 sm:text-4xl">
            Upload Your Resume
          </h1>
          <p className="mt-2 text-base text-gray-600 max-w-lg mx-auto">
            Our AI will parse your technical skills, graduation batch, and projects into a smart candidate profile for real-time job matching.
          </p>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 w-full">
          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl text-red-700 text-sm flex items-center justify-between">
              <span>{error}</span>
              <button onClick={() => setError('')} className="text-red-500 hover:text-red-700 font-bold ml-2">✕</button>
            </div>
          )}

          {/* Drag and Drop Zone */}
          <div
            onDragEnter={handleDrag}
            onDragLeave={handleDrag}
            onDragOver={handleDrag}
            onDrop={handleDrop}
            onClick={() => !loading && fileInputRef.current.click()}
            className={`border-2 border-dashed rounded-xl p-10 text-center cursor-pointer transition-all ${
              dragActive
                ? 'border-indigo-500 bg-indigo-50/50 scale-[1.01]'
                : file
                ? 'border-green-400 bg-green-50/20'
                : 'border-gray-200 hover:border-indigo-400 hover:bg-gray-50/50'
            }`}
          >
            <input
              ref={fileInputRef}
              type="file"
              accept=".pdf,application/pdf"
              onChange={handleFileChange}
              className="hidden"
              disabled={loading}
            />

            <div className="w-16 h-16 mx-auto mb-4 bg-indigo-50 text-indigo-600 rounded-2xl flex items-center justify-center text-3xl">
              {file ? '📄' : '☁️'}
            </div>

            {file ? (
              <div>
                <p className="font-semibold text-gray-900 text-base">{file.name}</p>
                <p className="text-xs text-gray-500 mt-1">
                  {(file.size / (1024 * 1024)).toFixed(2)} MB • PDF Document
                </p>
                <p className="text-xs text-indigo-600 font-medium mt-2">
                  Click or drop a different file to replace
                </p>
              </div>
            ) : (
              <div>
                <p className="font-semibold text-gray-800 text-base">
                  Drag and drop your PDF resume here, or <span className="text-indigo-600 underline">browse</span>
                </p>
                <p className="text-xs text-gray-400 mt-2">Supports PDF files up to 5MB</p>
              </div>
            )}
          </div>

          {/* Upload Status / Button */}
          <div className="mt-6 flex flex-col gap-3">
            {loading && (
              <div className="p-4 bg-indigo-50/80 rounded-xl border border-indigo-100 flex items-center gap-3">
                <div className="w-5 h-5 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin shrink-0"></div>
                <span className="text-sm font-medium text-indigo-900">{statusMessage}</span>
              </div>
            )}

            <button
              onClick={handleUpload}
              disabled={!file || loading}
              className="w-full py-3.5 px-6 rounded-xl font-semibold text-white bg-indigo-600 hover:bg-indigo-700 disabled:bg-gray-200 disabled:text-gray-400 disabled:cursor-not-allowed shadow-md hover:shadow-lg transition-all text-base"
            >
              {loading ? 'Processing Resume...' : 'Analyze Resume with AI'}
            </button>
          </div>
        </div>

        {/* Info card */}
        <div className="mt-8 grid grid-cols-1 sm:grid-cols-3 gap-4 w-full text-center">
          <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-xs">
            <span className="text-xl">⚡</span>
            <h4 className="font-bold text-gray-800 text-sm mt-1">Instant Extraction</h4>
            <p className="text-xs text-gray-500 mt-0.5">Extracts skills, education, and past projects in seconds.</p>
          </div>
          <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-xs">
            <span className="text-xl">🎯</span>
            <h4 className="font-bold text-gray-800 text-sm mt-1">Accurate Eligibility</h4>
            <p className="text-xs text-gray-500 mt-0.5">Detects graduation batch to prevent applying to ineligible jobs.</p>
          </div>
          <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-xs">
            <span className="text-xl">🔒</span>
            <h4 className="font-bold text-gray-800 text-sm mt-1">Private & Safe</h4>
            <p className="text-xs text-gray-500 mt-0.5">Keeps your documents and data strictly confidential.</p>
          </div>
        </div>
      </main>
    </div>
  );
}

export default UploadResume;
