// UserDashboard.js
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import CameraView from '../components/CameraView.js';
import '../cssFolder/UserDashboard.css';
import img1 from '../assets/8334315.png';
import Spinner from '../components/Spinner.js';

function UserDashboard() {
    const [viewMode, setViewMode] = useState('all'); // 'all' || 'cam1' || 'cam2' || 'cam3' || 'cam4'
    const [username, setUsername] = useState('');
    const [loading, setLoading] = useState(true);
    useEffect(() => {
        const timer = setTimeout(() => setLoading(false), 2000);
        return () => clearTimeout(timer); // Cleanup timer on unmount
    }, []);
    const navigate = useNavigate();

    useEffect(() => {
        const token = localStorage.getItem('token');
        const role = localStorage.getItem('role');
        console.log(token);
        if (!token || role !== 'user') {
            
            navigate('/login');
            return;
        }

        const storedUsername = localStorage.getItem('username') || 'User';
        setUsername(storedUsername);
    }, [navigate]);
    if (loading) {
        return <Spinner/>;
    }
    return (
        <div className="dashboard-container">
            <div className="sidebar" style={{ textAlign: "center" }}>
                <h2>Surveillance System</h2>
                <img src={img1} alt="Camera A" style={{ width: '30%', transform: 'scaleX(-1)', marginInline: "auto" }} />
                <p className="welcome-text">Welcome, {username}</p>
                <h3>View Options</h3>
                <button onClick={() => setViewMode('cam1')}>Camera 1</button>
                <button onClick={() => setViewMode('cam2')}>Camera 2</button>
                <button onClick={() => setViewMode('cam3')}>Camera 3</button>
                <button onClick={() => setViewMode('cam4')}>Camera 4</button>
                <button onClick={() => setViewMode('all')}>All Cameras</button>
                <button className="logout-button" onClick={() => {
                    localStorage.removeItem('token');
                    localStorage.removeItem('username');
                    navigate('/');
                }}>Logout</button>
            </div>

            <div className="main-content">
                <h1 style={{ textAlign: "center" }}>User Dashboard</h1>
                {viewMode === 'all' ? (
                    <div className="camera-grid">
                        {[1, 2, 3, 4].map(num => (
                            <CameraView
                                key={num}
                                cameraNumber={num}
                                
                                viewMode="all"  // تمرير وضع "all"
                            />
                        ))}
                    </div>
                ) : (
                    <CameraView
                        cameraNumber={viewMode.replace('cam', '')}
                        viewMode="single" // تمرير وضع "single"
                    />
                )}

                
            </div>
        </div>
    );
}
export default UserDashboard;