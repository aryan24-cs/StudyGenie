import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { FaEnvelope, FaLock, FaKey } from 'react-icons/fa';

const SignUpPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [otp, setOtp] = useState('');
  const [showOtpField, setShowOtpField] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const navigate = useNavigate();

  const handleSendOTP = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    try {
      console.log('Send OTP request:', { email, password }); // Debug log
      const response = await axios.post(
        'http://localhost:5000/api/ver1/user/send-otp',
        { email, password },
        { withCredentials: true }
      );
      console.log('Send OTP response:', response.data); // Debug log
      setSuccess('OTP sent to your email!');
      setShowOtpField(true);
    } catch (err) {
      console.error('Send OTP error:', err.response?.data, err); // Debug log
      setError(err.response?.data?.message || 'Failed to send OTP');
    }
  };

  const handleVerifyOTP = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    try {
      console.log('Verify OTP request:', { email, otp }); // Debug log
      const response = await axios.post(
        'http://localhost:5000/api/ver1/user/verify-otp',
        { email, otp },
        { withCredentials: true }
      );
      console.log('Verify OTP response:', response.data); // Debug log
      setSuccess('Signup successful! Redirecting to onboarding...');
      setTimeout(() => navigate('/onboarding'), 2000);
    } catch (err) {
      console.error('Verify OTP error:', err.response?.data, err); // Debug log
      setError(err.response?.data?.message || 'Failed to verify OTP');
    }
  };

  return (
    <div className="signup-page">
      <div className="form-container">
        <div className="form-header">
          <FaKey className="header-icon" />
          <h2>Join StudyGenix</h2>
          <p>Create your account to start learning</p>
        </div>

        <form onSubmit={showOtpField ? handleVerifyOTP : handleSendOTP}>
          <div className="input-group">
            <FaEnvelope className="input-icon" />
            <input
              type="email"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          {!showOtpField && (
            <div className="input-group">
              <FaLock className="input-icon" />
              <input
                type="password"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value.trim())}
                required
              />
            </div>
          )}
          {showOtpField && (
            <div className="input-group">
              <FaKey className="input-icon" />
              <input
                type="text"
                placeholder="Enter OTP"
                value={otp}
                onChange={(e) => setOtp(e.target.value)}
                required
              />
            </div>
          )}
          {error && <p className="error-message">{error}</p>}
          {success && <p className="success-message">{success}</p>}
          <button type="submit" className="submit-btn">
            {showOtpField ? 'Verify OTP' : 'Send OTP'}
          </button>
        </form>

        <p className="redirect-text">
          Already have an account? <a href="/login">Login</a>
        </p>
      </div>

      <style jsx>{`
        .signup-page {
          min-height: 100vh;
          display: flex;
          align-items: center;
          justify-content: center;
          background: linear-gradient(135deg, #f8fafc, #f1f5f9);
          padding: 2rem;
        }

        .form-container {
          background: white;
          padding: 3rem 2rem;
          border-radius: 20px;
          box-shadow: 0 10px 40px rgba(0, 0, 0, 0.05);
          max-width: 400px;
          width: 100%;
          text-align: center;
        }

        .form-header {
          margin-bottom: 2rem;
        }

        .header-icon {
          font-size: 3rem;
          color: #3b82f6;
          margin-bottom: 1rem;
        }

        h2 {
          font-size: 2rem;
          color: #1e3a8a;
          margin-bottom: 0.5rem;
        }

        p {
          color: #64748b;
          font-size: 1rem;
        }

        .input-group {
          position: relative;
          margin-bottom: 1.5rem;
        }

        .input-icon {
          position: absolute;
          left: 1rem;
          top: 50%;
          transform: translateY(-50%);
          color: #3b82f6;
          font-size: 1.2rem;
        }

        input {
          width: 100%;
          padding: 1rem 1rem 1rem 3rem;
          border: 1px solid rgba(59, 130, 246, 0.2);
          border-radius: 50px;
          font-size: 1rem;
          transition: all 0.3s ease;
        }

        input:focus {
          border-color: #3b82f6;
          box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
        }

        .error-message {
          color: #ef4444;
          font-size: 0.9rem;
          margin-bottom: 1rem;
        }

        .success-message {
          color: #10b981;
          font-size: 0.9rem;
          margin-bottom: 1rem;
        }

        .submit-btn {
          background: linear-gradient(135deg, #3b82f6, #1e40af);
          color: white;
          border: none;
          padding: 1rem;
          border-radius: 50px;
          font-size: 1.1rem;
          font-weight: 600;
          cursor: pointer;
          width: 100%;
          transition: all 0.3s ease;
        }

        .submit-btn:hover {
          transform: translateY(-3px);
          box-shadow: 0 8px 30px rgba(59, 130, 246, 0.4);
        }

        .redirect-text {
          margin-top: 1.5rem;
          color: #64748b;
          font-size: 0.9rem;
        }

        .redirect-text a {
          color: #3b82f6;
          text-decoration: none;
          font-weight: 600;
        }

        .redirect-text a:hover {
          text-decoration: underline;
        }

        @media (max-width: 480px) {
          .form-container {
            padding: 2rem 1.5rem;
          }
        }
      `}</style>
    </div>
  );
};

export default SignUpPage;