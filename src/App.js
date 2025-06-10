import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import AdminDashboard from './Pages/AdminDashboard.js';

import UserDashboard from './Pages/UserDashboard';
import ReportDetails from './Pages/ReportDetails.js';
import Register from './Pages/Register.js';
import Index from './Pages/Index.js';
import Login from './Pages/Login.js';

function App() {
    return (
        <>
            <Router>
                <Routes>
                    <Route path="/" element={<Index />} />
                    <Route path="/Login" element={<Login />} />
                    <Route path="/admin-dashboard" element={<AdminDashboard />} />
                    <Route path="/user-dashboard" element={<UserDashboard />} />
                    <Route path="/report/:id" element={<ReportDetails />} />
                    <Route path="/Register" element={<Register />} />
                </Routes>
            </Router>
        </>
    );
}

export default App;
