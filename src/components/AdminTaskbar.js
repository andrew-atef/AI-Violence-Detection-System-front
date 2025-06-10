import React, { useState } from 'react';
import propTypes from "prop-types";
import logo from '../assets/8334315.png';
import '../cssFolder/adminTaskbar.css';
import { useNavigate } from 'react-router-dom';
import { FaChartBar, FaUsers, FaVideo } from 'react-icons/fa';

function AdminTaskbar({ onItemSelect }) {
  const navigate = useNavigate();
  const [activeItem, setActiveItem] = useState('reports');

  const handleItemClick = (item) => {
    setActiveItem(item);
    onItemSelect(item);
  };

  return (
    <div className="admin-sidebar">
      <div className="admin-sidebar-profile">
        <img src={logo} alt="Admin" className="admin-sidebar-avatar" />
      </div>

      <nav className="admin-sidebar-nav">
        <div 
          className={`admin-sidebar-item ${activeItem === 'reports' ? 'active' : ''}`}
          onClick={() => handleItemClick('reports')}
        >
          <FaChartBar className="admin-sidebar-icon" />
          <span className="admin-sidebar-text">Reports</span>
        </div>

        <div 
          className={`admin-sidebar-item ${activeItem === 'users' ? 'active' : ''}`}
          onClick={() => handleItemClick('users')}
        >
          <FaUsers className="admin-sidebar-icon" />
          <span className="admin-sidebar-text">Users</span>
        </div>

        <div 
          className={`admin-sidebar-item ${activeItem === 'cameras' ? 'active' : ''}`}
          onClick={() => handleItemClick('cameras')}
        >
          <FaVideo className="admin-sidebar-icon" />
          <span className="admin-sidebar-text">Cameras</span>
        </div>
      </nav>
      
      {/* Notification bell has been removed as per the requirement change */}

      <div className="admin-sidebar-footer">
        <div className="admin-profile-container">
          <div 
            className="admin-sidebar-logout"
            onClick={() => {
              localStorage.clear(); // Clear all local storage for a clean logout
              navigate('/');
            }}
          >
            Logout
          </div>
          <img 
            src={logo} 
            alt="Admin Profile" 
            className="admin-profile-picture" 
          />
        </div>
      </div>
    </div>
  );
}

// Updated propTypes to remove unreadCount
AdminTaskbar.propTypes = {
  onItemSelect: propTypes.func.isRequired,
};

export default AdminTaskbar;