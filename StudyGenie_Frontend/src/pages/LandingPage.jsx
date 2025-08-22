import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  FaBrain, FaGlobe, FaRobot, FaBook, FaQuestionCircle,
  FaMapMarkerAlt, FaEnvelope, FaPhoneAlt, FaComments,
  FaChevronRight, FaChevronDown, FaFacebookF, FaTwitter,
  FaLinkedinIn, FaInstagram, FaUsers, FaGraduationCap,
  FaCertificate, FaLightbulb, FaTrophy, FaCheck
} from 'react-icons/fa';

const LandingPage = () => {
  const [openAccordion, setOpenAccordion] = useState(null);
  const [particles, setParticles] = useState([]);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const navigate = useNavigate();

  // Initialize particles
  useEffect(() => {
    const particleCount = 50;
    const newParticles = Array.from({ length: particleCount }, (_, i) => ({
      id: i,
      x: Math.random() * window.innerWidth,
      y: Math.random() * window.innerHeight,
      size: Math.random() * 4 + 2,
      speedX: (Math.random() - 0.5) * 2,
      speedY: (Math.random() - 0.5) * 2,
      opacity: Math.random() * 0.5 + 0.2,
      color: `hsl(${220 + Math.random() * 40}, 70%, ${50 + Math.random() * 30}%)`,
    }));
    setParticles(newParticles);
  }, []);

  // Mouse tracking
  useEffect(() => {
    const handleMouseMove = (e) => {
      setMousePos({ x: e.clientX, y: e.clientY });
    };
    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  // Animate particles
  useEffect(() => {
    const animateParticles = () => {
      setParticles(prevParticles =>
        prevParticles.map(particle => {
          let newX = particle.x + particle.speedX;
          let newY = particle.y + particle.speedY;

          // Mouse interaction
          const dx = mousePos.x - newX;
          const dy = mousePos.y - newY;
          const distance = Math.sqrt(dx * dx + dy * dy);

          if (distance < 100) {
            const force = (100 - distance) / 100;
            newX -= (dx / distance) * force * 2;
            newY -= (dy / distance) * force * 2;
          }

          // Boundary collision
          if (newX <= 0 || newX >= window.innerWidth) particle.speedX *= -1;
          if (newY <= 0 || newY >= window.innerHeight) particle.speedY *= -1;

          newX = Math.max(0, Math.min(window.innerWidth, newX));
          newY = Math.max(0, Math.min(window.innerHeight, newY));

          return { ...particle, x: newX, y: newY };
        })
      );
    };

    const interval = setInterval(animateParticles, 50);
    return () => clearInterval(interval);
  }, [mousePos]);

  const toggleAccordion = (index) => {
    setOpenAccordion(openAccordion === index ? null : index);
  };

  const handleGetStartedClick = () => {
    navigate('/signup');
  };

  const features = [
    {
      icon: FaGlobe,
      title: "Multilingual Support",
      description: "Learn in your preferred language with seamless translation and localized content for global accessibility.",
    },
    {
      icon: FaRobot,
      title: "AI-Powered Tutor",
      description: "Get personalized guidance from an intelligent AI tutor available 24/7 to answer your questions.",
    },
    {
      icon: FaBook,
      title: "Smart Quiz Generation",
      description: "Create custom quizzes from your study materials using advanced AI to test your knowledge effectively.",
    },
    {
      icon: FaQuestionCircle,
      title: "Interactive Learning",
      description: "Engage with dynamic flashcards, practice questions, and interactive learning tools.",
    },
    {
      icon: FaUsers,
      title: "Collaborative Study",
      description: "Join study groups and collaborate with peers to enhance your learning experience.",
    },
    {
      icon: FaTrophy,
      title: "Progress Analytics",
      description: "Track your learning progress with detailed analytics and performance insights.",
    },
  ];

  const roadmapItems = [
    {
      number: 1,
      title: "Sign Up & Setup",
      description: "Create your account and set up your personalized learning profile in minutes.",
      icon: FaUsers,
    },
    {
      number: 2,
      title: "Upload Materials",
      description: "Upload your study materials and let AI analyze and organize your content.",
      icon: FaBook,
    },
    {
      number: 3,
      title: "Learn & Practice",
      description: "Use AI tutoring, take adaptive quizzes, and practice with interactive tools.",
      icon: FaGraduationCap,
    },
    {
      number: 4,
      title: "Track & Excel",
      description: "Monitor your progress and achieve your academic goals with data-driven insights.",
      icon: FaTrophy,
    },
  ];

  const faqs = [
    {
      question: "What is StudyGenix and how does it work?",
      answer: "StudyGenix is an AI-powered educational platform that provides personalized learning experiences. It uses advanced machine learning to create custom quizzes, provide tutoring, and adapt to your learning style for maximum effectiveness.",
    },
    {
      question: "How do I create quizzes from my study materials?",
      answer: "Simply upload your study materials (PDFs, documents, notes) and our AI will automatically analyze the content and generate relevant quizzes. You can customize difficulty levels and question types to match your needs.",
    },
    {
      question: "Is StudyGenix available in multiple languages?",
      answer: "Yes! StudyGenix supports over 50 languages with real-time translation capabilities. You can learn in your native language or practice in a foreign language with seamless multilingual support.",
    },
    {
      question: "Can I track my learning progress and performance?",
      answer: "Absolutely! StudyGenix provides comprehensive analytics including progress tracking, performance metrics, strength/weakness analysis, and personalized recommendations to improve your learning outcomes.",
    },
    {
      question: "Is there a free trial or free version available?",
      answer: "Yes, we offer a generous free tier that includes basic features like quiz generation and AI tutoring. You can upgrade to premium plans for advanced features like detailed analytics and unlimited content uploads.",
    },
  ];

  const testimonials = [
    {
      name: "Sarah Chen",
      role: "Medical Student",
      content: "StudyGenix transformed my study routine. The AI-generated quizzes are incredibly accurate and helped me ace my medical exams!",
      rating: 5,
    },
    {
      name: "Marcus Rodriguez",
      role: "Engineering Student",
      content: "The multilingual support is amazing. I can study complex engineering concepts in both English and Spanish seamlessly.",
      rating: 5,
    },
    {
      name: "Emma Thompson",
      role: "High School Student",
      content: "The progress tracking keeps me motivated. I can see exactly where I'm improving and what needs more work.",
      rating: 5,
    },
  ];

  return (
    <div className="landing-page">
      {/* Animated Background */}
      <div className="particle-background">
        <svg className="particles-svg">
          {particles.map(particle => (
            <circle
              key={particle.id}
              cx={particle.x}
              cy={particle.y}
              r={particle.size}
              fill={particle.color}
              opacity={particle.opacity}
              className="particle"
            />
          ))}
          {particles.map((particle, i) =>
            particles.slice(i + 1).map((otherParticle, j) => {
              const dx = particle.x - otherParticle.x;
              const dy = particle.y - otherParticle.y;
              const distance = Math.sqrt(dx * dx + dy * dy);
              if (distance < 150) {
                return (
                  <line
                    key={`${i}-${j}`}
                    x1={particle.x}
                    y1={particle.y}
                    x2={otherParticle.x}
                    y2={otherParticle.y}
                    stroke="rgba(30, 58, 138, 0.2)"
                    strokeWidth="1"
                    opacity={1 - distance / 150}
                  />
                );
              }
              return null;
            })
          )}
        </svg>
      </div>

      {/* Navigation */}
      <nav className="navbar">
        <div className="nav-container">
          <div className="nav-brand">
            <FaBrain className="brand-icon" />
            <span>StudyGenix</span>
          </div>
          <div className="nav-links">
            <a href="#home">Home</a>
            <a href="#features">Features</a>
            <a href="#roadmap">How It Works</a>
            <a href="#testimonials">Reviews</a>
            <a href="#faq">FAQ</a>
            <a href="#contact">Contact</a>
          </div>
          <button className="cta-nav-btn">Start Free Trial</button>
        </div>
      </nav>

      {/* Hero Section */}
      <section id="home" className="hero">
        <div className="hero-container">
          <div className="hero-content">
            <div className="hero-badge">
              <FaLightbulb className="badge-icon" />
              <span>AI-Powered Learning Revolution</span>
            </div>
            <h1 className="hero-title">
              Unlock Your Learning Potential with
              <span className="gradient-text"> StudyGenix</span>
            </h1>
            <p className="hero-description">
              Transform your study experience with intelligent AI tutoring, personalized quizzes,
              and multilingual support. Join thousands of students already excelling with StudyGenix.
            </p>
            <div className="hero-stats">
              <div className="stat">
                <span className="stat-number">50K+</span>
                <span className="stat-label">Active Learners</span>
              </div>
              <div className="stat">
                <span className="stat-number">1M+</span>
                <span className="stat-label">Quizzes Generated</span>
              </div>
              <div className="stat">
                <span className="stat-number">95%</span>
                <span className="stat-label">Success Rate</span>
              </div>
            </div>
            <div className="hero-actions">
              <button className="primary-btn">
                Start Learning Now
                <FaChevronRight className="btn-icon" />
              </button>
              <button className="secondary-btn">
                Watch Demo
                <FaChevronDown className="btn-icon" />
              </button>
            </div>
          </div>
          <div className="hero-visual">
            <div className="floating-card card-1">
              <FaRobot className="card-icon" />
              <span>AI Tutor Active</span>
            </div>
            <div className="floating-card card-2">
              <FaBook className="card-icon" />
              <span>Quiz Generated</span>
            </div>
            <div className="floating-card card-3">
              <FaTrophy className="card-icon" />
              <span>Goal Achieved!</span>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="features">
        <div className="container">
          <div className="section-header">
            <h2 className="section-title">Powerful Features for Modern Learning</h2>
            <p className="section-subtitle">
              Discover intelligent tools designed to accelerate your academic success
            </p>
          </div>
          <div className="features-grid">
            {features.map((feature, index) => {
              const Icon = feature.icon;
              return (
                <div key={index} className="feature-card">
                  <div className="feature-icon">
                    <Icon />
                  </div>
                  <h3>{feature.title}</h3>
                  <p>{feature.description}</p>
                  <button className="feature-btn">
                    Learn More <FaChevronRight />
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section id="roadmap" className="roadmap">
        <div className="container">
          <div className="section-header">
            <h2 className="section-title">How StudyGenix Works</h2>
            <p className="section-subtitle">
              Get started in 4 simple steps and transform your learning experience
            </p>
          </div>
          <div className="roadmap-grid">
            {roadmapItems.map((item, index) => {
              const Icon = item.icon;
              return (
                <div key={index} className="roadmap-card">
                  <div className="roadmap-number">{item.number}</div>
                  <div className="roadmap-icon">
                    <Icon />
                  </div>
                  <h3>{item.title}</h3>
                  <p>{item.description}</p>
                  {index < roadmapItems.length - 1 && (
                    <div className="roadmap-arrow">
                      <FaChevronRight />
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section id="testimonials" className="testimonials">
        <div className="container">
          <div className="section-header">
            <h2 className="section-title">What Students Say</h2>
            <p className="section-subtitle">
              Join thousands of successful learners who trust StudyGenix
            </p>
          </div>
          <div className="testimonials-grid">
            {testimonials.map((testimonial, index) => (
              <div key={index} className="testimonial-card">
                <div className="stars">
                  {Array.from({ length: testimonial.rating }, (_, i) => (
                    <span key={i} className="star">★</span>
                  ))}
                </div>
                <p className="testimonial-content">"{testimonial.content}"</p>
                <div className="testimonial-author">
                  <strong>{testimonial.name}</strong>
                  <span>{testimonial.role}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section id="faq" className="faq">
        <div className="container">
          <div className="section-header">
            <h2 className="section-title">Frequently Asked Questions</h2>
            <p className="section-subtitle">
              Everything you need to know about StudyGenix
            </p>
          </div>
          <div className="faq-container">
            {faqs.map((faq, index) => (
              <div
                key={index}
                className={`faq-item ${openAccordion === index ? 'active' : ''}`}
              >
                <div
                  className="faq-header"
                  onClick={() => toggleAccordion(index)}
                >
                  <h3>{faq.question}</h3>
                  <div className="faq-icon">
                    <FaChevronDown />
                  </div>
                </div>
                <div className="faq-content">
                  <p>{faq.answer}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section id="contact" className="contact">
        <div className="container">
          <div className="section-header">
            <h2 className="section-title">Ready to Transform Your Learning?</h2>
            <p className="section-subtitle">
              Get started today or reach out to learn more about StudyGenix
            </p>
          </div>
          <div className="contact-grid">
            <div className="contact-info">
              <div className="contact-item">
                <div className="contact-icon">
                  <FaMapMarkerAlt />
                </div>
                <div>
                  <h4>Visit Us</h4>
                  <p>123 Innovation Drive<br />San Francisco, CA 94107</p>
                </div>
              </div>
              <div className="contact-item">
                <div className="contact-icon">
                  <FaEnvelope />
                </div>
                <div>
                  <h4>Email Support</h4>
                  <p>support@studygenix.com<br />Available 24/7</p>
                </div>
              </div>
              <div className="contact-item">
                <div className="contact-icon">
                  <FaPhoneAlt />
                </div>
                <div>
                  <h4>Call Us</h4>
                  <p>+1 (415) 555-2671<br />Mon-Fri: 9AM-6PM PST</p>
                </div>
              </div>
            </div>
            <div className="cta-section">
              <div className="cta-content">
                <h3>Start Your Free Trial</h3>
                <p>Join over 50,000 students already using StudyGenix to excel in their studies.</p>
                <div className="cta-features">
                  <div className="cta-feature">
                    <FaCheck className="check-icon" />
                    <span>No credit card required</span>
                  </div>
                  <div className="cta-feature">
                    <FaCheck className="check-icon" />
                    <span>Full access to AI tutor</span>
                  </div>
                  <div className="cta-feature">
                    <FaCheck className="check-icon" />
                    <span>Unlimited quiz generation</span>
                  </div>
                </div>
                <button className="cta-button" onClick={handleGetStartedClick}>
                  Get Started Free
                  <FaChevronRight className="btn-icon" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="footer">
        <div className="container">
          <div className="footer-grid">
            <div className="footer-brand">
              <div className="footer-logo">
                <FaBrain />
                <span>StudyGenix</span>
              </div>
              <p>Empowering students worldwide with AI-powered learning solutions.</p>
              <div className="social-links">
                <a href="#"><FaFacebookF /></a>
                <a href="#"><FaTwitter /></a>
                <a href="#"><FaLinkedinIn /></a>
                <a href="#"><FaInstagram /></a>
              </div>
            </div>
            <div className="footer-section">
              <h4>Product</h4>
              <ul>
                <li><a href="#">Features</a></li>
                <li><a href="#">Pricing</a></li>
                <li><a href="#">AI Tutor</a></li>
                <li><a href="#">Quiz Generator</a></li>
              </ul>
            </div>
            <div className="footer-section">
              <h4>Resources</h4>
              <ul>
                <li><a href="#">Blog</a></li>
                <li><a href="#">Help Center</a></li>
                <li><a href="#">Study Guides</a></li>
                <li><a href="#">Success Stories</a></li>
              </ul>
            </div>
            <div className="footer-section">
              <h4>Company</h4>
              <ul>
                <li><a href="#">About Us</a></li>
                <li><a href="#">Careers</a></li>
                <li><a href="#">Privacy Policy</a></li>
                <li><a href="#">Terms of Service</a></li>
              </ul>
            </div>
          </div>
          <div className="footer-bottom">
            <p>&copy; 2025 StudyGenix. All rights reserved.</p>
          </div>
        </div>
      </footer>

      <style jsx>{`
        * {
          margin: 0;
          padding: 0;
          box-sizing: border-box;
        }

        body {
          font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
          line-height: 1.6;
          color: #1e3a8a;
          overflow-x: hidden;
        }

        .landing-page {
          background: #ffffff;
          position: relative;
          min-height: 100vh;
        }

        .particle-background {
          position: fixed;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          z-index: -1;
          pointer-events: none;
        }

        .particles-svg {
          width: 100%;
          height: 100%;
        }

        .particle {
          transition: all 0.3s ease;
        }

        /* Navigation */
        .navbar {
          position: fixed;
          top: 0;
          width: 100%;
          background: rgba(255, 255, 255, 0.95);
          backdrop-filter: blur(20px);
          border-bottom: 1px solid rgba(30, 58, 138, 0.1);
          z-index: 1000;
          padding: 1rem 0;
          transition: all 0.3s ease;
        }

        .nav-container {
          max-width: 1200px;
          margin: 0 auto;
          padding: 0 2rem;
          display: flex;
          justify-content: space-between;
          align-items: center;
        }

        .nav-brand {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          font-size: 1.5rem;
          font-weight: bold;
          color: #1e3a8a;
        }

        .brand-icon {
          color: #3b82f6;
        }

        .nav-links {
          display: flex;
          gap: 2rem;
        }

        .nav-links a {
          text-decoration: none;
          color: #1e3a8a;
          font-weight: 500;
          transition: all 0.3s ease;
          position: relative;
        }

        .nav-links a:hover {
          color: #3b82f6;
        }

        .nav-links a::after {
          content: '';
          position: absolute;
          bottom: -5px;
          left: 0;
          width: 0;
          height: 2px;
          background: #3b82f6;
          transition: width 0.3s ease;
        }

        .nav-links a:hover::after {
          width: 100%;
        }

        .cta-nav-btn {
          background: linear-gradient(135deg, #3b82f6, #1e40af);
          color: white;
          border: none;
          padding: 0.75rem 1.5rem;
          border-radius: 50px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.3s ease;
          box-shadow: 0 4px 15px rgba(59, 130, 246, 0.3);
        }

        .cta-nav-btn:hover {
          transform: translateY(-2px);
          box-shadow: 0 8px 25px rgba(59, 130, 246, 0.4);
        }

        /* Container */
        .container {
          max-width: 1200px;
          margin: 0 auto;
          padding: 0 2rem;
        }

        /* Hero Section */
        .hero {
          padding: 120px 0 80px;
          min-height: 100vh;
          display: flex;
          align-items: center;
        }

        .hero-container {
          max-width: 1200px;
          margin: 0 auto;
          padding: 0 2rem;
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 4rem;
          align-items: center;
        }

        .hero-badge {
          display: inline-flex;
          align-items: center;
          gap: 0.5rem;
          background: linear-gradient(135deg, rgba(59, 130, 246, 0.1), rgba(30, 64, 175, 0.1));
          color: #1e40af;
          padding: 0.5rem 1rem;
          border-radius: 50px;
          font-size: 0.9rem;
          font-weight: 600;
          margin-bottom: 1.5rem;
          border: 1px solid rgba(59, 130, 246, 0.2);
        }

        .hero-title {
          font-size: 3.5rem;
          font-weight: 800;
          line-height: 1.1;
          margin-bottom: 1.5rem;
          color: #1e3a8a;
        }

        .gradient-text {
          background: linear-gradient(135deg, #3b82f6, #1e40af);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }

        .hero-description {
          font-size: 1.25rem;
          color: #64748b;
          margin-bottom: 2rem;
          line-height: 1.6;
        }

        .hero-stats {
          display: flex;
          gap: 2rem;
          margin-bottom: 2.5rem;
        }

        .stat {
          display: flex;
          flex-direction: column;
          align-items: center;
          text-align: center;
        }

        .stat-number {
          font-size: 2rem;
          font-weight: 800;
          color: #1e40af;
          line-height: 1;
        }

        .stat-label {
          font-size: 0.9rem;
          color: #64748b;
          font-weight: 500;
        }

        .hero-actions {
          display: flex;
          gap: 1rem;
          align-items: center;
        }

        .primary-btn {
          background: linear-gradient(135deg, #3b82f6, #1e40af);
          color: white;
          border: none;
          padding: 1rem 2rem;
          border-radius: 50px;
          font-size: 1.1rem;
          font-weight: 600;
          cursor: pointer;
          display: flex;
          align-items: center;
          gap: 0.5rem;
          transition: all 0.3s ease;
          box-shadow: 0 4px 20px rgba(59, 130, 246, 0.3);
        }

        .primary-btn:hover {
          transform: translateY(-3px);
          box-shadow: 0 8px 30px rgba(59, 130, 246, 0.4);
        }

        .secondary-btn {
          background: transparent;
          color: #1e40af;
          border: 2px solid #e2e8f0;
          padding: 1rem 2rem;
          border-radius: 50px;
          font-size: 1.1rem;
          font-weight: 600;
          cursor: pointer;
          display: flex;
          align-items: center;
          gap: 0.5rem;
          transition: all 0.3s ease;
        }

        .secondary-btn:hover {
          border-color: #3b82f6;
          background: rgba(59, 130, 246, 0.05);
        }

        .hero-visual {
          position: relative;
          height: 500px;
        }

        .floating-card {
          position: absolute;
          background: white;
          padding: 1rem 1.5rem;
          border-radius: 15px;
          display: flex;
          align-items: center;
          gap: 0.75rem;
          box-shadow: 0 10px 30px rgba(0, 0, 0, 0.1);
          border: 1px solid rgba(59, 130, 246, 0.1);
          animation: float 3s ease-in-out infinite;
        }

        .card-1 {
          top: 50px;
          left: 50px;
          animation-delay: 0s;
        }

        .card-2 {
          top: 200px;
          right: 30px;
          animation-delay: 1s;
        }

        .card-3 {
          bottom: 100px;
          left: 20px;
          animation-delay: 2s;
        }

        .card-icon {
          color: #3b82f6;
          font-size: 1.5rem;
        }

        @keyframes float {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-20px); }
        }

        /* Section Headers */
        .section-header {
          text-align: center;
          margin-bottom: 4rem;
        }

        .section-title {
          font-size: 2.5rem;
          font-weight: 700;
          color: #1e3a8a;
          margin-bottom: 1rem;
        }

        .section-subtitle {
          font-size: 1.25rem;
          color: #64748b;
          max-width: 600px;
          margin: 0 auto;
        }

        /* Features Section */
        .features {
          padding: 80px 0;
          background: linear-gradient(135deg, rgba(248, 250, 252, 0.8), rgba(241, 245, 249, 0.8));
        }

        .features-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(350px, 1fr));
          gap: 2rem;
        }

        .feature-card {
          background: white;
          padding: 2.5rem;
          border-radius: 20px;
          text-align: center;
          transition: all 0.3s ease;
          border: 1px solid rgba(59, 130, 246, 0.1);
          box-shadow: 0 4px 20px rgba(0, 0, 0, 0.05);
        }

        .feature-card:hover {
          transform: translateY(-10px);
          box-shadow: 0 20px 40px rgba(0, 0, 0, 0.15);
          border-color: rgba(59, 130, 246, 0.3);
        }

        .feature-icon {
          width: 80px;
          height: 80px;
          background: linear-gradient(135deg, #3b82f6, #1e40af);
          border-radius: 20px;
          display: flex;
          align-items: center;
          justify-content: center;
          margin: 0 auto 1.5rem;
          color: white;
          font-size: 2rem;
        }

        .feature-card h3 {
          font-size: 1.5rem;
          font-weight: 700;
          color: #1e3a8a;
          margin-bottom: 1rem;
        }

        .feature-card p {
          color: #64748b;
          margin-bottom: 1.5rem;
          line-height: 1.6;
        }

        .feature-btn {
          background: transparent;
          color: #3b82f6;
          border: 2px solid #3b82f6;
          padding: 0.75rem 1.5rem;
          border-radius: 50px;
          font-weight: 600;
          cursor: pointer;
          display: inline-flex;
          align-items: center;
          gap: 0.5rem;
          transition: all 0.3s ease;
        }

        .feature-btn:hover {
          background: #3b82f6;
          color: white;
          transform: translateY(-2px);
        }

        /* Roadmap Section */
        .roadmap {
          padding: 80px 0;
          background: white;
        }

        .roadmap-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
          gap: 2rem;
          position: relative;
        }

        .roadmap-card {
          background: linear-gradient(135deg, rgba(248, 250, 252, 0.8), rgba(241, 245, 249, 0.8));
          padding: 2.5rem;
          border-radius: 20px;
          text-align: center;
          position: relative;
          transition: all 0.3s ease;
          border: 1px solid rgba(59, 130, 246, 0.1);
        }

        .roadmap-card:hover {
          transform: translateY(-10px);
          box-shadow: 0 20px 40px rgba(0, 0, 0, 0.1);
        }

        .roadmap-number {
          position: absolute;
          top: -20px;
          left: 50%;
          transform: translateX(-50%);
          width: 40px;
          height: 40px;
          background: linear-gradient(135deg, #3b82f6, #1e40af);
          color: white;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          font-weight: 700;
          font-size: 1.2rem;
        }

        .roadmap-icon {
          width: 70px;
          height: 70px;
          background: rgba(59, 130, 246, 0.1);
          border-radius: 15px;
          display: flex;
          align-items: center;
          justify-content: center;
          margin: 1rem auto 1.5rem;
          color: #3b82f6;
          font-size: 1.8rem;
        }

        .roadmap-card h3 {
          font-size: 1.5rem;
          font-weight: 700;
          color: #1e3a8a;
          margin-bottom: 1rem;
        }

        .roadmap-card p {
          color: #64748b;
          line-height: 1.6;
        }

        .roadmap-arrow {
          display: none;
          position: absolute;
          right: -30px;
          top: 50%;
          transform: translateY(-50%);
          color: #3b82f6;
          font-size: 1.5rem;
        }

        /* Testimonials Section */
        .testimonials {
          padding: 80px 0;
          background: linear-gradient(135deg, rgba(248, 250, 252, 0.8), rgba(241, 245, 249, 0.8));
        }

        .testimonials-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(350px, 1fr));
          gap: 2rem;
        }

        .testimonial-card {
          background: white;
          padding: 2.5rem;
          border-radius: 20px;
          border: 1px solid rgba(59, 130, 246, 0.1);
          box-shadow: 0 4px 20px rgba(0, 0, 0, 0.05);
          transition: all 0.3s ease;
        }

        .testimonial-card:hover {
          transform: translateY(-5px);
          box-shadow: 0 15px 35px rgba(0, 0, 0, 0.1);
        }

        .stars {
          color: #fbbf24;
          font-size: 1.2rem;
          margin-bottom: 1rem;
        }

        .testimonial-content {
          color: #64748b;
          font-style: italic;
          margin-bottom: 1.5rem;
          line-height: 1.6;
        }

        .testimonial-author strong {
          color: #1e3a8a;
          display: block;
          margin-bottom: 0.25rem;
        }

        .testimonial-author span {
          color: #64748b;
          font-size: 0.9rem;
        }

        /* FAQ Section */
        .faq {
          padding: 80px 0;
          background: white;
        }

        .faq-container {
          max-width: 800px;
          margin: 0 auto;
        }

        .faq-item {
          background: white;
          border: 1px solid rgba(59, 130, 246, 0.1);
          border-radius: 15px;
          margin-bottom: 1rem;
          overflow: hidden;
          transition: all 0.3s ease;
        }

        .faq-item:hover {
          border-color: rgba(59, 130, 246, 0.3);
          box-shadow: 0 5px 20px rgba(0, 0, 0, 0.05);
        }

        .faq-header {
          padding: 1.5rem 2rem;
          cursor: pointer;
          display: flex;
          justify-content: space-between;
          align-items: center;
          background: rgba(248, 250, 252, 0.5);
          transition: all 0.3s ease;
        }

        .faq-header:hover {
          background: rgba(59, 130, 246, 0.05);
        }

        .faq-header h3 {
          color: #1e3a8a;
          font-weight: 600;
          margin: 0;
        }

        .faq-icon {
          color: #3b82f6;
          transition: transform 0.3s ease;
        }

        .faq-item.active .faq-icon {
          transform: rotate(180deg);
        }

        .faq-content {
          max-height: 0;
          overflow: hidden;
          transition: all 0.3s ease;
        }

        .faq-item.active .faq-content {
          max-height: 200px;
        }

        .faq-content p {
          padding: 0 2rem 2rem;
          color: #64748b;
          line-height: 1.6;
          margin: 0;
        }

        /* Contact Section */
        .contact {
          padding: 80px 0;
          background: linear-gradient(135deg, rgba(248, 250, 252, 0.8), rgba(241, 245, 249, 0.8));
        }

        .contact-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 4rem;
          align-items: center;
        }

        .contact-info {
          display: flex;
          flex-direction: column;
          gap: 2rem;
        }

        .contact-item {
          display: flex;
          align-items: center;
          gap: 1.5rem;
          background: white;
          padding: 1.5rem;
          border-radius: 15px;
          border: 1px solid rgba(59, 130, 246, 0.1);
          transition: all 0.3s ease;
        }

        .contact-item:hover {
          transform: translateX(10px);
          box-shadow: 0 10px 30px rgba(0, 0, 0, 0.1);
        }

        .contact-icon {
          width: 60px;
          height: 60px;
          background: linear-gradient(135deg, #3b82f6, #1e40af);
          color: white;
          border-radius: 15px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 1.5rem;
          flex-shrink: 0;
        }

        .contact-item h4 {
          color: #1e3a8a;
          margin-bottom: 0.5rem;
        }

        .contact-item p {
          color: #64748b;
          margin: 0;
        }

        .cta-section {
          background: white;
          padding: 3rem;
          border-radius: 20px;
          border: 1px solid rgba(59, 130, 246, 0.1);
          box-shadow: 0 10px 40px rgba(0, 0, 0, 0.05);
          text-align: center;
        }

        .cta-content h3 {
          font-size: 2rem;
          color: #1e3a8a;
          margin-bottom: 1rem;
        }

        .cta-content p {
          color: #64748b;
          margin-bottom: 2rem;
          line-height: 1.6;
        }

        .cta-features {
          display: flex;
          flex-direction: column;
          gap: 1rem;
          margin-bottom: 2rem;
          text-align: left;
        }

        .cta-feature {
          display: flex;
          align-items: center;
          gap: 0.75rem;
        }

        .check-icon {
          color: #10b981;
          font-size: 1.2rem;
        }

        .cta-feature span {
          color: #64748b;
        }

        .cta-button {
          background: linear-gradient(135deg, #3b82f6, #1e40af);
          color: white;
          border: none;
          padding: 1.25rem 3rem;
          border-radius: 50px;
          font-size: 1.2rem;
          font-weight: 600;
          cursor: pointer;
          display: inline-flex;
          align-items: center;
          gap: 0.75rem;
          transition: all 0.3s ease;
          box-shadow: 0 4px 20px rgba(59, 130, 246, 0.3);
        }

        .cta-button:hover {
          transform: translateY(-3px);
          box-shadow: 0 8px 30px rgba(59, 130, 246, 0.4);
        }

        /* Footer */
        .footer {
          background: #1e3a8a;
          color: white;
          padding: 60px 0 20px;
        }

        .footer-grid {
          display: grid;
          grid-template-columns: 2fr 1fr 1fr 1fr;
          gap: 3rem;
          margin-bottom: 3rem;
        }

        .footer-logo {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          font-size: 1.5rem;
          font-weight: 700;
          margin-bottom: 1rem;
        }

        .footer-brand p {
          color: rgba(255, 255, 255, 0.8);
          margin-bottom: 2rem;
          line-height: 1.6;
        }

        .social-links {
          display: flex;
          gap: 1rem;
        }

        .social-links a {
          width: 40px;
          height: 40px;
          background: rgba(255, 255, 255, 0.1);
          color: white;
          border-radius: 10px;
          display: flex;
          align-items: center;
          justify-content: center;
          text-decoration: none;
          transition: all 0.3s ease;
        }

        .social-links a:hover {
          background: #3b82f6;
          transform: translateY(-3px);
        }

        .footer-section h4 {
          margin-bottom: 1.5rem;
          font-size: 1.2rem;
        }

        .footer-section ul {
          list-style: none;
        }

        .footer-section li {
          margin-bottom: 0.75rem;
        }

        .footer-section a {
          color: rgba(255, 255, 255, 0.8);
          text-decoration: none;
          transition: all 0.3s ease;
        }

        .footer-section a:hover {
          color: white;
          padding-left: 5px;
        }

        .footer-bottom {
          border-top: 1px solid rgba(255, 255, 255, 0.1);
          padding-top: 2rem;
          text-align: center;
          color: rgba(255, 255, 255, 0.6);
        }

        /* Responsive Design */
        @media (max-width: 1024px) {
          .hero-container {
            grid-template-columns: 1fr;
            gap: 2rem;
            text-align: center;
          }

          .hero-visual {
            order: -1;
            height: 300px;
          }

          .contact-grid {
            grid-template-columns: 1fr;
            gap: 2rem;
          }

          .footer-grid {
            grid-template-columns: repeat(2, 1fr);
            gap: 2rem;
          }

          .roadmap-grid {
            grid-template-columns: 1fr;
          }
        }

        @media (max-width: 768px) {
          .nav-container {
            padding: 0 1rem;
          }

          .nav-links {
            display: none;
          }

          .container {
            padding: 0 1rem;
          }

          .hero {
            padding: 100px 0 60px;
          }

          .hero-title {
            font-size: 2.5rem;
          }

          .hero-stats {
            justify-content: center;
          }

          .hero-actions {
            flex-direction: column;
            align-items: stretch;
            gap: 1rem;
          }

          .section-title {
            font-size: 2rem;
          }

          .features-grid,
          .testimonials-grid {
            grid-template-columns: 1fr;
          }

          .footer-grid {
            grid-template-columns: 1fr;
            text-align: center;
          }

          .cta-features {
            text-align: center;
          }
        }

        @media (max-width: 480px) {
          .hero-title {
            font-size: 2rem;
          }

          .hero-description {
            font-size: 1.1rem;
          }

          .feature-card,
          .testimonial-card,
          .roadmap-card {
            padding: 1.5rem;
          }

          .cta-section {
            padding: 2rem 1.5rem;
          }
        }

        /* Animation Enhancements */
        @keyframes slideInUp {
          from {
            opacity: 0;
            transform: translateY(30px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes slideInLeft {
          from {
            opacity: 0;
            transform: translateX(-30px);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }

        @keyframes slideInRight {
          from {
            opacity: 0;
            transform: translateX(30px);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }

        .hero-content {
          animation: slideInLeft 1s ease-out;
        }

        .hero-visual {
          animation: slideInRight 1s ease-out 0.3s both;
        }

        .feature-card:nth-child(odd) {
          animation: slideInLeft 0.8s ease-out;
        }

        .feature-card:nth-child(even) {
          animation: slideInRight 0.8s ease-out;
        }

        .roadmap-card {
          animation: slideInUp 0.8s ease-out;
        }

        .testimonial-card {
          animation: slideInUp 0.8s ease-out;
        }

        .faq-item {
          animation: slideInUp 0.6s ease-out;
        }
      `}</style>
    </div>
  );
};

export default LandingPage;