import React, { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import AdminTaskbar from '../components/AdminTaskbar';
import ReportsList from '../components/ReportsList';
import '../cssFolder/AdminDashboard.css';
import Spinner from '../components/Spinner';
import AnimatedBackground from '../components/AnimatedBackground';
import CamerasTable from '../components/CamerasTable';
import UsersTable from '../components/UsersTable';
import api from '../api';

function AdminDashboard() {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeComponent, setActiveComponent] = useState('reports');
  const navigate = useNavigate();

  const fetchReports = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const data = await api('/violence-notifications');
      const fetchedReports = data.violence_notifications || [];
      
      // Sort reports by most recent first
      setReports(fetchedReports.sort((a, b) => new Date(b.created_at) - new Date(a.created_at)));
    } catch (err) {
      setError(`Failed to load reports: ${err.message}`);
      if (err.message.includes('401') || err.message.includes('Unauthenticated')) {
        navigate('/login');
      }
    } finally {
      setLoading(false);
    }
  }, [navigate]);

  useEffect(() => {
    const role = localStorage.getItem('role');
    if (role !== 'admin') {
      navigate('/login');
      return;
    }
    
    if (activeComponent === 'reports') {
        fetchReports();
    }
  }, [navigate, activeComponent, fetchReports]);

  // New function to handle report deletion
  const handleDeleteReport = async (reportId) => {
    if (window.confirm(`Are you sure you want to delete report #${reportId}? This action cannot be undone.`)) {
      setError(''); // Clear previous errors
      try {
        // Call the API to delete the report
        await api(`/violence-notifications/${reportId}`, {
          method: 'DELETE',
        });

        // If the API call is successful, update the local state to remove the report
        setReports(prevReports => prevReports.filter(report => report.id !== reportId));
      } catch (err) {
        // Handle potential errors from the API call
        setError(`Failed to delete report: ${err.message}`);
        console.error("Failed to delete report:", err);
      }
    }
  };
  
  const renderActiveComponent = () => {
    // Show a global error message if one exists
    if (error) return <p className="error-message" style={{ margin: 'auto', color: 'white' }}>{error}</p>;
    
    // Show a spinner only when the relevant component is loading
    if (loading && (activeComponent === 'reports' || activeComponent === 'users' || activeComponent === 'cameras')) return <Spinner />;

    switch(activeComponent) {
      case 'reports':
        return <ReportsList 
                 reports={reports}
                 handleDeleteReport={handleDeleteReport} // Pass the new delete handler
               />;
      case 'users':
        return <UsersTable />;
      case 'cameras':
        return <CamerasTable />;
      default:
        // Fallback to reports list
        return <ReportsList reports={reports} handleDeleteReport={handleDeleteReport} />;
    }
  };

  return (
    <>
      <AnimatedBackground />
      <div className="dashboard-container1">
        <AdminTaskbar onItemSelect={setActiveComponent} />
        <div className="admin-main-content">
            {renderActiveComponent()}
        </div>
      </div>
    </>
  );
}

export default AdminDashboard;