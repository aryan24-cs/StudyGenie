import React, { useState, useEffect } from 'react';
import '../style/Dashboard.css';
import useUsercred from '../Hooks/useUsercred'; // Assume this or a new hook for user data
import { useNavigate } from 'react-router-dom';
import { FaUserCircle, FaHistory, FaTrash, FaEye, FaSignOutAlt } from 'react-icons/fa';

function Dashboard() {
    const navigate = useNavigate();
    const { fetchUserData, deleteHistoryItem, logout } = useUsercred(); // Assume these methods in the hook
    const [user, setUser] = useState(null);
    const [history, setHistory] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const loadUserData = async () => {
            try {
                const data = await fetchUserData(); // Fetches user profile and history from backend
                setUser(data.user);
                setHistory(data.history);
            } catch (err) {
                setError('Failed to load user data');
                console.error(err);
            } finally {
                setLoading(false);
            }
        };
        loadUserData();
    }, [fetchUserData]);

    const handleDeleteItem = async (itemId) => {
        if (window.confirm('Are you sure you want to delete this history item?')) {
            try {
                await deleteHistoryItem(itemId); // Deletes item from backend
                setHistory(history.filter((item) => item._id !== itemId));
            } catch (err) {
                setError('Failed to delete item');
                console.error(err);
            }
        }
    };

    const handleViewItem = (item) => {
        // Placeholder: Navigate to a view page or open modal
        alert(`Viewing: ${item.fileName}\nPath: ${item.filePath}`);
    };

    const handleLogout = async () => {
        try {
            await logout();
            navigate('/login');
        } catch (err) {
            setError('Failed to log out');
            console.error(err);
        }
    };

    if (loading) {
        return <div className="dashboard-loading">Loading dashboard...</div>;
    }

    if (error) {
        return <div className="dashboard-error">{error}</div>;
    }

    return (
        <div className="dashboard-main">
            <header className="dashboard-header">
                <div className="header-left">
                    <FaUserCircle className="user-icon" />
                    <h1>Welcome, {user?.username || 'User'}</h1>
                </div>
                <button className="logout-btn" onClick={handleLogout}>
                    <FaSignOutAlt /> Log Out
                </button>
            </header>

            <section className="profile-section">
                <h2>Profile Information</h2>
                <div className="profile-card">
                    <p><strong>Username:</strong> {user?.username}</p>
                    <p><strong>Email:</strong> {user?.email}</p>
                    <p><strong>Joined:</strong> {new Date(user?.createdAt).toLocaleDateString()}</p>
                    <button className="edit-profile-btn">Edit Profile</button> {/* Placeholder for edit functionality */}
                </div>
            </section>

            <section className="history-section">
                <h2><FaHistory /> Upload History</h2>
                {history.length === 0 ? (
                    <p className="no-history">No history items found. Upload your first study material!</p>
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
                                    <td>{new Date(item.uploadDate || Date.now()).toLocaleDateString()}</td> {/* Assume uploadDate field */}
                                    <td>
                                        <button className="view-btn" onClick={() => handleViewItem(item)}>
                                            <FaEye /> View
                                        </button>
                                        <button className="delete-btn" onClick={() => handleDeleteItem(item._id)}>
                                            <FaTrash /> Delete
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}
            </section>

            <footer className="dashboard-footer">
                <p>&copy; 2023 StudyGenix. All rights reserved.</p>
            </footer>
        </div>
    );
}

export default Dashboard;