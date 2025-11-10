import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  FaHome,
  FaUpload,
  FaBook,
  FaBrain,
  FaChartBar,
  FaUser,
  FaCog,
  FaExclamationCircle,
  FaSpinner,
  FaTrophy,
} from "react-icons/fa";
import "../style/LeaderBoard.css";

// Utility to get cookie by name
const getCookie = (name) => {
  const value = `; ${document.cookie}`;
  const parts = value.split(`; ${name}=`);
  if (parts.length === 2) return parts.pop().split(";").shift();
  return null;
};

function Leaderboard() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("leaderboard");
  const [leaderboardData, setLeaderboardData] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [currentUserId, setCurrentUserId] = useState(null);

  // Sidebar items matching StudyGenieUpload
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
    { id: "progress", icon: FaChartBar, label: "Career", path: "/career" },
    { id: "profile", icon: FaUser, label: "Profile", path: "/profile" },
    { id: "settings", icon: FaCog, label: "Settings", path: "/settings" },
    {
      id: "leaderboard",
      icon: FaTrophy,
      label: "Leaderboard",
      path: "/leaderboard",
    },
  ];

  // Fetch leaderboard data
  useEffect(() => {
    setIsLoading(true);
    const accessToken = getCookie("accessToken");
    const userId = getCookie("userId");
    setCurrentUserId(userId);

    // Mock data for demonstration (replace with actual API call)
    const mockData = [
      { userId: "1", username: "Alice", points: 950 },
      { userId: "2", username: "Bob", points: 820 },
      { userId: "3", username: "Charlie", points: 600 },
      { userId: "4", username: "David", points: 450 },
      { userId: "5", username: "Eve", points: 300 },
      { userId: "6", username: "Frank", points: 200 },
      { userId: "7", username: "Grace", points: 150 },
      { userId: "8", username: "Hannah", points: 100 },
      { userId: "9", username: "Ian", points: 50 },
      { userId: "10", username: "Judy", points: 25 },
    ];

    // Simulated API call
    setTimeout(() => {
      try {
        // Assign divisions based on points
        const sortedData = mockData.sort((a, b) => b.points - a.points);
        const totalUsers = sortedData.length;
        const leaderboardWithDivisions = sortedData.map((user, index) => {
          let division;
          if (index < Math.ceil(totalUsers * 0.1) || user.points >= 800) {
            division = "Gold";
          } else if (
            index < Math.ceil(totalUsers * 0.3) ||
            user.points >= 500
          ) {
            division = "Silver";
          } else {
            division = "Bronze";
          }
          return { ...user, rank: index + 1, division };
        });

        setLeaderboardData(leaderboardWithDivisions);
        setIsLoading(false);
      } catch (err) {
        setError("Failed to load leaderboard. Please try again.");
        setIsLoading(false);
      }
    }, 1000);

    // Uncomment for actual API call
    /*
    fetch("http://localhost:5000/api/ver1/user/leaderboard", {
      method: "GET",
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
      credentials: "include",
    })
      .then(async (response) => {
        const text = await response.text();
        if (!response.ok) {
          throw new Error(`HTTP error! Status: ${response.status}`);
        }
        return JSON.parse(text);
      })
      .then((data) => {
        const sortedData = data.data.sort((a, b) => b.points - a.points);
        const totalUsers = sortedData.length;
        const leaderboardWithDivisions = sortedData.map((user, index) => {
          let division;
          if (index < Math.ceil(totalUsers * 0.1) || user.points >= 800) {
            division = "Gold";
          } else if (index < Math.ceil(totalUsers * 0.3) || user.points >= 500) {
            division = "Silver";
          } else {
            division = "Bronze";
          }
          return { ...user, rank: index + 1, division };
        });
        setLeaderboardData(leaderboardWithDivisions);
        setIsLoading(false);
      })
      .catch((err) => {
        setError("Failed to load leaderboard: " + err.message);
        setIsLoading(false);
      });
    */
  }, []);

  // Intersection Observer for animations
  useEffect(() => {
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

  return (
    <div className="leaderboard-container">
      <div className="sidebar">
        <div className="sidebar-header">
          <div className="logo-container">
            <div className="logo-icon">
              <FaBrain />
            </div>
            <div>
              <h1 className="logo-title">StudyGenix</h1>
              <p className="logo-subtitle">Smart Learning</p>
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
            <div className="header">
              <h2 className="header-title slide-in">Leaderboard</h2>
              <p className="header-description">
                See where you stand among your peers! Rankings are based on
                points earned, with divisions assigned by your performance.
              </p>
            </div>
            {error && (
              <div className="error-message">
                <FaExclamationCircle />
                <span>{error}</span>
              </div>
            )}
            {isLoading ? (
              <div className="loading-container">
                <FaSpinner className="spinner" />
                <span>Loading leaderboard...</span>
              </div>
            ) : (
              <div className="leaderboard-table">
                <div className="table-header">
                  <div className="table-cell">Rank</div>
                  <div className="table-cell">Student</div>
                  <div className="table-cell">Points</div>
                  <div className="table-cell">Division</div>
                </div>
                {leaderboardData.map((user) => (
                  <div
                    key={user.userId}
                    className={`table-row ${
                      user.userId === currentUserId ? "current-user" : ""
                    }`}
                  >
                    <div className="table-cell">
                      {user.rank}
                      {user.rank <= 3 && (
                        <FaTrophy className={`trophy-icon rank-${user.rank}`} />
                      )}
                    </div>
                    <div className="table-cell">{user.username}</div>
                    <div className="table-cell">{user.points}</div>
                    <div className="table-cell">
                      <span
                        className={`division-badge division-${user.division.toLowerCase()}`}
                      >
                        {user.division}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default Leaderboard;
