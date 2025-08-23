import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { FaBook, FaGraduationCap } from 'react-icons/fa';

const OnboardingPage = () => {
    const [gradeLevel, setGradeLevel] = useState('');
    const [learningInterests, setLearningInterests] = useState([]);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const navigate = useNavigate();

    const gradeOptions = [
        'Grade 6', 'Grade 7', 'Grade 8', 'Grade 9', 'Grade 10',
        'Grade 11', 'Grade 12', 'College', 'Other'
    ];

    const interestOptions = [
        'Mathematics', 'Science', 'History', 'Literature', 'Computer Science',
        'Art', 'Music', 'Languages', 'Engineering', 'Business', 'Other'
    ];

    const handleInterestToggle = (interest) => {
        setLearningInterests((prev) =>
            prev.includes(interest)
                ? prev.filter((i) => i !== interest)
                : [...prev, interest]
        );
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setSuccess('');

        if (!gradeLevel || learningInterests.length === 0) {
            setError('Please select your grade level and at least one learning interest');
            return;
        }

        try {
            const response = await axios.post(
                'http://localhost:5000/api/ver1/user/onboarding',
                { gradeLevel, learningInterests },
                { withCredentials: true }
            );
            console.log('Onboarding response:', response.data); // Debug log
            setSuccess('Onboarding completed! Redirecting to dashboard...');
            setTimeout(() => navigate('/dashboard'), 2000);
        } catch (err) {
            console.error('Onboarding request error:', err); // Debug log
            setError(err.response?.data?.message || 'Failed to save onboarding data');
        }
    };

    return (
        <div className="onboarding-page">
            <div className="form-container">
                <div className="form-header">
                    <FaGraduationCap className="header-icon" />
                    <h2>Welcome to StudyGenix!</h2>
                    <p>Tell us about yourself to personalize your learning experience</p>
                </div>

                <form onSubmit={handleSubmit}>
                    <div className="input-group">
                        <FaBook className="input-icon" />
                        <select
                            value={gradeLevel}
                            onChange={(e) => setGradeLevel(e.target.value)}
                            required
                        >
                            <option value="" disabled>Select your grade level</option>
                            {gradeOptions.map((option) => (
                                <option key={option} value={option}>{option}</option>
                            ))}
                        </select>
                    </div>

                    <div className="interests-group">
                        <h3>Your Learning Interests</h3>
                        <div className="interests-grid">
                            {interestOptions.map((interest) => (
                                <button
                                    type="button"
                                    key={interest}
                                    className={`interest-btn ${learningInterests.includes(interest) ? 'selected' : ''}`}
                                    onClick={() => handleInterestToggle(interest)}
                                >
                                    {interest}
                                </button>
                            ))}
                        </div>
                    </div>

                    {error && <p className="error-message">{error}</p>}
                    {success && <p className="success-message">{success}</p>}

                    <button type="submit" className="submit-btn">
                        Complete Onboarding
                    </button>
                </form>
            </div>

            <style jsx>{`
        .onboarding-page {
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
          max-width: 500px;
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

        select {
          width: 100%;
          padding: 1rem 1rem 1rem 3rem;
          border: 1px solid rgba(59, 130, 246, 0.2);
          border-radius: 50px;
          font-size: 1rem;
          transition: all 0.3s ease;
          background: white;
        }

        select:focus {
          border-color: #3b82f6;
          box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
        }

        .interests-group {
          margin-bottom: 2rem;
        }

        .interests-group h3 {
          font-size: 1.2rem;
          color: #1e3a8a;
          margin-bottom: 1rem;
        }

        .interests-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
          gap: 0.75rem;
        }

        .interest-btn {
          background: #f4f4ff;
          border: 1px solid rgba(59, 130, 246, 0.2);
          padding: 0.75rem;
          border-radius: 50px;
          font-size: 0.9rem;
          color: #1e3a8a;
          cursor: pointer;
          transition: all 0.3s ease;
        }

        .interest-btn.selected {
          background: #3b82f6;
          color: white;
          border-color: #3b82f6;
        }

        .interest-btn:hover {
          background: rgba(59, 130, 246, 0.1);
          transform: translateY(-2px);
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

        @media (max-width: 480px) {
          .form-container {
            padding: 2rem 1.5rem;
          }

          .interests-grid {
            grid-template-columns: 1fr;
          }
        }
      `}</style>
        </div>
    );
};

export default OnboardingPage;