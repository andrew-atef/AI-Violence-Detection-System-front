import React, { useState } from 'react';
import '../cssFolder/camerasview1.css';

function CamerasView1() {
  // بيانات وهمية للكاميرات
  const [cameras, setCameras] = useState([
    { id: 1, name: 'Camera 1', status: 'Active' },
    { id: 2, name: 'Camera 2', status: 'Inactive' },
    { id: 3, name: 'Camera 3', status: 'Active' },
    { id: 4, name: 'Camera 4', status: 'Active' },
    { id: 5, name: 'Camera 5', status: 'Inactive' },
    { id: 6, name: 'Camera 6', status: 'Active' },
    { id: 7, name: 'Camera 7', status: 'Active' },
    { id: 8, name: 'Camera 8', status: 'Inactive' },
    { id: 9, name: 'Camera 9', status: 'Active' },
    { id: 10, name: 'Camera 10', status: 'Active' },
  ]);

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(5);

  // حساب الكاميرات الحالية في الصفحة
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentCameras = cameras.slice(indexOfFirstItem, indexOfLastItem);

  // تغيير الصفحة
  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  return (
    <div className="camera-container">
      <h2 style={{textAlign:"center", position: "relative", color: "#222", top: "-13px"}}>📷 Cameras List</h2>
      <p>cameras count : <b>{cameras.length}</b></p>
      <div className="camera-table-wrapper">
        <table className="camera-table">
          <thead>
            <tr>
              <th>#</th>
              <th>Camera Name</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {currentCameras.map((camera, idx) => (
              <tr key={camera.id}>
                <td>{indexOfFirstItem + idx + 1}</td>
                <td>{camera.name}</td>
                <td>{camera.status}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="camera-pagination" style={{position:"absolute",bottom:"20px",left:"50%"}}>
        {Array.from({ length: Math.ceil(cameras.length / itemsPerPage) }).map((_, index) => (
          <button
            key={index}
            onClick={() => paginate(index + 1)}
            className={currentPage === index + 1 ? 'active' : ''}
          >
            {index + 1}
          </button>
        ))}
      </div>
    </div>
  );
}

export default CamerasView1; 