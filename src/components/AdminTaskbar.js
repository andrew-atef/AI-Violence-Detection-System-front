import React, { useState } from 'react';
import propTypes from "prop-types";
import logo from '../assets/8334315.png';
import '../cssFolder/adminTaskbar.css';
import { useNavigate } from 'react-router-dom';
import { FaChartBar, FaUsers, FaVideo, FaSignOutAlt } from 'react-icons/fa';

function AdminTaskbar({ unreadCount, onItemSelect }) {
  const navigate = useNavigate();
  const [activeItem, setActiveItem] = useState(null);

  const handleItemClick = (item) => {
    setActiveItem(item);
    onItemSelect(item); // Pass the active item to parent
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
          onClick={() => handleItemClick('users')}  // Changed to use handleItemClick
        >
          <FaUsers className="admin-sidebar-icon" />
          <span className="admin-sidebar-text">Users</span>
        </div>

        <div 
          className={`admin-sidebar-item ${activeItem === 'cameras' ? 'active' : ''}`}
          onClick={() => handleItemClick('cameras')}  // Changed to use handleItemClick
        >
          <FaVideo className="admin-sidebar-icon" />
          <span className="admin-sidebar-text">Cameras</span>
        </div>
      </nav>

      <div className="admin-notification-bell">
        <span className="admin-bell">🔔</span>
        {unreadCount > 0 && (
          <span className="admin-notification-badge">{unreadCount}</span>
        )}
      </div>
    
    <div className="admin-sidebar-footer">
      <div className="admin-profile-container">
        <div 
          className="admin-sidebar-logout"
          onClick={() => {
            localStorage.removeItem('token');
            localStorage.removeItem('role');
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

AdminTaskbar.propTypes = {
  unreadCount: propTypes.number.isRequired,
};

export default AdminTaskbar;
