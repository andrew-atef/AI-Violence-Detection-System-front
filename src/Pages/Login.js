import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import "../cssFolder/Login.css";
import { FaUserCircle } from 'react-icons/fa';
import Spinner from "../components/Spinner";
import { TextField } from "@mui/material";
import api from "../api"; // Import the api helper

function Login() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const navigate = useNavigate();

    // This effect can be removed if you don't want an artificial initial loading screen.
    const [initialLoading, setInitialLoading] = useState(true);
    useEffect(() => {
        const timer = setTimeout(() => {
            setInitialLoading(false);
        }, 1000);
        return () => clearTimeout(timer);
    }, []);

    const handleLogin = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        setError('');

        try {
            const data = await api('/auth/login', {
                method: 'POST',
                body: JSON.stringify({ email, password }),
            });

            if (data.token) {
                localStorage.setItem('token', data.token);
                // The API provides the user's role in the response
                const role = data.user?.roles?.[0] || 'user';
                localStorage.setItem('role', role);
                localStorage.setItem('name', data.user?.name || 'User');

                navigate(role === 'admin' ? '/admin-dashboard' : '/user-dashboard');
            } else {
                setError(data.message || 'Login failed. Invalid response from server.');
            }
        } catch (err) {
            setError(err.message || 'Login failed. Please check your connection.');
        } finally {
            setIsLoading(false);
        }
    };
    
    if (initialLoading) {
        return <Spinner />;
    }

    return (
        <div className="overlay">
            <div className="login-container">
                <FaUserCircle className="profile-icon" />
                <h1 className="title">Sign in</h1>
                {error && <div className="error-message">{error}</div>}
                <form className="form-group" onSubmit={handleLogin}>
                    <TextField 
                        id="email-input" 
                        label="Email" 
                        variant="outlined"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        // Other props...
                    />
                     <TextField 
                        id="password-input" 
                        label="Password" 
                        variant="outlined"
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                         // Other props...
                    />
                    <div className="button-group">
                        <button type="submit" className="btn signin2-btn" disabled={isLoading}>
                            {isLoading ? 'Signing in...' : 'Sign In'}
                        </button>
                    </div>
                </form>
                <p className="register-text">
                    Don't have an account? <Link to="/register" className="register-link">Create account</Link>
                </p>
            </div>
        </div>
    );
}

export default Login;