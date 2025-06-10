import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import "../cssFolder/Login.css";
import { FaUserCircle } from 'react-icons/fa';
import Spinner from "../components/Spinner";
import { TextField } from "@mui/material";



function Register() {
  // State variables remain the same
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(true);
  const [isRegistering, setIsRegistering] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const timer = setTimeout(() => setLoading(false), 2000);
    return () => clearTimeout(timer);
  }, []);

  const handleRegister = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setIsRegistering(true);

    if (!name || !email || !password || !confirmPassword) {
        setError('Please fill in all fields.');
        setIsRegistering(false);
        return;
    }
    if (password !== confirmPassword) {
        setError('Passwords do not match.');
        setIsRegistering(false);
        return;
    }

    try {
      const response = await fetch('https://4908-197-37-156-248.ngrok-free.app/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        // Add password_confirmation to the request body
        body: JSON.stringify({ name, email, password, password_confirmation: password }),
      });

      const data = await response.json();

      if (response.ok && data.token && data.user) { // Check for token and user object
        // --- AUTO-LOGIN LOGIC ---
        setSuccess(data.message || 'Registration successful! Logging you in...'); // Use server message
        setError('');

        // Store token and user info in localStorage
        localStorage.setItem('token', data.token);
        const role = data.user?.roles?.[0] || 'user'; // Safely get role, default to 'user'
        localStorage.setItem('role', role);
        localStorage.setItem('name', data.user?.name || 'User'); // Safely get name, default to 'User'

        // Clear form fields
        setName('');
        setEmail('');
        setPassword('');
        setConfirmPassword('');

        // Redirect to the appropriate dashboard immediately (or after a very short delay)
        // Optional: Short delay to show success message
        setTimeout(() => {
            if (role === 'admin') {
                navigate('/admin-dashboard');
            } else {
                navigate('/user-dashboard');
            }
        }, 500); // 0.5 second delay (adjust or remove if not needed)

      } else {
        // Registration failed or response format incorrect
        setError(data.message || 'Registration failed. Please try again.');
        setSuccess('');
      }
    } catch (err) {
        console.error("Registration API error:", err);
        setError('Registration failed. Could not connect to the server.');
        setSuccess('');
    } finally {
      setIsRegistering(false);
    }
  };

  // handleReset and handleLoginClick remain the same
    const handleReset = () => {
        setName('');
        setEmail('');
        setPassword('');
        setConfirmPassword('');
        setError('');
        setSuccess('');
    };

    const handleLoginClick = () => {
        navigate('/login');
    };

  // --- Render Logic ---
  if (loading) {
    return (
      <Spinner />
    );
  }

  return (
    <div className="overlay">
        <div className="login-container">
            <FaUserCircle className="profile-icon" />
            <h1 className="title">Sign up</h1>
            {error && <div className="error-message">{error}</div>}
            {success && <div className="success-message">{success}</div>}
            <form className="form-group" onSubmit={handleRegister}>
                <TextField 
                    id="name-input"
                    label="Name" 
                    variant="outlined"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    fullWidth
                    margin="normal"
                    InputProps={{
                      placeholder: "Enter your name",
                      style: { color: 'white' }
                  }}
                  InputLabelProps={{
                      style: { color: 'white' }
                  }}
                />
                 
                <TextField 
                    id="email-input"
                    label="Email" 
                    variant="outlined"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    fullWidth
                    margin="normal"
                    InputProps={{
                      placeholder: "Enter your email",
                      style: { color: 'white' }
                  }}
                  InputLabelProps={{
                      style: { color: 'white' }
                  }}
                />
                <TextField 
                    id="password-input"
                    label="Password" 
                    variant="outlined"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    fullWidth
                    margin="normal"
                    InputProps={{
                      placeholder: "Password",
                      style: { color: 'white' }
                  }}
                  InputLabelProps={{
                      style: { color: 'white' }
                  }}
                />
                <TextField 
                    id="confirm-password-input"
                    label="Confirm Password" 
                    variant="outlined"
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    fullWidth
                    margin="normal"
                    InputProps={{
                      placeholder: "Confirmation password",
                      style: { color: 'white' }
                  }}
                  InputLabelProps={{
                      style: { color: 'white' }
                  }}
                />
                <div className="button-group">
                    <button
                        type="submit"
                        className="btn signin2-btn"
                        disabled={isRegistering}
                    >
                        {isRegistering ? 'Registering...' : 'Register'}
                    </button>
                    <button
                        type="button"
                        className="btn reset-btn"
                        onClick={handleReset}
                        disabled={isRegistering}
                    >
                        Reset
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




