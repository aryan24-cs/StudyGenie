import React, { useState } from 'react';
import '../style/Login.css';
import useUsercred from '../Hooks/useUsercred';
import { useNavigate } from 'react-router-dom';
import { FaEye, FaEyeSlash } from 'react-icons/fa';

function Login() {
  const navigate = useNavigate();
  const { Login } = useUsercred();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [email, setEmail] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState(null);
  const [validationErrors, setValidationErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);

  const validateForm = () => {
    const errors = {};
    if (username.length < 3) errors.username = 'Username must be at least 3 characters';
    if (!/\S+@\S+\.\S+/.test(email)) errors.email = 'Invalid email format';
    if (password.length < 8) errors.password = 'Password must be at least 8 characters';
    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;
    setIsLoading(true);
    try {
      await Login({ username, email, password, navigate });
      setError(null);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to log in');
      console.error('Login error:', err.response?.data);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSwitchToSignUp = () => {
    navigate('/signup');
  };

  const handleForgotPassword = () => {
    navigate('/forgot-password'); // Placeholder route
  };

  return (
    <div className="login-main">
      <div className="login-container">
        <h2 className="login-title">Log In</h2>
        {error && <div className="error-message">{error}</div>}
        <form className="login-form" onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="username">Username</label>
            <input
              type="text"
              id="username"
              className="login-input"
              placeholder="Enter username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              aria-invalid={!!validationErrors.username}
              aria-describedby="username-error"
              required
            />
            {validationErrors.username && <span id="username-error" className="validation-error">{validationErrors.username}</span>}
          </div>
          <div className="form-group">
            <label htmlFor="email">Email</label>
            <input
              type="email"
              id="email"
              className="login-input"
              placeholder="Enter email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              aria-invalid={!!validationErrors.email}
              aria-describedby="email-error"
              required
            />
            {validationErrors.email && <span id="email-error" className="validation-error">{validationErrors.email}</span>}
          </div>
          <div className="form-group">
            <label htmlFor="password">Password</label>
            <div className="password-wrapper">
              <input
                type={showPassword ? 'text' : 'password'}
                id="password"
                className="login-input"
                placeholder="Enter password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                aria-invalid={!!validationErrors.password}
                aria-describedby="password-error"
                required
              />
              <button
                type="button"
                className="toggle-password"
                onClick={() => setShowPassword(!showPassword)}
                aria-label={showPassword ? 'Hide password' : 'Show password'}
              >
                {showPassword ? <FaEyeSlash /> : <FaEye />}
              </button>
            </div>
            {validationErrors.password && <span id="password-error" className="validation-error">{validationErrors.password}</span>}
          </div>
          <div className="forgot-password">
            <button type="button" className="forgot-btn" onClick={handleForgotPassword}>
              Forgot Password?
            </button>
          </div>
          <button type="submit" className="login-btn" disabled={isLoading}>
            {isLoading ? 'Logging In...' : 'Log In'}
          </button>
          <div className="switch-link">
            <span>Don't have an account? </span>
            <button type="button" className="switch-btn" onClick={handleSwitchToSignUp}>
              Sign Up
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default Login;