import React, { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import {
  FaBrain,
  FaFire,
  FaBullseye,
  FaClock,
  FaCalendar,
  FaBolt,
  FaChartBar,
  FaTrophy,
  FaEye,
  FaTrash,
  FaHome,
  FaUpload,
  FaBook,
  FaUser,
  FaCog,
} from "react-icons/fa";
import "../style/Dashboard.css";

const getCookie = (name) => {
  const value = `; ${document.cookie}`;
  const parts = value.split(`; ${name}=`);
  if (parts.length === 2) return parts.pop().split(";").shift();
  return null;
};

function Dashboard() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [history, setHistory] = useState([]);
  const [quizResults, setQuizResults] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState("dashboard");

  // Fetch user data and history
  const fetchUserData = useCallback(async () => {
    const accessToken = getCookie("accessToken");
    if (!accessToken) {
      setError("Please log in to view your dashboard.");
      setLoading(false);
      navigate("/login");
      return;
    }

    try {
      // Fetch user info
      const userResponse = await fetch(
        "http://localhost:5000/api/ver1/user/fetchcred",
        {
          headers: { Authorization: `Bearer ${accessToken}` },
        }
      );
      if (!userResponse.ok) {
        throw new Error("Failed to fetch user data");
      }
      const userData = await userResponse.json();
      setUser(userData.data);

      // Fetch history and quiz results
      const historyResponse = await fetch(
        "http://localhost:5000/api/ver1/user/history",
        {
          headers: { Authorization: `Bearer ${accessToken}` },
        }
      );
      if (!historyResponse.ok) {
        throw new Error("Failed to fetch history");
      }
      const historyData = await historyResponse.json();
      setHistory(historyData.data || []);

      // Fetch quiz results (assuming an endpoint to retrieve all quiz results)
      const quizResponse = await fetch(
        "http://localhost:5000/api/ver1/pdf/quiz-results",
        {
          headers: { Authorization: `Bearer ${accessToken}` },
        }
      );
      if (!quizResponse.ok) {
        throw new Error("Failed to fetch quiz results");
      }
      const quizData = await quizResponse.json();
      setQuizResults(quizData.data || []);

      setLoading(false);
    } catch (err) {
      setError(err.message);
      setLoading(false);
      if (err.message.includes("Unauthorized")) {
        navigate("/login");
      }
    }
  }, [navigate]);

  // Generate heatmap data
  const generateHeatmapData = useCallback(() => {
    const data = [];
    const today = new Date();
    for (let week = 11; week >= 0; week--) {
      const weekData = [];
      for (let day = 0; day < 7; day++) {
        const date = new Date(today);
        date.setDate(date.getDate() - (week * 7 + day));
        const quizOnDate = quizResults.filter(
          (quiz) =>
            new Date(quiz.timestamp).toISOString().split("T")[0] ===
            date.toISOString().split("T")[0]
        );
        const activity = Math.min(quizOnDate.length, 4); // Cap at 4 for intensity
        weekData.push({
          date: date.toISOString().split("T")[0],
          activity,
          sessions: quizOnDate.length,
        });
      }
      data.push(weekData);
    }
    return data;
  }, [quizResults]);

  useEffect(() => {
    fetchUserData();
    const elements = document.querySelectorAll(".animate-on-scroll");
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("visible");
          }
        });
      },
      { threshold: 0.1 }
    );
    elements.forEach((element) => observer.observe(element));
    return () => elements.forEach((element) => observer.unobserve(element));
  }, [fetchUserData]);

  const handleDeleteItem = async (vectorPath) => {
    if (window.confirm("Are you sure you want to delete this history item?")) {
      try {
        const accessToken = getCookie("accessToken");
        const response = await fetch(
          "http://localhost:5000/api/ver1/pdf/delete",
          {
            method: "DELETE",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${accessToken}`,
            },
            body: JSON.stringify({ vectorPath }),
          }
        );
        if (!response.ok) {
          throw new Error("Failed to delete history item");
        }
        setHistory(history.filter((item) => item.vectorPath !== vectorPath));
      } catch (err) {
        setError(err.message);
      }
    }
  };

  const handleViewItem = (item) => {
    window.open(item.filePath, "_blank");
  };

  const sidebarItems = [
    { id: "dashboard", icon: FaHome, label: "Dashboard", path: "/dashboard" },
    {
      id: "upload",
      icon: FaUpload,
      label: "Upload Materials",
      path: "/upload",
    },
    { id: "study", icon: FaBook, label: "Study Guides", path: "/study" },
    { id: "tutor", icon: FaBrain, label: "AI Tutor", path: "/tutor" },
    { id: "progress", icon: FaChartBar, label: "Progress", path: "/progress" },
    { id: "profile", icon: FaUser, label: "Profile", path: "/profile" },
    { id: "settings", icon: FaCog, label: "Settings", path: "/settings" },
  ];

  // Calculate dynamic stats
  const userStats = {
    totalCards: quizResults.reduce((sum, quiz) => sum + quiz.total, 0),
    studyStreak: calculateStudyStreak(quizResults),
    accuracy: quizResults.length
      ? (
          quizResults.reduce((sum, quiz) => sum + quiz.percentage, 0) /
          quizResults.length
        ).toFixed(2)
      : 0,
    hoursStudied: (quizResults.length * 0.5).toFixed(1), // Estimate 30 min per quiz
    weeklyGoal: 20,
    level: Math.floor(quizResults.length / 5) + 1,
    xp: quizResults.length * 100,
  };

  function calculateStudyStreak(results) {
    if (!results.length) return 0;
    let streak = 0;
    const sortedDates = [
      ...new Set(
        results.map((r) => new Date(r.timestamp).toISOString().split("T")[0])
      ),
    ].sort((a, b) => new Date(b) - new Date(a));
    const today = new Date().toISOString().split("T")[0];
    let current = new Date(today);
    for (let date of sortedDates) {
      const quizDate = new Date(date);
      if (current.toISOString().split("T")[0] === date) {
        streak++;
        current.setDate(current.getDate() - 1);
      } else {
        break;
      }
    }
    return streak;
  }

  // Dynamic subjects based on quiz results
  const subjects = Array.from(
    new Set(history.map((item) => item.fileName.split("_")[0]))
  ).map((name, index) => ({
    name,
    progress: quizResults[index % quizResults.length]?.percentage || 50,
    cards: quizResults[index % quizResults.length]?.total || 10,
    accuracy: quizResults[index % quizResults.length]?.percentage || 70,
  }));

  // Recent activity from quiz results
  const recentActivity = quizResults.slice(0, 4).map((quiz, index) => ({
    date: new Date(quiz.timestamp).toLocaleDateString(),
    activity: `Completed quiz for ${
      history.find((h) => h.vectorPath === quiz.vectorPath)?.fileName ||
      "Unknown File"
    }`,
    score: `+${quiz.score * 20} XP`,
  }));

  const heatmapData = generateHeatmapData();

  if (loading) {
    return <div className="dashboard-loading">Loading...</div>;
  }

  if (error) {
    return <div className="dashboard-error">{error}</div>;
  }

  return (
    <div className="dashboard-container">
      <div className="sidebar">
        <div className="sidebar-header">
          <div className="logo-container">
            <div className="logo-icon">
              <FaBrain />
            </div>
            <div>
              <h1 className="logo-title">StudyGenix</h1>
              <p className="logo-subtitle">Smart Learning</p>
              {user && (
                <p className="text-sm text-gray-600">
                  Welcome, {user.username}
                </p>
              )}
            </div>
          </div>
        </div>
        <nav className="sidebar-nav">
          {sidebarItems.map((item) => (
            <button
              key={item.id}
              onClick={() => {
                setActiveTab(item.id);
                navigate(item.path);
              }}
              className={`sidebar-item ${
                activeTab === item.id ? "active" : ""
              }`}
            >
              <item.icon className="sidebar-icon" />
              <span>{item.label}</span>
            </button>
          ))}
        </nav>
      </div>
      <div className="main-content">
        <div className="content-wrapper">
          <div className="content-inner">
            <section className="overview-section">
              <h2 className="header-title slide-in">Your Progress</h2>
              <div className="stats-grid">
                <div className="stat-card animate-on-scroll">
                  <FaBrain className="stat-icon" />
                  <p className="stat-label">Total Quizzes</p>
                  <p className="stat-value">{quizResults.length}</p>
                </div>
                <div className="stat-card animate-on-scroll">
                  <FaFire className="stat-icon" style={{ color: "#ff4d4f" }} />
                  <p className="stat-label">Study Streak</p>
                  <p className="stat-value">{userStats.studyStreak} days</p>
                </div>
                <div className="stat-card animate-on-scroll">
                  <FaBullseye
                    className="stat-icon"
                    style={{ color: "#4caf50" }}
                  />
                  <p className="stat-label">Average Accuracy</p>
                  <p className="stat-value">{userStats.accuracy}%</p>
                </div>
                <div className="stat-card animate-on-scroll">
                  <FaClock className="stat-icon" style={{ color: "#666" }} />
                  <p className="stat-label">Hours Studied</p>
                  <p className="stat-value">{userStats.hoursStudied}</p>
                </div>
              </div>
            </section>

            <div className="main-grid">
              <div className="left-column">
                <section className="subjects-section">
                  <h2 className="header-title slide-in">
                    <FaChartBar className="section-icon" /> Subject Progress
                  </h2>
                  <div className="file-list animate-on-scroll">
                    <div className="file-list-container">
                      {subjects.map((subject, index) => (
                        <div key={index} className="subject-item">
                          <div className="subject-header">
                            <span className="subject-name">{subject.name}</span>
                            <div className="subject-stats">
                              <span>{subject.cards} questions</span>
                              <span>{subject.accuracy}% accuracy</span>
                            </div>
                          </div>
                          <div className="progress-bar">
                            <div
                              className="progress-fill"
                              style={{ width: `${subject.progress}%` }}
                            ></div>
                          </div>
                        </div>
                      ))}
                      {subjects.length === 0 && (
                        <p className="no-history">
                          No subjects found. Upload study materials to get
                          started!
                        </p>
                      )}
                      <button className="process-button">View All</button>
                    </div>
                  </div>
                </section>

                <section className="heatmap-section">
                  <h2 className="header-title slide-in">Study Activity</h2>
                  <div className="file-list animate-on-scroll">
                    <div className="file-list-container">
                      <p className="heatmap-subtitle">
                        Past 12 weeks of quiz activity
                      </p>
                      <div className="heatmap-grid">
                        {heatmapData.map((week, weekIndex) => (
                          <div key={weekIndex} className="heatmap-week">
                            {week.map((day, dayIndex) => (
                              <div
                                key={dayIndex}
                                className={`heatmap-day activity-${day.activity}`}
                                title={`${day.date}: ${day.sessions} quiz${
                                  day.sessions === 1 ? "" : "zes"
                                } completed`}
                              />
                            ))}
                          </div>
                        ))}
                      </div>
                      <div className="heatmap-legend">
                        <span>Less</span>
                        <div className="legend-squares">
                          {[0, 1, 2, 3, 4].map((level) => (
                            <div
                              key={level}
                              className={`legend-square activity-${level}`}
                            />
                          ))}
                        </div>
                        <span>More</span>
                      </div>
                    </div>
                  </div>
                </section>

                <section className="history-section">
                  <h2 className="header-title slide-in">
                    <FaCalendar className="section-icon" /> Upload History
                  </h2>
                  <div className="file-list animate-on-scroll">
                    <div className="file-list-container">
                      {history.length === 0 ? (
                        <p className="no-history">
                          No history items found. Upload your first study
                          material!
                        </p>
                      ) : (
                        <table className="history-table">
                          <thead>
                            <tr>
                              <th>File Name</th>
                              <th>Upload Date</th>
                              <th>Actions</th>
                            </tr>
                          </thead>
                          <tbody>
                            {history.map((item) => (
                              <tr key={item.vectorPath}>
                                <td>{item.fileName}</td>
                                <td>
                                  {new Date(
                                    item.createdAt
                                  ).toLocaleDateString()}
                                </td>
                                <td>
                                  <button
                                    className="view-btn"
                                    onClick={() => handleViewItem(item)}
                                    aria-label={`View ${item.fileName}`}
                                  >
                                    <FaEye /> View
                                  </button>
                                  <button
                                    className="delete-btn"
                                    onClick={() =>
                                      handleDeleteItem(item.vectorPath)
                                    }
                                    aria-label={`Delete ${item.fileName}`}
                                  >
                                    <FaTrash /> Delete
                                  </button>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      )}
                    </div>
                  </div>
                </section>
              </div>

              <div className="right-column">
                <section className="level-section">
                  <h2 className="header-title slide-in">
                    <FaTrophy className="section-icon" /> Level & XP
                  </h2>
                  <div className="file-list animate-on-scroll">
                    <div className="file-list-container level-card">
                      <div className="level-icon">
                        <FaTrophy />
                      </div>
                      <h3>Level {userStats.level}</h3>
                      <p>{userStats.xp} XP</p>
                      <div className="progress-bar">
                        <div
                          className="progress-fill"
                          style={{ width: `${(userStats.xp % 1000) / 10}%` }}
                        ></div>
                      </div>
                      <p className="xp-remaining">
                        {1000 - (userStats.xp % 1000)} XP to next level
                      </p>
                    </div>
                  </div>
                </section>

                <section className="activity-section">
                  <h2 className="header-title slide-in">
                    <FaClock className="section-icon" /> Recent Activity
                  </h2>
                  <div className="file-list animate-on-scroll">
                    <div className="file-list-container">
                      {recentActivity.map((activity, index) => (
                        <div key={index} className="activity-item">
                          <div className="activity-details">
                            <span className="activity-date">
                              {activity.date}
                            </span>
                            <span className="activity-score">
                              {activity.score}
                            </span>
                          </div>
                          <p>{activity.activity}</p>
                        </div>
                      ))}
                      <button className="process-button">
                        View All Activity
                      </button>
                    </div>
                  </div>
                </section>
              </div>
            </div>

            <footer className="dashboard-footer">
              <p>&copy; 2025 StudyGenix. All rights reserved.</p>
            </footer>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Dashboard;
