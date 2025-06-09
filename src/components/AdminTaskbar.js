// AdminTaskbar.js
import React from 'react';
import propTypes from "prop-types";
import logo from '../assets/8334315.png';
import '../cssFolder/adminTaskbar.css';

function AdminTaskbar({ unreadCount }) {
  return (
    <div className="admin-taskbar">
      <div className="left-section">
        <img src={logo} alt="Logo" className="taskbar-logo" />
        <h1 className="dashboard-title" >Welcome to Admin Dashboard</h1>
      </div>
      <div className="notification-icon">
        <span className="bell">🔔</span>
        {unreadCount > 0 && (
          <span className="notification-badge">{unreadCount}</span>
        )}
      </div>
    </div>
  );
}

AdminTaskbar.propTypes = {
  unreadCount: propTypes.number.isRequired,
};

export default AdminTaskbar;
