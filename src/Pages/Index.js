import React from 'react';
import { FaVideo, FaExclamationTriangle, FaFileVideo } from 'react-icons/fa';
import '../cssFolder/Index.css';
import img1 from '../assets/8334315.png';
import NavBar from '../components/NavBar';
import AboutUs from '../components/AboutUs';
import vid1 from '../assets/file.mp4'
function Index() {
  return (
    <div className="landing-page" style={{ backgroundColor: 'rgb(75 57 118)' }}>
      <div className="video-background">
        <video autoPlay muted loop className="background-video">
          <source src={vid1} type="video/mp4" />
        </video>
        <div className="video-overlay"></div>
      </div>
      <NavBar />
      <div className="background-cameras">
        <FaVideo className="floating-camera camera1" />
        <FaVideo className="floating-camera camera2" />
        <FaVideo className="floating-camera camera3" />
      </div>
      <div className="header">
        <div className="logo-container">
          <img src={img1} alt="Security Logo" className="logo" />
          <h1>Security Surveillance System</h1>
        </div>
      </div>
      <div className="main-content">
      <h2>Advanced Security Monitoring Solution</h2>
      <p>Protect your premises with AI-powered surveillance</p>
        <div className="features-grid">
          <div className="feature-card">
            <div className="icon-container">
              <FaVideo className="feature-icon" />
            </div>
            <h3>Multi-Camera Support</h3>
            <p>Monitor multiple cameras from a single dashboard</p>
          </div>
          <div className="feature-card">
            <div className="icon-container">
              <FaExclamationTriangle className="feature-icon" />
            </div>
            <h3>Violence Detection</h3>
            <p>AI-powered violence detection with instant alerts</p>
          </div>
          <div className="feature-card">
            <div className="icon-container">
              <FaFileVideo className="feature-icon" />
            </div>
            <h3>Incident Reports</h3>
            <p>Detailed incident reports with video evidence</p>
          </div>
        </div>
      </div>
      <AboutUs />
    </div>
  );
}

export default Index;