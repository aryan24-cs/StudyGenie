import React, { useState } from "react";
import "../style/Login.css";
import useUsercred from "../Hooks/useUsercred";
import { useNavigate } from "react-router-dom";
import { FaEye, FaEyeSlash, FaBrain } from "react-icons/fa";

function Login() {
  const navigate = useNavigate();
  const { Login } = useUsercred();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState(null);
  const [validationErrors, setValidationErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);

  const validateForm = () => {
    const errors = {};
    if (!/\S+@\S+\.\S+/.test(email)) errors.email = "Invalid email format";
    if (password.length < 8)
      errors.password = "Password must be at least 8 characters";
    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;
    setIsLoading(true);
    try {
      await Login({ email, password, navigate });
      setError(null);
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "Failed to log in. Please check your credentials."
      );
      console.error("Login error:", err.response?.data);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSwitchToSignUp = () => {
    navigate("/signup");
  };

  const handleForgotPassword = () => {
    navigate("/forgot-password");
  };

  return (
    <div className="upload-container">
      <div className="content-wrapper">
        <div className="content-inner">
          <div className="login-container">
            <div className="logo-container">
              <div className="logo-icon">
                <FaBrain />
              </div>
              <div>
                <h1 className="logo-title">StudyGenix</h1>
                <p className="logo-subtitle">Smart Learning</p>
              </div>
            </div>
            <h2 className="header-title">Log In</h2>
            {error && <div className="error-message">{error}</div>}
            <form className="login-form" onSubmit={handleSubmit}>
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
                {validationErrors.email && (
                  <span id="email-error" className="validation-error">
                    {validationErrors.email}
                  </span>
                )}
              </div>
              <div className="form-group">
                <label htmlFor="password">Password</label>
                <div className="password-wrapper">
                  <input
                    type={showPassword ? "text" : "password"}
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
                    aria-label={
                      showPassword ? "Hide password" : "Show password"
                    }
                  >
                    {showPassword ? <FaEyeSlash /> : <FaEye />}
                  </button>
                </div>
                {validationErrors.password && (
                  <span id="password-error" className="validation-error">
                    {validationErrors.password}
                  </span>
                )}
              </div>
              <div className="forgot-password">
                <button
                  type="button"
                  className="forgot-btn"
                  onClick={handleForgotPassword}
                >
                  Forgot Password?
                </button>
              </div>
              <button
                type="submit"
                className="process-button"
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <span className="spinner" />
                    Logging In...
                  </>
                ) : (
                  "Log In"
                )}
              </button>
              <div className="switch-link">
                <span>Don't have an account? </span>
                <button
                  type="button"
                  className="switch-btn"
                  onClick={handleSwitchToSignUp}
                >
                  Sign Up
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Login;
