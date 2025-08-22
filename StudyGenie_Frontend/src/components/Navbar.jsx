import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { FaSignOutAlt } from 'react-icons/fa';
import '../style/Navbar.css';

const Navbar = () => {
  const navigate = useNavigate();

  const handleLogout = () => {
    navigate('/login');
  };

  return (
    <nav className="navbar">
      <div className="navbar-container">
        <div className="navbar-brand">
          <h1 className="navbar-logo">StudyGenix</h1>
        </div>
        <ul className="navbar-links">
          <li>
            <NavLink
              to="/dashboard"
              className={({ isActive }) =>
                `navbar-link ${isActive ? 'navbar-link-active' : ''}`
              }
            >
              Dashboard
            </NavLink>
          </li>
          <li>
            <NavLink
              to="/study"
              className={({ isActive }) =>
                `navbar-link ${isActive ? 'navbar-link-active' : ''}`
              }
            >
              Study
            </NavLink>
          </li>
          <li>
            <NavLink
              to="/ai-mentors"
              className={({ isActive }) =>
                `navbar-link ${isActive ? 'navbar-link-active' : ''}`
              }
            >
              AI Mentors
            </NavLink>
          </li>
        </ul>
        <button className="navbar-logout-btn" onClick={handleLogout}>
          <FaSignOutAlt className="navbar-logout-icon" /> Log Out
        </button>
      </div>
    </nav>
  );
};

export default Navbar;