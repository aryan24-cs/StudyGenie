import React, { useState } from 'react';
import '../style/SignUp.css';
import useUsercred from '../Hooks/useUsercred';
import { useNavigate } from 'react-router-dom';
import { FaEye, FaEyeSlash } from 'react-icons/fa'; // Install react-icons: npm install react-icons

function SignUp() {
  const navigate = useNavigate();
  const { signup } = useUsercred();
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
    if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}/.test(password)) {
      errors.password = 'Password must be at least 8 characters with uppercase, lowercase, number, and special character';
    }
    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;
    setIsLoading(true);
    try {
      await signup({ username, email, password, navigate });
      setError(null);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to sign up');
      console.error('Signup error:', err.response?.data);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSwitchToLogin = () => {
    navigate('/login');
  };

  return (
    <div className="signup-main">
      <div className="signup-container">
        <h2 className="signup-title">Create Account</h2>
        {error && <div className="error-message">{error}</div>}
        <form className="signup-form" onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="username">Username</label>
            <input
              type="text"
              id="username"
              className="signup-input"
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
              className="signup-input"
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
                className="signup-input"
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
          <button type="submit" className="signup-btn" disabled={isLoading}>
            {isLoading ? 'Signing Up...' : 'Sign Up'}
          </button>
          <div className="switch-link">
            <span>Already have an account? </span>
            <button type="button" className="switch-btn" onClick={handleSwitchToLogin}>
              Log In
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default SignUp;