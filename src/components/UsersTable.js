import React, { useState, useEffect, useCallback } from 'react';
import '../cssFolder/usertable.css';
import api from '../api';
import Spinner from './Spinner';

function UsersTable() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // State for the "Add User" form
  const [newUser, setNewUser] = useState({ name: '', email: '', password: '', password_confirmation: '' });

  // State for inline editing
  const [editingUserId, setEditingUserId] = useState(null);
  const [editFormData, setEditFormData] = useState({ name: '', email: '', title: '' });

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  const fetchUsers = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await api('/users');
      setUsers(Array.isArray(data.users) ? data.users : []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  const handleInputChange = (e, setter) => {
    setter(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleAddUser = async (e) => {
    e.preventDefault();
    if (newUser.password !== newUser.password_confirmation) {
      setError("Passwords do not match.");
      return;
    }
    setError(null);
    try {
      // Using the register endpoint as it's the only one provided for user creation
      await api('/auth/register', {
        method: 'POST',
        body: JSON.stringify(newUser),
      });
      setNewUser({ name: '', email: '', password: '', password_confirmation: '' }); // Reset form
      fetchUsers(); // Refresh the list
    } catch (err) {
      setError(`Failed to add user: ${err.message}`);
    }
  };

  const handleDeleteUser = async (userId) => {
    if (window.confirm('Are you sure you want to delete this user?')) {
      try {
        await api(`/users/${userId}`, { method: 'DELETE' });
        fetchUsers(); // Refresh the list
      } catch (err) {
        setError(`Failed to delete user: ${err.message}`);
      }
    }
  };

  const handleEditClick = (user) => {
    setEditingUserId(user.id);
    setEditFormData({ name: user.name, email: user.email, title: user.title || '' });
  };

  const handleCancelEdit = () => {
    setEditingUserId(null);
  };

  const handleSaveEdit = async (userId) => {
    try {
      await api(`/users/${userId}`, {
        method: 'PUT',
        body: JSON.stringify(editFormData),
      });
      setEditingUserId(null);
      fetchUsers(); // Refresh list
    } catch (err) {
      setError(`Failed to update user: ${err.message}`);
    }
  };
  
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentUsers = users.slice(indexOfFirstItem, indexOfLastItem);
  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  if (loading) return <Spinner />;

  return (
    <div className="reports-container">
      <h2 style={{ textAlign: "center" }}>👤 Users Management</h2>
      {error && <p className="error-message" style={{ color: 'red' }}>Error: {error}</p>}
      
      {/* Add User Form */}
      <form onSubmit={handleAddUser} className="user-add-form">
        <h3>Add New User</h3>
        <input type="text" name="name" placeholder="Name" value={newUser.name} onChange={(e) => handleInputChange(e, setNewUser)} required />
        <input type="email" name="email" placeholder="Email" value={newUser.email} onChange={(e) => handleInputChange(e, setNewUser)} required />
        <input type="password" name="password" placeholder="Password" value={newUser.password} onChange={(e) => handleInputChange(e, setNewUser)} required />
        <input type="password" name="password_confirmation" placeholder="Confirm Password" value={newUser.password_confirmation} onChange={(e) => handleInputChange(e, setNewUser)} required />
        <button type="submit" className="action-btn accept">Add User</button>
      </form>

      {/* Users Table */}
      <div className="reports-table-wrapper">
        <table className="reports-table">
          <thead>
            <tr>
              <th>#</th>
              <th>Name</th>
              <th>Email</th>
              <th>Title</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {currentUsers.map((user, idx) => (
              <tr key={user.id}>
                <td>{indexOfFirstItem + idx + 1}</td>
                {editingUserId === user.id ? (
                  <>
                    <td><input type="text" name="name" value={editFormData.name} onChange={(e) => handleInputChange(e, setEditFormData)} /></td>
                    <td><input type="email" name="email" value={editFormData.email} onChange={(e) => handleInputChange(e, setEditFormData)} /></td>
                    <td><input type="text" name="title" value={editFormData.title} onChange={(e) => handleInputChange(e, setEditFormData)} placeholder="User Title" /></td>
                    <td>
                      <button className="action-btn accept" onClick={() => handleSaveEdit(user.id)}>Save</button>
                      <button className="action-btn" onClick={handleCancelEdit}>Cancel</button>
                    </td>
                  </>
                ) : (
                  <>
                    <td>{user.name}</td>
                    <td>{user.email}</td>
                    <td>{user.title || 'N/A'}</td>
                    <td>
                      <button className="action-btn" onClick={() => handleEditClick(user)}>Edit</button>
                      <button className="action-btn delete" onClick={() => handleDeleteUser(user.id)}>Delete</button>
                    </td>
                  </>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="pagination1" style={{ position: "absolute", bottom: "20px", left: "50%", transform: "translateX(-50%)" }}>
        {Array.from({ length: Math.ceil(users.length / itemsPerPage) }).map((_, index) => (
          <button key={index} onClick={() => paginate(index + 1)} className={currentPage === index + 1 ? 'active' : ''}>
            {index + 1}
          </button>
        ))}
      </div>
    </div>
  );
}

export default UsersTable;