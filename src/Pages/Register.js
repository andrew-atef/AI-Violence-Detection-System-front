import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import "../cssFolder/Login.css";
import { FaUserCircle } from 'react-icons/fa';
import Spinner from "../components/Spinner";
import { TextField } from "@mui/material";
import api from "../api"; // Import the api helper

function Register() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [password_confirmation, setPasswordConfirmation] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isRegistering, setIsRegistering] = useState(false);
  const navigate = useNavigate();

  const handleRegister = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (password !== password_confirmation) {
        setError('Passwords do not match.');
        return;
    }
    
    setIsRegistering(true);

    try {
      const data = await api('/auth/register', {
        method: 'POST',
        body: JSON.stringify({ name, email, password, password_confirmation }),
      });

      if (data.token && data.user) {
        setSuccess('Registration successful! Logging you in...');
        
        // Auto-login after successful registration
        localStorage.setItem('token', data.token);
        const role = data.user?.roles?.[0] || 'user';
        localStorage.setItem('role', role);
        localStorage.setItem('name', data.user?.name || 'User');
        
        setTimeout(() => {
            navigate(role === 'admin' ? '/admin-dashboard' : '/user-dashboard');
        }, 1000);

      } else {
        setError(data.message || 'Registration failed. Please try again.');
      }
    } catch (err) {
        setError(err.message || 'Registration failed. Could not connect to the server.');
    } finally {
      setIsRegistering(false);
    }
  };

  return (
    <div className="overlay">
        <div className="login-container">
            <FaUserCircle className="profile-icon" />
            <h1 className="title">Sign up</h1>
            {error && <div className="error-message">{error}</div>}
            {success && <div className="success-message">{success}</div>}
            <form className="form-group" onSubmit={handleRegister}>
                <TextField 
                    label="Name" 
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                />
                <TextField 
                    label="Email" 
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                />
                <TextField 
                    label="Password" 
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                />
                <TextField 
                    label="Confirm Password" 
                    type="password"
                    value={password_confirmation}
                    onChange={(e) => setPasswordConfirmation(e.target.value)}
                    required
                />
                <div className="button-group">
                    <button type="submit" className="btn signin2-btn" disabled={isRegistering}>
                        {isRegistering ? 'Registering...' : 'Register'}
                    </button>
                </div>
            </form>
            <p className="login-redirect">
                Already have an account? <Link to="/login" className="login-link">Sign in</Link>
            </p>
        </div>
    </div>
);
}

export default Register;