import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import "../cssFolder/Login.css";
import { FaUserCircle } from 'react-icons/fa';
import Spinner from "../components/Spinner";
import { TextField } from "@mui/material";

function Login() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [initialLoading, setInitialLoading] = useState(true);
    const [isLoading, setIsLoading] = useState(false);
    const navigate = useNavigate();
    useEffect(() => {
        const timer = setTimeout(() => {
            setInitialLoading(false);
        }, 2000);
        return () => clearTimeout(timer);
    }, []);
    if (initialLoading) {
        return (
            <div className="overlay">
                <Spinner />
            </div>
        );
    }
    const handleLogin = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        setError('');

        try {
            const response = await fetch('https://4908-197-37-156-248.ngrok-free.app/api/auth/login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ email, password }),
            });

            const data = await response.json();

            if (response.ok && data.token) {
                localStorage.setItem('token', data.token);
                const role = data.user?.roles?.[0] || 'user';
                localStorage.setItem('role', role);
                localStorage.setItem('name', data.user?.name || 'User');

                navigate(role === 'admin' ? '/admin-dashboard' : '/user-dashboard');
            } else {
                setError(data.message || 'Invalid email or password');
            }
        } catch (err) {
            setError('Login failed. Please check your connection.');
        } finally {
            setIsLoading(false);
        }
    };

    const handleReset = () => {
        setEmail('');
        setPassword('');
        setError('');
    };

    return (
        <div className="overlay">
            <div className="login-container">
                <FaUserCircle className="profile-icon" />
                <h1 className="title">Sign in</h1>
                {error && <div className="error-message">{error}</div>}
                <form className="form-group" onSubmit={handleLogin}>
                    <TextField 
                        id="outlined-basic" 
                        label="Email" 
                        variant="outlined"
                        onChange={(e) => setEmail(e.target.value)}
                        InputProps={{
                            placeholder: "Enter your email",
                            style: { color: 'white' }
                        }}
                        InputLabelProps={{
                            style: { color: 'white' }
                        }}
                    />
                     <TextField 
                        id="outlined-basic" 
                        label="password" 
                        variant="outlined"
                        type="password"
                        onChange={(e) => setPassword(e.target.value)}
                        InputProps={{
                            placeholder: "password",
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
                            disabled={isLoading}
                        >
                            {isLoading ? 'Signing in...' : 'Sign In'}
                        </button>
                        <button
                            type="button"
                            className="btn reset-btn"
                            onClick={handleReset}
                            disabled={isLoading}
                        >
                            Reset
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