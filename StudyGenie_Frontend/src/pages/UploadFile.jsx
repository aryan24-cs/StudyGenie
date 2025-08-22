import React, { useState, useCallback, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    FaUpload,
    FaFileAlt,
    FaImage,
    FaBook,
    FaBrain,
    FaChartBar,
    FaCog,
    FaUser,
    FaHome,
    FaTimes,
    FaCheck,
    FaExclamationCircle,
    FaSpinner,
    FaPlus,
    FaTrash
} from 'react-icons/fa';
import '../style/StudyGenieUpload.css';

function StudyGenieUpload() {
    const navigate = useNavigate();
    const [uploadedFiles, setUploadedFiles] = useState([]);
    const [dragActive, setDragActive] = useState(false);
    const [processing, setProcessing] = useState(false);
    const [activeTab, setActiveTab] = useState('upload');
    const [questions, setQuestions] = useState([]);
    const [error, setError] = useState(null);

    const handleDrag = useCallback((e) => {
        e.preventDefault();
        e.stopPropagation();
        if (e.type === 'dragenter' || e.type === 'dragover') {
            setDragActive(true);
        } else if (e.type === 'dragleave') {
            setDragActive(false);
        }
    }, []);

    const handleDrop = useCallback((e) => {
        e.preventDefault();
        e.stopPropagation();
        setDragActive(false);
        if (e.dataTransfer.files && e.dataTransfer.files[0]) {
            handleFiles(e.dataTransfer.files);
        }
    }, []);

    const handleFiles = (files) => {
        const allowedExtensions = ['.pdf', '.docx'];
        const newFiles = Array.from(files)
            .filter((file) => {
                const ext = '.' + file.name.split('.').pop().toLowerCase();
                if (!allowedExtensions.includes(ext)) {
                    setError(`Unsupported file type for ${file.name}. Only PDF and DOCX are allowed.`);
                    return false;
                }
                return true;
            })
            .map((file, index) => ({
                id: Date.now() + index,
                file,
                name: file.name,
                size: file.size,
                type: file.type,
                status: 'uploading',
                progress: 0,
            }));

        if (newFiles.length === 0) {
            return;
        }

        setUploadedFiles((prev) => [...prev, ...newFiles]);

        newFiles.forEach((fileObj, index) => {
            setTimeout(() => {
                const formData = new FormData();
                formData.append('pdf', fileObj.file);
                formData.append('user_id', '507f1f77bcf86cd799439011'); // Replace with actual user ID

                fetch('http://localhost:5000/api/ver1/pdf/uploadmern', { // Updated endpoint
                    method: 'POST',
                    body: formData,
                })
                    .then(async (response) => {
                        if (!response.ok) {
                            if (response.status === 404) {
                                throw new Error('Server endpoint not found. Ensure the Express backend is running on http://localhost:5000/api/ver1/pdf/uploadmern.');
                            }
                            const text = await response.text();
                            try {
                                const json = JSON.parse(text);
                                throw new Error(json.error || `HTTP error! Status: ${response.status}`);
                            } catch {
                                throw new Error(`Non-JSON response received: ${text.slice(0, 50)}...`);
                            }
                        }
                        return response.json();
                    })
                    .then((data) => {
                        if (data.error) {
                            throw new Error(data.error);
                        }
                        setUploadedFiles((prev) =>
                            prev.map((f) =>
                                f.id === fileObj.id ? { ...f, status: 'completed', progress: 100, vectorPath: data.vectorPath } : f
                            )
                        );
                        setQuestions(data.questions || []);
                        setError(null);
                    })
                    .catch((error) => {
                        console.error('Upload error:', error.message);
                        setError(`Failed to upload ${fileObj.name}: ${error.message}`);
                        setUploadedFiles((prev) =>
                            prev.map((f) =>
                                f.id === fileObj.id ? { ...f, status: 'error', progress: 0 } : f
                            )
                        );
                    });
            }, index * 500);
        });
    };

    const removeFile = (fileId) => {
        setUploadedFiles((prev) => prev.filter((f) => f.id !== fileId));
    };

    const getFileIcon = (type) => {
        if (type.includes('pdf')) return <FaFileAlt className="file-icon pdf" />;
        if (type.includes('image')) return <FaImage className="file-icon image" />;
        return <FaFileAlt className="file-icon default" />;
    };

    const formatFileSize = (bytes) => {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    };

    const sidebarItems = [
        { id: 'dashboard', icon: FaHome, label: 'Dashboard', path: '/dashboard' },
        { id: 'upload', icon: FaUpload, label: 'Upload Materials', path: '/upload' },
        { id: 'study', icon: FaBook, label: 'Study Guides', path: '/study' },
        { id: 'tutor', icon: FaBrain, label: 'AI Tutor', path: '/tutor' },
        { id: 'progress', icon: FaChartBar, label: 'Progress', path: '/progress' },
        { id: 'profile', icon: FaUser, label: 'Profile', path: '/profile' },
        { id: 'settings', icon: FaCog, label: 'Settings', path: '/settings' },
    ];

    const processFiles = () => {
        setProcessing(true);
        setTimeout(() => {
            setProcessing(false);
            alert('Files processed successfully! Study materials are being generated.');
        }, 3000);
    };

    useEffect(() => {
        const elements = document.querySelectorAll('.animate-on-scroll');
        const observer = new IntersectionObserver(
            (entries) => {
                entries.forEach((entry) => {
                    if (entry.isIntersecting) {
                        entry.target.classList.add('visible');
                    }
                });
            },
            { threshold: 0.1 }
        );
        elements.forEach((element) => observer.observe(element));
        return () => elements.forEach((element) => observer.unobserve(element));
    }, []);

    return (
        <div className="upload-container">
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
                            className={`sidebar-item ${activeTab === item.id ? 'active' : ''}`}
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
                            <h2 className="header-title slide-in">Upload Study Materials</h2>
                            <p className="header-description">
                                Upload your PDFs or DOCX files to generate personalized study guides,
                                flashcards, and quizzes with AI-powered insights.
                            </p>
                        </div>
                        {error && (
                            <div className="error-message">
                                <FaExclamationCircle />
                                <span>{error}</span>
                            </div>
                        )}
                        <div
                            className={`upload-zone ${dragActive ? 'active' : ''}`}
                            onDragEnter={handleDrag}
                            onDragLeave={handleDrag}
                            onDragOver={handleDrag}
                            onDrop={handleDrop}
                        >
                            <input
                                type="file"
                                multiple
                                accept=".pdf,.docx"
                                onChange={(e) => handleFiles(e.target.files)}
                                className="file-input"
                                aria-label="Upload files"
                            />
                            <div className="upload-content">
                                <div className="upload-icon">
                                    <FaUpload />
                                </div>
                                <h3 className="upload-title">Drop files here or click to browse</h3>
                                <p className="upload-description">
                                    Supports PDF and DOCX files up to 50MB each
                                </p>
                                <div className="upload-types">
                                    <div className="type-item">
                                        <FaFileAlt />
                                        <span>Documents</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                        {uploadedFiles.length > 0 && (
                            <div className="file-list">
                                <div className="file-list-header">
                                    <h3 className="file-list-title">
                                        Uploaded Files ({uploadedFiles.length})
                                    </h3>
                                    <button
                                        onClick={processFiles}
                                        disabled={processing || uploadedFiles.some((f) => f.status === 'uploading')}
                                        className="process-button"
                                    >
                                        {processing ? (
                                            <>
                                                <FaSpinner className="spinner" />
                                                <span>Processing...</span>
                                            </>
                                        ) : (
                                            <>
                                                <FaBrain />
                                                <span>Generate Study Materials</span>
                                            </>
                                        )}
                                    </button>
                                </div>
                                <div className="file-list-container">
                                    {uploadedFiles.map((file) => (
                                        <div key={file.id} className="file-item">
                                            <div className="file-details">
                                                {getFileIcon(file.type)}
                                                <div className="file-info">
                                                    <p className="file-name">{file.name}</p>
                                                    <p className="file-size">{formatFileSize(file.size)}</p>
                                                </div>
                                                <div className="file-status">
                                                    {file.status === 'uploading' && (
                                                        <div className="progress-container">
                                                            <div className="progress-bar">
                                                                <div
                                                                    className="progress-fill"
                                                                    style={{ width: `${file.progress}%` }}
                                                                />
                                                            </div>
                                                            <span className="progress-text">{file.progress}%</span>
                                                        </div>
                                                    )}
                                                    {file.status === 'completed' && (
                                                        <div className="status-complete">
                                                            <FaCheck />
                                                            <span>Complete</span>
                                                        </div>
                                                    )}
                                                    {file.status === 'error' && (
                                                        <div className="status-error">
                                                            <FaExclamationCircle />
                                                            <span>Error</span>
                                                        </div>
                                                    )}
                                                    <button
                                                        onClick={() => removeFile(file.id)}
                                                        className="remove-button"
                                                        aria-label={`Remove ${file.name}`}
                                                    >
                                                        <FaTrash />
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                        {questions.length > 0 && (
                            <div className="questions-list">
                                <h3 className="questions-title slide-in">Generated Questions</h3>
                                <div className="questions-container">
                                    {questions.map((q, index) => (
                                        <div key={index} className="question-item">
                                            <p className="question-text">{q.question}</p>
                                            <p className="question-type">Type: {q.type}</p>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                        <div className="features-grid">
                            <div className="feature-card animate-on-scroll">
                                <div className="feature-icon">
                                    <FaBrain />
                                </div>
                                <h3 className="feature-title">AI-Powered Analysis</h3>
                                <p className="feature-description">
                                    Advanced AI extracts key concepts and generates personalized study materials from your uploads.
                                </p>
                            </div>
                            <div className="feature-card animate-on-scroll">
                                <div className="feature-icon">
                                    <FaBook />
                                </div>
                                <h3 className="feature-title">Smart Summaries</h3>
                                <p className="feature-description">
                                    Get concise summaries, flashcards, and quizzes automatically generated from your materials.
                                </p>
                            </div>
                            <div className="feature-card animate-on-scroll">
                                <div className="feature-icon">
                                    <FaChartBar />
                                </div>
                                <h3 className="feature-title">Progress Tracking</h3>
                                <p className="feature-description">
                                    Monitor your learning progress with detailed analytics and personalized recommendations.
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default StudyGenieUpload;