import React, { useState, useEffect, useCallback } from 'react';
import '../cssFolder/camerasview1.css'; // You can rename this css file too
import api from '../api';
import Spinner from './Spinner';

function CamerasTable() {
  const [cameras, setCameras] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Form states
  const [newCameraName, setNewCameraName] = useState('');
  const [editingCamera, setEditingCamera] = useState(null); // { id, name }

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  const fetchCameras = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await api('/cameras');
      setCameras(Array.isArray(data.cameras) ? data.cameras : []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCameras();
  }, [fetchCameras]);

  const handleAddCamera = async (e) => {
    e.preventDefault();
    try {
      await api('/cameras', {
        method: 'POST',
        body: JSON.stringify({ name: newCameraName }),
      });
      setNewCameraName('');
      fetchCameras();
    } catch (err) {
      setError(`Failed to add camera: ${err.message}`);
    }
  };
  
  const handleDeleteCamera = async (cameraId) => {
    if (window.confirm('Are you sure you want to delete this camera?')) {
      try {
        await api(`/cameras/${cameraId}`, { method: 'DELETE' });
        fetchCameras();
      } catch (err) {
        setError(`Failed to delete camera: ${err.message}`);
      }
    }
  };
  
  const handleUpdateCamera = async (e) => {
    e.preventDefault();
    try {
        await api(`/cameras/${editingCamera.id}`, {
            method: 'PUT',
            body: JSON.stringify({ name: editingCamera.name })
        });
        setEditingCamera(null);
        fetchCameras();
    } catch(err) {
        setError(`Failed to update camera: ${err.message}`);
    }
  }

  const handleAssignUser = async (cameraId) => {
    const userId = prompt("Enter the User ID to assign to this camera:");
    if (userId && !isNaN(userId)) {
        try {
            await api(`/cameras/${cameraId}/assign`, {
                method: 'POST',
                body: JSON.stringify({ user_id: parseInt(userId, 10) })
            });
            alert('User assigned successfully!');
            fetchCameras(); // Refresh to show updated data if necessary
        } catch(err) {
            setError(`Failed to assign user: ${err.message}`);
        }
    } else if (userId) {
        alert("Please enter a valid User ID (number).");
    }
  }

  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentCameras = cameras.slice(indexOfFirstItem, indexOfLastItem);
  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  if (loading) return <Spinner />;

  return (
    <div className="camera-container">
      <h2 style={{ textAlign: "center" }}>📷 Cameras Management</h2>
      {error && <p style={{ color: 'red' }}>Error: {error}</p>}
      
      <form onSubmit={handleAddCamera} className="camera-add-form">
          <h3>Add New Camera</h3>
          <input 
            type="text" 
            placeholder="Camera Name"
            value={newCameraName}
            onChange={(e) => setNewCameraName(e.target.value)}
            required
          />
          <button type="submit" className="action-btn accept">Add Camera</button>
      </form>

      <div className="camera-table-wrapper">
        <table className="camera-table">
          <thead>
            <tr>
              <th>#</th>
              <th>Camera Name</th>
              <th>Assigned User ID</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {currentCameras.map((camera, idx) => (
              <tr key={camera.id}>
                <td>{indexOfFirstItem + idx + 1}</td>
                <td>
                    {editingCamera?.id === camera.id ? (
                        <form onSubmit={handleUpdateCamera}>
                            <input 
                                type="text"
                                value={editingCamera.name}
                                onChange={(e) => setEditingCamera({...editingCamera, name: e.target.value})}
                            />
                        </form>
                    ) : (
                        camera.name
                    )}
                </td>
                <td>{camera.user_id || 'None'}</td>
                <td>
                  {editingCamera?.id === camera.id ? (
                    <>
                        <button className="action-btn accept" onClick={handleUpdateCamera}>Save</button>
                        <button className="action-btn" onClick={() => setEditingCamera(null)}>Cancel</button>
                    </>
                  ) : (
                    <>
                        <button className="action-btn" onClick={() => setEditingCamera({ id: camera.id, name: camera.name })}>Edit</button>
                        <button className="action-btn" onClick={() => handleAssignUser(camera.id)}>Assign User</button>
                        <button className="action-btn delete" onClick={() => handleDeleteCamera(camera.id)}>Delete</button>
                    </>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="camera-pagination" style={{ position: "absolute", bottom: "20px", left: "50%", transform: "translateX(-50%)" }}>
        {Array.from({ length: Math.ceil(cameras.length / itemsPerPage) }).map((_, index) => (
          <button key={index} onClick={() => paginate(index + 1)} className={currentPage === index + 1 ? 'active' : ''}>
            {index + 1}
          </button>
        ))}
      </div>
    </div>
  );
}

export default CamerasTable;