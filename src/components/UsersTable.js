import React, { useState, useEffect } from 'react';
import '../cssFolder/usertable.css'
function UsersTable() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [newUser, setNewUser] = useState({ name: '', email: '', role: 'user' });
  const [editingUserId, setEditingUserId] = useState(null);
  const [editUser, setEditUser] = useState({ name: '', email: '', role: 'user' });

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(5); // عدد المستخدمين في كل صفحة

  // جلب المستخدمين من API
  useEffect(() => {
    setLoading(true);
    setError(null);
    fetch('https://4908-197-37-156-248.ngrok-free.app/api/users', {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token') || ''}`
      }
    })
      .then(res => {
        if (!res.ok) throw new Error('Failed to fetch users');
        return res.json();
      })
      .then(data => {
        // توقع أن الداتا عبارة عن مصفوفة مستخدمين
        setUsers(Array.isArray(data) ? data : (data.users || []));
        setLoading(false);
      })
      .catch(err => {
        setError(err.message);
        setLoading(false);
      });
  }, []);

  // حساب المستخدمين الحاليين في الصفحة
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentUsers = users.slice(indexOfFirstItem, indexOfLastItem);

  // تغيير الصفحة
  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  // إضافة مستخدم جديد
  const handleAddUser = (e) => {
    e.preventDefault();
    if (!newUser.name || !newUser.email) return;
    setUsers([
      ...users,
      { ...newUser, id: Date.now() },
    ]);
    setNewUser({ name: '', email: '', role: 'user' });
    // إذا أضيف المستخدم في صفحة جديدة انتقل لها تلقائياً
    if ((users.length + 1) > currentPage * itemsPerPage) {
      setCurrentPage(Math.ceil((users.length + 1) / itemsPerPage));
    }
  };

  // حذف مستخدم
  const handleDeleteUser = (id) => {
    const newUsers = users.filter(user => user.id !== id);
    setUsers(newUsers);
    // إذا حذفت آخر عنصر في الصفحة انتقل للصفحة السابقة
    if (currentPage > 1 && newUsers.length <= indexOfFirstItem) {
      setCurrentPage(currentPage - 1);
    }
  };

  // بدء التعديل
  const handleEditClick = (user) => {
    setEditingUserId(user.id);
    setEditUser({ name: user.name, email: user.email, role: user.role });
  };

  // حفظ التعديل
  const handleSaveEdit = (id) => {
    setUsers(users.map(user =>
      user.id === id ? { ...user, ...editUser } : user
    ));
    setEditingUserId(null);
    setEditUser({ name: '', email: '', role: 'user' });
  };

  // إلغاء التعديل
  const handleCancelEdit = () => {
    setEditingUserId(null);
    setEditUser({ name: '', email: '', role: 'user' });
  };

  return (
    <div className="reports-container">
      <h2 style={{textAlign:"center", position: "relative", color: "#222", top: "-13px"}}>👤 Users Management</h2>
      <p>users count :<b>{users.length}</b></p>
      {loading && <p>Loading users...</p>}
      {error && <p style={{color:'red'}}>Error: {error}</p>}
      {!loading && !error && (
        <>
          <form onSubmit={handleAddUser} style={{ marginBottom: 20, display: 'flex', gap: 10 }}>
            <input
              type="text"
              placeholder="Name"
              value={newUser.name}
              onChange={e => setNewUser({ ...newUser, name: e.target.value })}
              required
            />
            <input
              type="email"
              placeholder="Email"
              value={newUser.email}
              onChange={e => setNewUser({ ...newUser, email: e.target.value })}
              required
            />
            <select
              value={newUser.role}
              onChange={e => setNewUser({ ...newUser, role: e.target.value })}
            >
              <option value="user">User</option>
              <option value="admin">Admin</option>
            </select>
            <button type="submit" className="action-btn accept">Add User</button>
          </form>

          <div className="reports-table-wrapper">
            <table className="reports-table">
              <thead>
                <tr>
                  <th>#</th>
                  <th>Name</th>
                  <th>Email</th>
                  <th>Role</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {currentUsers.map((user, idx) => (
                  <tr key={user.id}>
                    <td>{indexOfFirstItem + idx + 1}</td>
                    <td>
                      {editingUserId === user.id ? (
                        <input
                          type="text"
                          value={editUser.name}
                          onChange={e => setEditUser({ ...editUser, name: e.target.value })}
                        />
                      ) : (
                        user.name
                      )}
                    </td>
                    <td>
                      {editingUserId === user.id ? (
                        <input
                          type="email"
                          value={editUser.email}
                          onChange={e => setEditUser({ ...editUser, email: e.target.value })}
                        />
                      ) : (
                        user.email
                      )}
                    </td>
                    <td>
                      {editingUserId === user.id ? (
                        <select
                          value={editUser.role}
                          onChange={e => setEditUser({ ...editUser, role: e.target.value })}
                        >
                          <option value="user">User</option>
                          <option value="admin">Admin</option>
                        </select>
                      ) : (
                        user.role
                      )}
                    </td>
                    <td>
                      {editingUserId === user.id ? (
                        <>
                          <button className="action-btn accept" onClick={() => handleSaveEdit(user.id)}>Save</button>
                          <button className="action-btn delete" onClick={handleCancelEdit}>Cancel</button>
                        </>
                      ) : (
                        <>
                          <button className="action-btn" onClick={() => handleEditClick(user)}>Edit</button>
                          <button className="action-btn delete" onClick={() => handleDeleteUser(user.id)}>Delete</button>
                        </>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="pagination1" style={{position:"absolute",bottom:"20px" , left:"50%"}}>
            {Array.from({ length: Math.ceil(users.length / itemsPerPage) }).map((_, index) => (
              <button
                key={index}
                onClick={() => paginate(index + 1)}
                className={currentPage === index + 1 ? 'active' : ''}
              >
                {index + 1}
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
}

export default UsersTable; 