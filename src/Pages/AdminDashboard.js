import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import AdminTaskbar from '../components/AdminTaskbar';
import ReportsList from '../components/ReportsList';
import '../cssFolder/AdminDashboard.css';
import Spinner from '../components/Spinner';
import AnimatedBackground from '../components/AnimatedBackground';
import CamerasView1 from '../components/CamerasView1';
import UsersTable from '../components/UsersTable';


function AdminDashboard() {
  const [reports, setReports] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [recentFirst, setRecentFirst] = useState(true);
 
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const [activeComponent, setActiveComponent] = useState('reports');

  useEffect(() => {
    const token = localStorage.getItem('token');
    const role = localStorage.getItem('role');
    console.log(token);
    console.log(role);
    // if (!token || role !== 'admin') {
    if ( role !== 'admin') {
      navigate('/login');
      return;
    }

    setLoading(true);

    fetch("https://4908-197-37-156-248.ngrok-free.app/api/violence-notifications", {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Accept': 'application/json',
      }
    })
      .then((res) => {
        if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
        return res.json();
      })
      .then((data) => {
        const fetchedReports = data.violence_notifications || [];
        console.log("Fetched Reports:", fetchedReports); // Log raw fetched data

        // Add a default 'isRead: false' status locally if not provided by API
        const reportsWithReadStatus = fetchedReports.map(r => ({
          ...r,
          isRead: r.isRead === undefined ? false : r.isRead // Assume false if not present
        }));

        // Filter using the correct field name 'camera_num'
        const filtered = reportsWithReadStatus.filter(r => r.camera_num >= 1 && r.camera_num <= 4);
        console.log("Filtered Reports:", filtered); // Log after filtering

        // Sort using the correct field name 'created_at'
        // Create a new sorted array to avoid mutating state directly
        const sorted = recentFirst
          ? [...filtered].sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
          : filtered;
        console.log("Sorted Reports (before setting state):", sorted); // Log final data before setReports

        setReports(sorted);
        // Calculate unread count based on the locally managed 'isRead' status
        const unread = sorted.filter(r => !r.isRead);
        setUnreadCount(unread.length);
      })
      .catch((err) => {
        console.error("Failed to fetch reports:", err);
        // setError(`Failed to load reports: ${err.message}`); // Set error state
      })
      .finally(() => {
        setLoading(false); // Stop loading regardless of success or error
      });
  }, [navigate, recentFirst]);

  const markAsRead = (id) => {
    const token = localStorage.getItem('token');
    if (!token) {
      console.error("Cannot mark as read: No token found.");
     
      return;
    }

    // Find the report to prevent decrementing count if already read or not found
    const reportToUpdate = reports.find(r => r.id === id);
    if (!reportToUpdate || reportToUpdate.isRead) {
      // console.log(`Report ${id} is already marked as read or not found.`);
      return; // Don't proceed if already read or not found
    }

    // Update locally first using the correct ID field 'id'
    setReports(prev =>
      prev.map(r =>
        r.id === id ? { ...r, isRead: true } : r
      )
    );
    // Only decrement count if it was actually unread
    setUnreadCount(prev => (prev > 0 ? prev - 1 : 0));

    // --- Backend Update (Needs Verification) ---
    // NOTE: This assumes a PATCH endpoint exists at /api/violence-notifications/{id}
    //       and accepts { "isRead": true } or similar. Confirm with backend.
    // console.warn(`Attempting to PATCH report ${id} as read. Ensure backend endpoint exists and supports this.`);
    fetch(`http://141.147.83.47:8083/api/violence-notifications/${id}`, { // Use the correct ID and base URL
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        'Authorization': `Bearer ${token}`, // Add Authorization header
        'Accept': 'application/json',
      },
      body: JSON.stringify({ isRead: true }), // Assuming backend expects 'isRead'
    })
      .then((res) => {
        if (!res.ok) {
          // If update fails, revert local state and show error
          console.error(`Failed to update report ${id} on server: ${res.status}`);
          setReports(prev => prev.map(r => r.id === id ? { ...r, isRead: false } : r)); // Revert local state
          setUnreadCount(prev => prev + 1); // Increment count back
          // setError(`Failed to mark report ${id} as read on server. Please try again.`); // Show error
          throw new Error(`Server failed to mark report ${id} as read.`);
        }
        console.log(`Report ${id} successfully marked as read on server.`);
        // setError(null); // Clear error on success
        // Optionally re-fetch data here to ensure consistency, or trust local state
      })
      .catch((err) => {
        console.error("Failed to update report on server:", err);
      });
  };
  
  // --- Render Logic ---
  // Handle loading and error states


if (loading) {
    return <>
    
    <Spinner/>
    </>;
  }

  

  const renderActiveComponent = () => {
    switch(activeComponent) {
      case 'reports':
        return <ReportsList 
                 reports={reports}
                 markAsRead={markAsRead}
                 recentFirst={recentFirst}
                 setRecentFirst={setRecentFirst}
               />;
      case 'users':
        return <UsersTable />;
      case 'cameras':
        return <CamerasView1 />; // You'll need to create this
      default:
        return <ReportsList  />;
    }
  };

  return (
    <>
      <AnimatedBackground />
      <div className="dashboard-container1">
        <AdminTaskbar 
          unreadCount={unreadCount} 
          onItemSelect={setActiveComponent}
        />
        {renderActiveComponent()}
      </div>
    </>
  );
}

export default AdminDashboard;