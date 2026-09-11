import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Home from './pages/Home';
import Login from './pages/Login';

import { AuthProvider } from './context/AuthContext';
import UploadResume from './pages/UploadResume';

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Login />} />
          <Route path="/upload-resume" element={<UploadResume />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
