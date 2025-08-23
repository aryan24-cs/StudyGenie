import React, { useState, useCallback, useEffect } from "react";
import { useNavigate } from "react-router-dom";
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
  FaTrash,
  FaEye,
} from "react-icons/fa";
import "../style/StudyGenieUpload.css";

// Utility to get cookie by name
const getCookie = (name) => {
  const value = `; ${document.cookie}`;
  const parts = value.split(`; ${name}=`);
  if (parts.length === 2) return parts.pop().split(";").shift();
  return null;
};

function StudyGenieUpload() {
  const navigate = useNavigate();
  const [uploadedFiles, setUploadedFiles] = useState([]);
  const [dragActive, setDragActive] = useState(false);
  const [processing, setProcessing] = useState(false);
  const [activeTab, setActiveTab] = useState("upload");
  const [questions, setQuestions] = useState(null);
  const [conciseSummary, setConciseSummary] = useState("");
  const [detailedSummary, setDetailedSummary] = useState("");
  const [error, setError] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [answers, setAnswers] = useState({});
  const [quizResult, setQuizResult] = useState(null);
  const [showDetailedSummary, setShowDetailedSummary] = useState(false);

  const handleDrag = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
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
    const allowedExtensions = [".pdf", ".png", ".jpg", ".jpeg"];
    const newFiles = Array.from(files)
      .filter((file) => {
        const ext = "." + file.name.split(".").pop().toLowerCase();
        if (!allowedExtensions.includes(ext)) {
          setError(
            `Unsupported file type for ${file.name}. Only PDF, PNG, JPG, and JPEG are allowed.`
          );
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
        status: "uploading",
        progress: 0,
      }));

    if (newFiles.length === 0) {
      return;
    }

    setUploadedFiles((prev) => [...prev, ...newFiles]);

    newFiles.forEach((fileObj, index) => {
      setTimeout(() => {
        const formData = new FormData();
        formData.append("file", fileObj.file);

        const accessToken = getCookie("accessToken");
        const endpoint = accessToken
          ? "http://localhost:5000/api/ver1/pdf/uploadmern"
          : "http://localhost:5000/api/ver1/pdf/generate-questions";

        fetch(endpoint, {
          method: "POST",
          headers: accessToken
            ? { Authorization: `Bearer ${accessToken}` }
            : {},
          body: formData,
        })
          .then(async (response) => {
            const text = await response.text();
            if (!response.ok) {
              if (response.status === 401) {
                throw new Error(
                  "Unauthorized: Invalid or missing token. Please log in again."
                );
              }
              if (response.status === 404) {
                throw new Error(
                  "Server endpoint not found. Ensure the backend is running on http://localhost:5000."
                );
              }
              try {
                const json = JSON.parse(text);
                throw new Error(
                  json.message || `HTTP error! Status: ${response.status}`
                );
              } catch {
                throw new Error(
                  `Non-JSON response received: ${text.slice(0, 100)}...`
                );
              }
            }
            try {
              return JSON.parse(text);
            } catch {
              throw new Error(
                `Failed to parse response as JSON: ${text.slice(0, 100)}...`
              );
            }
          })
          .then((data) => {
            setUploadedFiles((prev) =>
              prev.map((f) =>
                f.id === fileObj.id
                  ? {
                      ...f,
                      status: "completed",
                      progress: 100,
                      vectorPath: data.data.vectorPath || null,
                    }
                  : f
              )
            );
            setQuestions(data.data.questions);
            setConciseSummary(data.data.conciseSummary || "");
            setDetailedSummary(data.data.detailedSummary || "");
            setIsModalOpen(true);
            setError(null);
          })
          .catch((error) => {
            console.error("Upload error:", error.message);
            let errorMessage = `Failed to upload ${fileObj.name}: ${error.message}`;
            if (error.message.includes("ENOENT")) {
              errorMessage = `File upload failed: The server could not find the uploaded file. Please try again.`;
            } else if (error.message.includes("Unauthorized")) {
              errorMessage = `Please log in to upload files as a registered user.`;
            } else if (error.message.includes("Gemini API")) {
              errorMessage = `Failed to generate questions: The file may contain no readable text or be unsupported. Try a different file.`;
            } else if (error.message.includes("File size exceeds")) {
              errorMessage = `File size exceeds 20MB limit. Please upload a smaller file.`;
            } else if (error.message.includes("Unsupported file type")) {
              errorMessage = `Unsupported file type. Please upload a PDF or image (PNG, JPG, JPEG).`;
            }
            setError(errorMessage);
            setUploadedFiles((prev) =>
              prev.map((f) =>
                f.id === fileObj.id ? { ...f, status: "error", progress: 0 } : f
              )
            );
          });
      }, index * 500);
    });
  };

  const handleAnswerChange = (questionIndex, type, value) => {
    setAnswers((prev) => ({
      ...prev,
      [`${type}-${questionIndex}`]: value,
    }));
  };

  const submitAnswers = () => {
    const accessToken = getCookie("accessToken");
    const vectorPath = uploadedFiles.find(
      (f) => f.status === "completed"
    )?.vectorPath;

    if (accessToken && vectorPath) {
      fetch("http://localhost:5000/api/ver1/pdf/submit-quiz", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${accessToken}`,
        },
        body: JSON.stringify({
          userId: getCookie("userId"),
          vectorPath,
          answers,
        }),
      })
        .then(async (response) => {
          const text = await response.text();
          if (!response.ok) {
            try {
              const json = JSON.parse(text);
              throw new Error(
                json.message || `HTTP error! Status: ${response.status}`
              );
            } catch {
              throw new Error(
                `Non-JSON response received: ${text.slice(0, 100)}...`
              );
            }
          }
          return JSON.parse(text);
        })
        .then((data) => {
          setQuizResult(data.data);
          setIsModalOpen(false);
        })
        .catch((error) => {
          setError(`Failed to submit quiz: ${error.message}`);
        });
    } else {
      // For guest users, evaluate locally
      const evaluation = evaluateAnswers(answers, questions);
      setQuizResult(evaluation);
      setIsModalOpen(false);
    }
    setAnswers({});
  };

  // Local evaluation function (for guest users)
  const evaluateAnswers = (userAnswers, questions) => {
    let score = 0;
    const totalQuestions =
      questions.quiz.length +
      questions.shortAnswer.length +
      questions.trueFalse.length +
      1;
    const feedback = [];

    questions.quiz.forEach((q, index) => {
      const userAnswer = userAnswers[`quiz-${index}`];
      const isCorrect = userAnswer === q.answer;
      if (isCorrect) score += 1;
      feedback.push({
        type: "multiple-choice",
        question: q.question,
        userAnswer,
        correctAnswer: q.answer,
        isCorrect,
        explanation: isCorrect
          ? "Correct! You selected the right option."
          : `Incorrect. The correct answer is "${q.answer}". Review the relevant section of the document.`,
      });
    });

    questions.trueFalse.forEach((q, index) => {
      const userAnswer = userAnswers[`trueFalse-${index}`];
      const isCorrect = userAnswer === q.answer;
      if (isCorrect) score += 1;
      feedback.push({
        type: "true-false",
        question: q.question,
        userAnswer: userAnswer ? "True" : "False",
        correctAnswer: q.answer ? "True" : "False",
        isCorrect,
        explanation: isCorrect
          ? "Correct! You identified the statement correctly."
          : `Incorrect. The correct answer is ${
              q.answer ? "True" : "False"
            }. Check the document for clarification.`,
      });
    });

    questions.shortAnswer.forEach((q, index) => {
      const userAnswer = userAnswers[`shortAnswer-${index}`];
      const isCorrect = userAnswer && userAnswer.trim().length > 10;
      if (isCorrect) score += 1;
      feedback.push({
        type: "short-answer",
        question: q.question,
        userAnswer,
        correctAnswer: "N/A (requires manual grading)",
        isCorrect,
        explanation: isCorrect
          ? "Your answer seems detailed. Ensure it addresses all key points."
          : "Answer is too short or missing. Provide a more detailed response.",
      });
    });

    const summaryAnswer = userAnswers["summary-0"];
    const isSummaryCorrect = summaryAnswer && summaryAnswer.trim().length > 50;
    if (isSummaryCorrect) score += 1;
    feedback.push({
      type: "summary",
      question: questions.summary.question,
      userAnswer: summaryAnswer,
      correctAnswer: "N/A (requires manual grading)",
      isCorrect: isSummaryCorrect,
      explanation: isSummaryCorrect
        ? "Your summary is sufficiently detailed. Ensure it captures the main ideas."
        : "Summary is too short or missing. Include key points from the document.",
    });

    const suggestions = feedback
      .filter((item) => !item.isCorrect)
      .map(
        (item) =>
          `For "${item.question}", review the document section related to ${
            item.correctAnswer || "the topic"
          }.`
      );

    return {
      score,
      total: totalQuestions,
      percentage: ((score / totalQuestions) * 100).toFixed(2),
      feedback,
      suggestions:
        suggestions.length > 0
          ? suggestions
          : ["Great job! Keep reviewing to reinforce your understanding."],
    };
  };

  const removeFile = (fileId) => {
    setUploadedFiles((prev) => prev.filter((f) => f.id !== fileId));
  };

  const getFileIcon = (type) => {
    if (type.includes("pdf")) return <FaFileAlt className="file-icon pdf" />;
    if (type.includes("image")) return <FaImage className="file-icon image" />;
    return <FaFileAlt className="file-icon default" />;
  };

  const formatFileSize = (bytes) => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
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

  const processFiles = () => {
    setProcessing(true);
    setTimeout(() => {
      setProcessing(false);
      alert(
        "Files processed successfully! Study materials are being generated."
      );
    }, 3000);
  };

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
              <h2 className="header-title slide-in">Upload Study Materials</h2>
              <p className="header-description">
                Upload your PDFs or images to generate personalized study
                guides, quizzes, and summaries with AI-powered insights.
              </p>
            </div>
            {error && (
              <div className="error-message flex items-center gap-2 text-red-500 bg-red-100 p-4 rounded-lg mb-4">
                <FaExclamationCircle />
                <span>{error}</span>
              </div>
            )}
            <div
              className={`upload-zone ${dragActive ? "active" : ""}`}
              onDragEnter={handleDrag}
              onDragLeave={handleDrag}
              onDragOver={handleDrag}
              onDrop={handleDrop}
            >
              <input
                type="file"
                multiple
                accept=".pdf,.png,.jpg,.jpeg"
                onChange={(e) => handleFiles(e.target.files)}
                className="file-input"
                aria-label="Upload files"
              />
              <div className="upload-content">
                <div className="upload-icon">
                  <FaUpload />
                </div>
                <h3 className="upload-title">
                  Drop files here or click to browse
                </h3>
                <p className="upload-description">
                  Supports PDF, PNG, JPG, and JPEG files up to 20MB each
                </p>
                <div className="upload-types">
                  <div className="type-item">
                    <FaFileAlt />
                    <span>PDF</span>
                  </div>
                  <div className="type-item">
                    <FaImage />
                    <span>Images</span>
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
                    disabled={
                      processing ||
                      uploadedFiles.some((f) => f.status === "uploading")
                    }
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
                          <p className="file-size">
                            {formatFileSize(file.size)}
                          </p>
                        </div>
                        <div className="file-status">
                          {file.status === "uploading" && (
                            <div className="progress-container">
                              <div className="progress-bar">
                                <div
                                  className="progress-fill"
                                  style={{ width: `${file.progress}%` }}
                                />
                              </div>
                              <span className="progress-text">
                                {file.progress}%
                              </span>
                            </div>
                          )}
                          {file.status === "completed" && (
                            <div className="status-complete">
                              <FaCheck />
                              <span>Complete</span>
                            </div>
                          )}
                          {file.status === "error" && (
                            <div className="status-error flex items-center gap-2 text-red-500">
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
            {conciseSummary && (
              <div className="file-list mt-8">
                <h3 className="file-list-title">Document Summary</h3>
                <div className="file-list-container">
                  <div className="p-4">
                    <p className="text-gray-700 mb-4">{conciseSummary}</p>
                    <button
                      onClick={() => setShowDetailedSummary(true)}
                      className="process-button"
                    >
                      <FaEye />
                      <span>View Detailed Summary</span>
                    </button>
                  </div>
                </div>
              </div>
            )}
            {isModalOpen && questions && (
              <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                <div className="bg-white p-6 rounded-lg max-w-3xl w-full max-h-[80vh] overflow-y-auto questions-container">
                  <div className="flex justify-between items-center mb-4">
                    <h2 className="text-2xl font-bold text-gray-900">
                      Generated Questions
                    </h2>
                    <button
                      onClick={() => setIsModalOpen(false)}
                      className="text-gray-500 hover:text-gray-700"
                    >
                      <FaTimes />
                    </button>
                  </div>
                  {questions.quiz && (
                    <div className="mb-6">
                      <h3 className="text-xl font-semibold text-gray-900 mb-4">
                        Multiple Choice
                      </h3>
                      {questions.quiz.map((q, index) => (
                        <div key={index} className="question-item mb-4">
                          <p className="question-text font-medium">
                            {q.question}
                          </p>
                          <div className="space-y-2 mt-2">
                            {q.options.map((option, optIndex) => (
                              <label
                                key={optIndex}
                                className="flex items-center gap-2 text-gray-700"
                              >
                                <input
                                  type="radio"
                                  name={`quiz-${index}`}
                                  value={option}
                                  onChange={(e) =>
                                    handleAnswerChange(
                                      index,
                                      "quiz",
                                      e.target.value
                                    )
                                  }
                                  className="form-radio h-5 w-5 text-indigo-600"
                                />
                                <span>{option}</span>
                              </label>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                  {questions.shortAnswer && (
                    <div className="mb-6">
                      <h3 className="text-xl font-semibold text-gray-900 mb-4">
                        Short Answer
                      </h3>
                      {questions.shortAnswer.map((q, index) => (
                        <div key={index} className="question-item mb-4">
                          <p className="question-text font-medium">
                            {q.question}
                          </p>
                          <textarea
                            className="w-full p-3 border rounded-lg mt-2 text-gray-700 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                            rows="4"
                            onChange={(e) =>
                              handleAnswerChange(
                                index,
                                "shortAnswer",
                                e.target.value
                              )
                            }
                            placeholder="Type your answer here..."
                          />
                        </div>
                      ))}
                    </div>
                  )}
                  {questions.trueFalse && (
                    <div className="mb-6">
                      <h3 className="text-xl font-semibold text-gray-900 mb-4">
                        True/False
                      </h3>
                      {questions.trueFalse.map((q, index) => (
                        <div key={index} className="question-item mb-4">
                          <p className="question-text font-medium">
                            {q.question}
                          </p>
                          <div className="space-y-2 mt-2">
                            <label className="flex items-center gap-2 text-gray-700">
                              <input
                                type="radio"
                                name={`trueFalse-${index}`}
                                value="true"
                                onChange={() =>
                                  handleAnswerChange(index, "trueFalse", true)
                                }
                                className="form-radio h-5 w-5 text-indigo-600"
                              />
                              <span>True</span>
                            </label>
                            <label className="flex items-center gap-2 text-gray-700">
                              <input
                                type="radio"
                                name={`trueFalse-${index}`}
                                value="false"
                                onChange={() =>
                                  handleAnswerChange(index, "trueFalse", false)
                                }
                                className="form-radio h-5 w-5 text-indigo-600"
                              />
                              <span>False</span>
                            </label>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                  {questions.summary && (
                    <div className="mb-6">
                      <h3 className="text-xl font-semibold text-gray-900 mb-4">
                        Summary
                      </h3>
                      <p className="question-text font-medium">
                        {questions.summary.question}
                      </p>
                      <textarea
                        className="w-full p-3 border rounded-lg mt-2 text-gray-700 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        rows="6"
                        onChange={(e) =>
                          handleAnswerChange(0, "summary", e.target.value)
                        }
                        placeholder="Type your summary here..."
                      />
                    </div>
                  )}
                  <div className="flex justify-end gap-4">
                    <button
                      onClick={() => setIsModalOpen(false)}
                      className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300"
                    >
                      Cancel
                    </button>
                    <button onClick={submitAnswers} className="process-button">
                      Submit Answers
                    </button>
                  </div>
                </div>
              </div>
            )}
            {quizResult && (
              <div className="file-list mt-8">
                <h3 className="file-list-title">Quiz Results</h3>
                <div className="file-list-container">
                  <div className="p-4">
                    <p className="text-xl font-semibold text-gray-900 mb-4">
                      Score: {quizResult.score}/{quizResult.total} (
                      {quizResult.percentage}%)
                    </p>
                    <div className="space-y-6">
                      {quizResult.feedback.map((item, index) => (
                        <div key={index} className="question-item">
                          <p className="question-text font-medium">
                            {item.question}
                          </p>
                          <p className="text-sm text-gray-600">
                            Your Answer: {item.userAnswer || "Not answered"}
                          </p>
                          <p className="text-sm text-gray-600">
                            Correct Answer: {item.correctAnswer}
                          </p>
                          <p
                            className={`text-sm ${
                              item.isCorrect ? "text-green-500" : "text-red-500"
                            }`}
                          >
                            {item.isCorrect ? "Correct" : "Incorrect"}
                          </p>
                          <p className="text-sm text-gray-700 mt-1">
                            {item.explanation}
                          </p>
                        </div>
                      ))}
                    </div>
                    <h4 className="text-lg font-semibold text-gray-900 mt-6">
                      Suggestions for Improvement
                    </h4>
                    <ul className="list-disc pl-5 text-gray-700">
                      {quizResult.suggestions.map((suggestion, index) => (
                        <li key={index} className="mt-2">
                          {suggestion}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            )}
            {showDetailedSummary && (
              <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                <div className="bg-white p-6 rounded-lg max-w-3xl w-full max-h-[80vh] overflow-y-auto questions-container">
                  <div className="flex justify-between items-center mb-4">
                    <h2 className="text-2xl font-bold text-gray-900">
                      Detailed Summary
                    </h2>
                    <button
                      onClick={() => setShowDetailedSummary(false)}
                      className="text-gray-500 hover:text-gray-700"
                    >
                      <FaTimes />
                    </button>
                  </div>
                  <p className="text-gray-700">{detailedSummary}</p>
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
                  Advanced AI extracts key concepts and generates personalized
                  study materials from your uploads.
                </p>
              </div>
              <div className="feature-card animate-on-scroll">
                <div className="feature-icon">
                  <FaBook />
                </div>
                <h3 className="feature-title">Smart Summaries</h3>
                <p className="feature-description">
                  Get concise and detailed summaries, quizzes, and study aids
                  generated from your materials.
                </p>
              </div>
              <div className="feature-card animate-on-scroll">
                <div className="feature-icon">
                  <FaChartBar />
                </div>
                <h3 className="feature-title">Progress Tracking</h3>
                <p className="feature-description">
                  Monitor your learning progress with detailed analytics and
                  personalized recommendations.
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
