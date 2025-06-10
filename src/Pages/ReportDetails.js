import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import Footer from "../components/Footer";
import AnimatedBackground from "../components/AnimatedBackground";
// Import CSS if you have specific styles for this page
import '../cssFolder/ReportDetails.css';

function ReportDetails() {
  const { id } = useParams(); // Get id from URL
  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    setLoading(true);
    setError(null);
    const token = localStorage.getItem('token'); // Get token for authorization

    if (!token) {
        setError("Authentication required. Please log in.");
        setLoading(false);
        return;
    }

    // Fetch the specific report by ID from the API
    // Assuming the endpoint structure is /api/violence-notifications/{id}
    fetch(`https://4908-197-37-156-248.ngrok-free.app/api/violence-notifications/${id}`, {
        headers: {
            'Authorization': `Bearer ${token}`,
            'Accept': 'application/json',
        }
    })
      .then((res) => {
          if (!res.ok) {
              throw new Error(`HTTP error! status: ${res.status}`);
          }
          return res.json();
      })
      .then((data) => {
        // Assuming the API returns the report object directly,
        // or possibly nested like { data: reportObject } or { violence_notification: reportObject }
        // Adjust data access if necessary, e.g., setReport(data.data)
        const reportData = data.violence_notification || data.data || data; // Adjust based on actual API response structure
        if (!reportData || typeof reportData !== 'object') {
            throw new Error("Invalid data format received from API.");
        }
        setReport(reportData);
      })
      .catch((err) => {
          console.error("Failed to load report details:", err);
          setError(`Failed to load report: ${err.message}`);
      })
      .finally(() => {
          setLoading(false);
      });
  }, [id]); // Re-run effect if id changes

  if (loading) {
    return <div>Loading report details...</div>;
  }

  if (error) {
    return <div>Error: {error}</div>;
  }

  if (!report) {
    // This case might happen if the fetch succeeds but returns no data for the ID
    return <div>Report not found.</div>;
  }

  // --- Render Report Details ---
  return (
    <div>
      <AnimatedBackground/>
      <div className="cont" style={{
        padding: '30px',
        Width: "90%",
        opacity:"90%",
        background: 'rgba(255,255,255,0.95)',
        borderRadius: '18px',
        boxShadow: '0 4px 24px rgba(0,0,0,0.13)',
        border: '1px solid #e0e0e0',
        color: '#222',
        position: 'relative',
        height: "100vh"
      }}>
        <div style={{display:'flex', alignItems:'center', gap:10, marginBottom: 20 , justifyContent:"center"}}>
          <span style={{fontSize: 32, color: '#4CAF50'}}>📋</span>
          <h2 style={{margin:0, color:'#4CAF50', fontWeight:700, fontSize: '2rem'}}>Report Details</h2>
        </div>
        <div style={{marginBottom: 18}}>
          <span style={{color:'#888', fontWeight:600}}>Report ID:</span>
          <span style={{marginLeft:10, fontWeight:700, color:'#222'}}>{report.id}</span>
        </div>
        <div style={{marginBottom: 18}}>
          <span style={{color:'#888', fontWeight:600}}>User ID:</span>
          <span style={{marginLeft:10, fontWeight:700, color:'#222'}}>{report.user_id}</span>
        </div>
        <div style={{marginBottom: 18}}>
          <span style={{color:'#888', fontWeight:600}}>Timestamp:</span>
          <span style={{marginLeft:10, fontWeight:700, color:'#222'}}>{new Date(report.created_at).toLocaleString()}</span>
        </div>
        <div style={{marginBottom: 18}}>
          <span style={{color:'#888', fontWeight:600}}>Camera Number:</span>
          <span style={{marginLeft:10, fontWeight:700, color:'#222'}}>{report.camera_num}</span>
        </div>
        <div style={{marginBottom: 18}}>
          <span style={{color:'#888', fontWeight:600}}>Prediction:</span>
          <span style={{marginLeft:10, fontWeight:700, color:'#222'}}>{report.prediction}</span>
        </div>
        <div style={{marginBottom: 18}}>
          <span style={{color:'#888', fontWeight:600}}>Confidence:</span>
          <span style={{marginLeft:10, fontWeight:700, color:'#222'}}>{report.confidence !== undefined ? report.confidence.toFixed(4) : 'N/A'}</span>
        </div>
        <div style={{marginBottom: 18}}>
          <span style={{color:'#888', fontWeight:600}}>Description:</span>
          <span style={{marginLeft:10, fontWeight:700, color:'#222'}}>{report.note || 'N/A'}</span>
        </div>
        {report.video_path ? (
          <div style={{marginTop: 30}}>
            <h3 style={{color:'#4CAF50', marginBottom: 10}}>Recorded Video:</h3>
            <video
              src={report.video_path}
              controls
              style={{ width: "100%", maxHeight: "350px", backgroundColor: "#fff", borderRadius: 10, boxShadow: '0 2px 8px rgba(0,0,0,0.08)' }}
              onError={(e) => console.error("Error loading video:", e)}
            >
              Your browser does not support the video tag.
            </video>
          </div>
        ) : (
          <p style={{color:'#888', marginTop: 30}}><strong>Video:</strong> No video available for this report.</p>
        )}
        <div style={{textAlign:'center', marginTop: 35}}>
          <Link to="/admin-dashboard">
            <button style={{ backgroundColor: "#4CAF50", color: "white", borderRadius: "10px", padding: "15px 40px", height: "50px",  cursor:"pointer", fontWeight:600, fontSize:'1.1rem', border:'none', boxShadow:'0 2px 8px rgba(0,0,0,0.08)' }}>Back to Reports List</button>
          </Link>
        </div>
      </div>
    </div>
  );
}

export default ReportDetails;
