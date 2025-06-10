import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import CameraView from '../components/CameraView.js';
import '../cssFolder/UserDashboard.css';
import img1 from '../assets/8334315.png';
import Spinner from '../components/Spinner.js';
import AnimatedBackground from '../components/AnimatedBackground.js';
import api from '../api';

function UserDashboard() {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const navigate = useNavigate();

    useEffect(() => {
        const fetchUserData = async () => {
            setLoading(true);
            setError('');
            try {
                // Fetch the logged-in user's data, which includes assigned cameras
                const data = await api('/auth/user');
                setUser(data.user);
            } catch (err) {
                setError(err.message);
                // If token is invalid or expired, redirect to login
                if (err.message.includes('401') || err.message.includes('Unauthenticated')) {
                    navigate('/login');
                }
            } finally {
                setLoading(false);
            }
        };

        const token = localStorage.getItem('token');
        if (!token) {
            navigate('/login');
        } else {
            fetchUserData();
        }
    }, [navigate]);
    
    if (loading) return <Spinner />;

    return (
        <div className="dashboard-container">
            <AnimatedBackground />
            <div className="sidebar" style={{ textAlign: "center" }}>
                <h2>Surveillance System</h2>
                <img src={img1} alt="Logo" style={{ width: '30%', marginInline: "auto" }} />
                {error ? (
                    <p className="error-text">{error}</p>
                ) : (
                    <p className="welcome-text">Welcome, {user?.name || 'User'}</p>
                )}
                <button className="logout-button" onClick={() => {
                    localStorage.removeItem('token');
                    localStorage.removeItem('role');
                    localStorage.removeItem('name');
                    navigate('/');
                }}>Logout</button>
            </div>

            <div className="main-content">
                <h1 style={{ textAlign: "center" }}>My Assigned Cameras</h1>
                <div className="camera-grid">
                    {user?.cameras && user.cameras.length > 0 ? (
                        user.cameras.map(camera => (
                            <CameraView
                                key={camera.id}
                                cameraNumber={camera.id} // The API for send-video needs the camera ID
                                viewMode="single"
                            />
                        ))
                    ) : (
                        <div className="no-cameras-message">
                            <p>You have no cameras assigned to you.</p>
                            <p>Please contact an administrator.</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
export default UserDashboard;