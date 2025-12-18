import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import LandingPage from './pages/LandingPage';
import Dashboard from './pages/Dashboard';
import Login from './pages/Login';
import Signup from './pages/Signup';
import DatasetScanning from './pages/DatasetScanning';
import DatasetReport from './pages/DatasetReport';
import DuplicateRecords from './pages/DuplicateRecords';
import DashboardLayout from './components/layout/DashboardLayout';

import Reports from './pages/Reports';
import Settings from './pages/Settings';

import Datasets from './pages/Datasets';
import ChatAssistant from './pages/ChatAssistant';

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />

        <Route path="/dashboard" element={<DashboardLayout />}>
          <Route index element={<Dashboard />} />
          <Route path="scanning" element={<DatasetScanning />} />
          <Route path="scanning" element={<DatasetScanning />} />
          <Route path="report/:id" element={<DatasetReport />} />
          <Route path="report/:id/duplicates" element={<DuplicateRecords />} />
          <Route path="datasets" element={<Datasets />} />
          <Route path="reports" element={<Reports />} />
          <Route path="settings" element={<Settings />} />
          <Route path="assistant" element={<ChatAssistant />} />
        </Route>

        <Route path="*" element={<LandingPage />} />
      </Routes>
    </BrowserRouter>
  );
}
