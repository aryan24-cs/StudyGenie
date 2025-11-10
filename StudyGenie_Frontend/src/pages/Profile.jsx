import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import AOS from "aos";
import "aos/dist/aos.css";
import "../style/Profile.css";

const Profile = () => {
  const [user, setUser] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    username: "",
    phoneNumber: "",
    age: "",
  });
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    AOS.init({ duration: 800 });
    fetchUser();
  }, []);

  const fetchUser = async () => {
    setIsLoading(true);
    try {
      const response = await fetch(
        "http://localhost:5000/api/ver1/user/fetchcred",
        {
          method: "GET",
          credentials: "include",
        }
      );
      const data = await response.json();
      if (data.statusCode === 200) {
        setUser(data.data);
        setFormData({
          username: data.data.username || "",
          phoneNumber: data.data.phoneNumber || "",
          age: data.data.age || "",
        });
      } else {
        console.error("Fetch user failed:", data.message);
        navigate("/login");
      }
    } catch (err) {
      console.error("Fetch user error:", err);
      navigate("/login");
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleUpdateProfile = async () => {
    setIsLoading(true);
    setError("");
    try {
      const response = await fetch(
        "http://localhost:5000/api/ver1/user/update-profile",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          credentials: "include",
          body: JSON.stringify(formData),
        }
      );
      const data = await response.json();
      if (data.statusCode === 200) {
        setUser((prev) => ({
          ...prev,
          username: formData.username,
          phoneNumber: formData.phoneNumber,
          age: formData.age,
        }));
        setIsEditing(false);
      } else {
        setError(data.message || "Failed to update profile.");
      }
    } catch (err) {
      console.error("Update profile error:", err);
      setError("An error occurred while updating the profile.");
    } finally {
      setIsLoading(false);
    }
  };

  const totalPoints =
    user?.achievements?.reduce((sum, a) => sum + a.points, 0) || 0;
  const progressToNextLevel = Math.min((totalPoints / 1000) * 100, 100);

  if (!user) {
    return (
      <div className="loading-container">
        <div className="spinner"></div>
      </div>
    );
  }

  return (
    <div className="profile-container">
      <div className="content-wrapper">
        <nav
          className="navbar"
          data-aos="fade-down"
        >
          <a
            href="/landing"
            className="logo"
          >
            <i className="fas fa-graduation-cap logo-icon"></i>StudyGenix
          </a>
          <div className="nav-links">
            <a href="/dashboard" className="nav-link">
              Dashboard
            </a>
            <a href="/logout" className="nav-link">
              Logout
            </a>
          </div>
        </nav>

        <div
          className="profile-card"
          data-aos="fade-up"
        >
          <div className="profile-header">
            <h1 className="profile-title">My Profile</h1>
            <button
              className="edit-button"
              onClick={() => setIsEditing(!isEditing)}
            >
              {isEditing ? "Cancel" : "Edit Profile"}
            </button>
          </div>

          {isEditing ? (
            <div className="edit-form">
              <div>
                <label className="form-label">
                  Username
                </label>
                <input
                  type="text"
                  name="username"
                  value={formData.username}
                  onChange={handleInputChange}
                  className="form-input"
                />
              </div>
              <div>
                <label className="form-label">
                  Phone Number
                </label>
                <input
                  type="text"
                  name="phoneNumber"
                  value={formData.phoneNumber}
                  onChange={handleInputChange}
                  placeholder="+1234567890"
                  className="form-input"
                />
              </div>
              <div>
                <label className="form-label">
                  Age
                </label>
                <input
                  type="number"
                  name="age"
                  value={formData.age}
                  onChange={handleInputChange}
                  min="13"
                  max="100"
                  className="form-input"
                />
              </div>
              <div className="form-button-container">
                <button
                  className="save-button"
                  onClick={handleUpdateProfile}
                  disabled={isLoading}
                >
                  {isLoading ? "Saving..." : "Save Changes"}
                </button>
              </div>
              {error && <p className="error-message">{error}</p>}
            </div>
          ) : (
            <div className="profile-info">
              <div>
                <h3 className="info-label">
                  Username
                </h3>
                <p className="info-text">
                  {user.username || "Not specified"}
                </p>
              </div>
              <div>
                <h3 className="info-label">Email</h3>
                <p className="info-text">{user.email}</p>
              </div>
              <div>
                <h3 className="info-label">
                  Phone Number
                </h3>
                <p className="info-text">
                  {user.phoneNumber || "Not specified"}
                </p>
              </div>
              <div>
                <h3 className="info-label">Age</h3>
                <p className="info-text">{user.age || "Not specified"}</p>
              </div>
              <div>
                <h3 className="info-label">
                  Grade Level
                </h3>
                <p className="info-text">
                  {user.gradeLevel || "Not specified"}
                </p>
              </div>
              <div>
                <h3 className="info-label">
                  Subjects
                </h3>
                <p className="info-text">
                  {user.learningInterests?.length > 0
                    ? user.learningInterests.join(", ")
                    : "Not specified"}
                </p>
              </div>
            </div>
          )}
        </div>

        <div
          className="badges-card"
          data-aos="fade-up"
          data-aos-delay="100"
        >
          <h2 className="section-title">Badges</h2>
          {user.badges?.length > 0 ? (
            <div className="badges-grid">
              {user.badges.map((badge, index) => (
                <div
                  key={index}
                  className="badge-item"
                  data-aos="zoom-in"
                  data-aos-delay={index * 100}
                >
                  <span className="badge-icon">{badge.icon}</span>
                  <h4 className="badge-name">
                    {badge.name}
                  </h4>
                  <p className="badge-description">
                    {badge.description}
                  </p>
                  <div className="badge-tooltip">
                    Earned: {new Date(badge.earnedAt).toLocaleDateString()}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="no-data-text">
              No badges earned yet. Keep exploring!
            </p>
          )}
        </div>

        <div
          className="achievements-card"
          data-aos="fade-up"
          data-aos-delay="200"
        >
          <h2 className="section-title">Achievements</h2>
          <div className="progress-section">
            <h3 className="info-label">
              Progress to Next Level
            </h3>
            <div className="progress-bar">
              <div
                className="progress-fill"
                style={{ width: `${progressToNextLevel}%` }}
              ></div>
            </div>
            <p className="progress-text">
              {totalPoints}/1000 points
            </p>
          </div>
          {user.achievements?.length > 0 ? (
            <div className="achievements-list">
              {user.achievements.map((achievement, index) => (
                <div
                  key={index}
                  className="achievement-item"
                  data-aos="fade-right"
                  data-aos-delay={index * 100}
                >
                  <div className="achievement-icon">
                    <span className="icon">🏅</span>
                  </div>
                  <div className="achievement-details">
                    <h4 className="achievement-title">
                      {achievement.title}
                    </h4>
                    <p className="achievement-description">
                      {achievement.description}
                    </p>
                    <p className="achievement-meta">
                      {achievement.points} points • Earned:{" "}
                      {new Date(achievement.earnedAt).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="no-data-text">
              No achievements earned yet. Start completing tasks!
            </p>
          )}
        </div>

        {isLoading && (
          <div className="loading-container">
            <div className="spinner"></div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Profile;
