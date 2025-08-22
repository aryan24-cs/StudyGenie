import React, { useState, useEffect } from "react";
import "../style/Dashboard.css";
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
  FaTrash
} from "react-icons/fa";
import Navbar from "../components/Navbar"; // Import the Navbar component

function Dashboard() {
  const navigate = useNavigate();
  const [history, setHistory] = useState([
    {
      _id: "1",
      fileName: "Math_Notes.pdf",
      filePath: "/uploads/math_notes.pdf",
      uploadDate: "2025-08-20T10:00:00Z",
    },
    {
      _id: "2",
      fileName: "Physics_Quiz.pdf",
      filePath: "/uploads/physics_quiz.pdf",
      uploadDate: "2025-08-19T14:30:00Z",
    },
    {
      _id: "3",
      fileName: "Chemistry_Chapter1.pdf",
      filePath: "/uploads/chem_ch1.pdf",
      uploadDate: "2025-08-18T09:15:00Z",
    },
  ]);

  // Static user data
  const user = {
    username: "StudyMaster",
    email: "studymaster@example.com",
    createdAt: "2025-01-15T00:00:00Z",
  };

  // Mock data for stats, subjects, activity, and achievements
  const userStats = {
    totalCards: 847,
    studyStreak: 12,
    accuracy: 78,
    hoursStudied: 24.5,
    weeklyGoal: 20,
    level: 15,
    xp: 3240,
  };

  const subjects = [
    { name: "Mathematics", progress: 85, cards: 234, accuracy: 82 },
    { name: "Physics", progress: 72, cards: 189, accuracy: 75 },
    { name: "Chemistry", progress: 91, cards: 156, accuracy: 89 },
    { name: "Biology", progress: 64, cards: 203, accuracy: 71 },
    { name: "History", progress: 78, cards: 65, accuracy: 80 },
  ];

  const recentActivity = [
    {
      date: "Today",
      activity: "Completed 25 flashcards in Physics",
      score: "+120 XP",
    },
    {
      date: "Yesterday",
      activity: "Perfect score on Chemistry quiz",
      score: "+200 XP",
    },
    { date: "2 days ago", activity: "Studied for 2.5 hours", score: "+150 XP" },
    {
      date: "3 days ago",
      activity: "Unlocked new Math chapter",
      score: "+100 XP",
    },
  ];

  const achievements = [
    {
      title: "Study Streak",
      description: "12 days in a row",
      icon: FaFire,
      color: "#ff4d4f",
    },
    {
      title: "Quiz Master",
      description: "10 perfect scores",
      icon: FaTrophy,
      color: "#f4b400",
    },
    {
      title: "Speed Learner",
      description: "100 cards in 1 hour",
      icon: FaBolt,
      color: "#666",
    },
    {
      title: "Knowledge Seeker",
      description: "5 subjects mastered",
      icon: FaBrain,
      color: "#2196f3",
    },
  ];

  // Heatmap data for past 12 weeks
  const generateHeatmapData = () => {
    const data = [];
    const today = new Date();
    for (let week = 11; week >= 0; week--) {
      const weekData = [];
      for (let day = 0; day < 7; day++) {
        const date = new Date(today);
        date.setDate(date.getDate() - (week * 7 + day));
        const activity = Math.floor(Math.random() * 5);
        weekData.push({
          date: date.toISOString().split("T")[0],
          activity,
          sessions: activity * 2,
        });
      }
      data.push(weekData);
    }
    return data;
  };

  const heatmapData = generateHeatmapData();

  useEffect(() => {
    // Scroll animations
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
  }, []);

  const handleDeleteItem = (itemId) => {
    if (window.confirm("Are you sure you want to delete this history item?")) {
      setHistory(history.filter((item) => item._id !== itemId));
    }
  };

  const handleViewItem = (item) => {
    alert(`Viewing: ${item.fileName}\nPath: ${item.filePath}`);
  };

  return (
    <div className="dashboard-main">
      {/* Navbar */}
      <Navbar />

      {/* Overview Stats */}
      <section className="overview-section">
        <h2 className="section-title slide-in">Your Progress</h2>
        <div className="stats-grid">
          <div className="stat-card animate-on-scroll">
            <FaBrain className="stat-icon" />
            <p className="stat-label">Total Cards</p>
            <p className="stat-value">{userStats.totalCards}</p>
          </div>
          <div className="stat-card animate-on-scroll">
            <FaFire className="stat-icon" style={{ color: "#ff4d4f" }} />
            <p className="stat-label">Study Streak</p>
            <p className="stat-value">{userStats.studyStreak} days</p>
          </div>
          <div className="stat-card animate-on-scroll">
            <FaBullseye className="stat-icon" style={{ color: "#4caf50" }} />
            <p className="stat-label">Accuracy</p>
            <p className="stat-value">{userStats.accuracy}%</p>
          </div>
          <div className="stat-card animate-on-scroll">
            <FaClock className="stat-icon" style={{ color: "#666" }} />
            <p className="stat-label">Hours Studied</p>
            <p className="stat-value">{userStats.hoursStudied}</p>
          </div>
        </div>
      </section>

      <div className="main格">
        {/* Left Column */}
        <div className="left-column">
          {/* Subject Progress */}
          <section className="subjects-section">
            <h2 className="section-title slide-in">
              <FaChartBar className="section-icon" /> Subject Progress
            </h2>
            <div className="subjects-card animate-on-scroll">
              {subjects.map((subject, index) => (
                <div key={index} className="subject-item">
                  <div className="subject-header">
                    <span className="subject-name">{subject.name}</span>
                    <div className="subject-stats">
                      <span>{subject.cards} cards</span>
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
              <button className="view-all-btn">View All</button>
            </div>
          </section>

          {/* Study Heatmap */}
          <section className="heatmap-section">
            <h2 className="section-title slide-in">Study Activity</h2>
            <div className="heatmap-card animate-on-scroll">
              <p className="heatmap-subtitle">Past 12 weeks</p>
              <div className="heatmap-grid">
                {heatmapData.map((week, weekIndex) => (
                  <div key={weekIndex} className="heatmap-week">
                    {week.map((day, dayIndex) => (
                      <div
                        key={dayIndex}
                        className={`heatmap-day activity-${day.activity}`}
                        title={`${day.date}: ${day.sessions} sessions`}
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
          </section>

          {/* Weekly Goal */}
          <section className="goal-section">
            <h2 className="section-title slide-in">
              <FaBullseye className="section-icon" /> Weekly Goal
            </h2>
            <div className="goal-card animate-on-scroll">
              <div className="goal-header">
                <span>
                  {userStats.hoursStudied} / {userStats.weeklyGoal} hours
                </span>
                <span className="goal-percentage">
                  {Math.round(
                    (userStats.hoursStudied / userStats.weeklyGoal) * 100
                  )}
                  % complete
                </span>
              </div>
              <div className="progress-bar">
                <div
                  className="progress-fill"
                  style={{
                    width: `${
                      (userStats.hoursStudied / userStats.weeklyGoal) * 100
                    }%`,
                  }}
                ></div>
              </div>
              <p className="goal-remaining">
                {Math.max(
                  0,
                  userStats.weeklyGoal - userStats.hoursStudied
                ).toFixed(1)}{" "}
                hours remaining
              </p>
            </div>
          </section>

          {/* History Section */}
          <section className="history-section">
            <h2 className="section-title slide-in">
              <FaCalendar className="section-icon" /> Upload History
            </h2>
            <div className="history-card animate-on-scroll">
              {history.length === 0 ? (
                <p className="no-history">
                  No history items found. Upload your first study material!
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
                      <tr key={item._id}>
                        <td>{item.fileName}</td>
                        <td>
                          {new Date(item.uploadDate).toLocaleDateString()}
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
                            onClick={() => handleDeleteItem(item._id)}
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
          </section>
        </div>

        {/* Right Column */}
        <div className="right-column">
          {/* Level & XP */}
          <section className="level-section">
            <h2 className="section-title slide-in">
              <FaTrophy className="section-icon" /> Level & XP
            </h2>
            <div className="level-card animate-on-scroll">
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
          </section>

          {/* Achievements */}
          <section className="achievements-section">
            <h2 className="section-title slide-in">
              <FaTrophy className="section-icon" /> Achievements
            </h2>
            <div className="achievements-card animate-on-scroll">
              {achievements.map((achievement, index) => {
                const Icon = achievement.icon;
                return (
                  <div key={index} className="achievement-item">
                    <Icon
                      className="achievement-icon"
                      style={{ color: achievement.color }}
                    />
                    <div>
                      <p className="achievement-title">{achievement.title}</p>
                      <p className="achievement-description">
                        {achievement.description}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </section>

          {/* Recent Activity */}
          <section className="activity-section">
            <h2 className="section-title slide-in">
              <FaClock className="section-icon" /> Recent Activity
            </h2>
            <div className="activity-card animate-on-scroll">
              {recentActivity.map((activity, index) => (
                <div key={index} className="activity-item">
                  <div className="activity-details">
                    <span className="activity-date">{activity.date}</span>
                    <span className="activity-score">{activity.score}</span>
                  </div>
                  <p>{activity.activity}</p>
                </div>
              ))}
              <button className="view-all-btn">View All Activity</button>
            </div>
          </section>
        </div>
      </div>

      <footer className="dashboard-footer">
        <p>&copy; 2025 StudyGenix. All rights reserved.</p>
      </footer>
    </div>
  );
}

export default Dashboard;
