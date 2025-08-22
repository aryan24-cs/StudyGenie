import React, { useState } from 'react';
import '../style/LandingPage.css';
import { useNavigate } from 'react-router-dom';
import { FaGlobe, FaRobot, FaBook, FaQuestionCircle, FaPhone, FaEnvelope, FaChevronDown, FaStar } from 'react-icons/fa';

function LandingPage() {
  const navigate = useNavigate();
  const [currentTestimonial, setCurrentTestimonial] = useState(0);
  const [openFaq, setOpenFaq] = useState(null);

  const testimonials = [
    { name: 'Alice Johnson', text: 'StudyGenix transformed my learning experience with its AI tutor and custom quizzes!', rating: 5 },
    { name: 'Bob Smith', text: 'The multilingual support made it easy for me to study in my native language.', rating: 4 },
    { name: 'Clara Lee', text: 'Interactive tools and quizzes helped me ace my exams!', rating: 5 },
  ];

  const faqs = [
    { question: 'What is StudyGenix?', answer: 'StudyGenix is an AI-powered educational platform offering personalized learning, multilingual support, and quiz generation.' },
    { question: 'How do I create quizzes?', answer: 'Upload your study materials, and our AI will generate custom quizzes tailored to your content.' },
    { question: 'Is it available in multiple languages?', answer: 'Yes, StudyGenix supports multiple languages for a global learning experience.' },
  ];

  const handleSignUpClick = () => {
    navigate('/signup');
  };

  const handleContactSubmit = (e) => {
    e.preventDefault();
    alert('Contact form submitted!'); // Replace with actual API call
  };

  const nextTestimonial = () => {
    setCurrentTestimonial((prev) => (prev + 1) % testimonials.length);
  };

  const prevTestimonial = () => {
    setCurrentTestimonial((prev) => (prev - 1 + testimonials.length) % testimonials.length);
  };

  const toggleFaq = (index) => {
    setOpenFaq(openFaq === index ? null : index);
  };

  return (
    <div className="landing-main">
      {/* Navigation */}
      <nav className="landing-nav">
        <div className="nav-logo">StudyGenie</div>
        <ul className="nav-links">
          <li><a href="#features" className="nav-link">Features</a></li>
          <li><a href="#how-it-works" className="nav-link">How It Works</a></li>
          <li><a href="#why-useful" className="nav-link">Why StudyGenix</a></li>
          <li><a href="#testimonials" className="nav-link">Testimonials</a></li>
          <li><a href="#faq" className="nav-link">FAQ</a></li>
          <li><a href="#contact" className="nav-link">Contact</a></li>
          <li><button className="nav-btn pulse" onClick={handleSignUpClick}>Sign Up</button></li>
        </ul>
      </nav>

      {/* Hero Section */}
      <section className="hero-section">
        <div className="hero-content">
          <h1 className="hero-title slide-in">Unlock Your Learning Potential with StudyGenie</h1>
          <p className="hero-subtitle slide-in">Personalized AI-powered education with multilingual support, custom quizzes, and interactive tools.</p>
          <button className="hero-cta pulse" onClick={handleSignUpClick}>Get Started</button>
        </div>
        <FaChevronDown className="scroll-indicator" onClick={() => document.getElementById('features').scrollIntoView({ behavior: 'smooth' })} />
      </section>

      {/* Features Section */}
      <section id="features" className="features-section">
        <h2 className="section-title slide-in">Our Features</h2>
        <div className="features-grid">
          <div className="feature-card animate-on-scroll">
            <FaGlobe className="feature-icon" />
            <h3>Multilingual Support</h3>
            <p>Learn in your preferred language with seamless translation and localized content.</p>
          </div>
          <div className="feature-card animate-on-scroll">
            <FaRobot className="feature-icon" />
            <h3>AI Tutor</h3>
            <p>Get personalized guidance from an intelligent AI tutor, available 24/7.</p>
          </div>
          <div className="feature-card animate-on-scroll">
            <FaBook className="feature-icon" />
            <h3>Quiz Generation</h3>
            <p>Create custom quizzes from your study materials to test your knowledge.</p>
          </div>
          <div className="feature-card animate-on-scroll">
            <FaQuestionCircle className="feature-icon" />
            <h3>Interactive Learning</h3>
            <p>Engage with flashcards, practice questions, and interactive tools.</p>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section id="how-it-works" className="how-it-works-section">
        <h2 className="section-title slide-in">How It Works</h2>
        <div className="steps-grid">
          <div className="step-card animate-on-scroll">
            <span className="step-number">1</span>
            <h3>Sign Up</h3>
            <p>Create an account to access all features.</p>
          </div>
          <div className="step-card animate-on-scroll">
            <span className="step-number">2</span>
            <h3>Upload Materials</h3>
            <p>Upload your study materials to generate quizzes and notes.</p>
          </div>
          <div className="step-card animate-on-scroll">
            <span className="step-number">3</span>
            <h3>Learn & Practice</h3>
            <p>Use the AI tutor and take quizzes to master your subjects.</p>
          </div>
        </div>
      </section>

      {/* Why It's Useful Section */}
      <section id="why-useful" className="why-useful-section">
        <h2 className="section-title slide-in">Why Choose StudyGenix?</h2>
        <div className="why-useful-content">
          <p className="why-useful-text">
            StudyGenie is your ultimate learning companion, designed to make education accessible, engaging, and
            personalized. Our AI-driven platform adapts to your needs, offering tools to help you excel in any subject.
          </p>
          <ul className="why-useful-list">
            <li>Learn anytime, anywhere with a user-friendly interface.</li>
            <li>Supports multiple languages for global accessibility.</li>
            <li>AI-driven insights to identify and address your weak areas.</li>
            <li>Custom quizzes generated from your own study materials.</li>
          </ul>
        </div>
      </section>

      {/* Testimonials Section */}
      <section id="testimonials" className="testimonials-section">
        <h2 className="section-title slide-in">What Our Users Say</h2>
        <div className="testimonial-carousel">
          <button className="carousel-btn prev" onClick={prevTestimonial} aria-label="Previous testimonial">◄</button>
          <div className="testimonial-card">
            <p className="testimonial-text">"{testimonials[currentTestimonial].text}"</p>
            <div className="testimonial-rating">
              {Array(testimonials[currentTestimonial].rating).fill().map((_, i) => (
                <FaStar key={i} className="star-icon" />
              ))}
            </div>
            <p className="testimonial-name">{testimonials[currentTestimonial].name}</p>
          </div>
          <button className="carousel-btn next" onClick={nextTestimonial} aria-label="Next testimonial">►</button>
        </div>
      </section>

      {/* FAQ Section */}
      <section id="faq" className="faq-section">
        <h2 className="section-title slide-in">Frequently Asked Questions</h2>
        <div className="faq-list">
          {faqs.map((faq, index) => (
            <div key={index} className="faq-item">
              <button
                className="faq-question"
                onClick={() => toggleFaq(index)}
                aria-expanded={openFaq === index}
                aria-controls={`faq-answer-${index}`}
              >
                {faq.question}
                <span className="faq-toggle">{openFaq === index ? '−' : '+'}</span>
              </button>
              {openFaq === index && (
                <div id={`faq-answer-${index}`} className="faq-answer">{faq.answer}</div>
              )}
            </div>
          ))}
        </div>
      </section>

      {/* Contact Section */}
      <section id="contact" className="contact-section">
        <h2 className="section-title slide-in">Get in Touch</h2>
        <form className="contact-form" onSubmit={handleContactSubmit}>
          <div className="form-group">
            <label htmlFor="contact-name">Name</label>
            <input
              type="text"
              id="contact-name"
              className="contact-input"
              placeholder="Enter your name"
              required
            />
          </div>
          <div className="form-group">
            <label htmlFor="contact-email">Email</label>
            <input
              type="email"
              id="contact-email"
              className="contact-input"
              placeholder="Enter your email"
              required
            />
          </div>
          <div className="form-group">
            <label htmlFor="contact-message">Message</label>
            <textarea
              id="contact-message"
              className="contact-input"
              placeholder="Your message"
              rows="5"
              required
            ></textarea>
          </div>
          <button type="submit" className="contact-btn pulse">Send Message</button>
        </form>
      </section>

      {/* Footer Section */}
      <footer className="footer-section">
        <div className="footer-content">
          <div className="footer-column">
            <h3>StudyGenix</h3>
            <p>Empowering learning through AI and innovation.</p>
          </div>
          <div className="footer-column">
            <h3>Links</h3>
            <ul>
              <li><a href="#features">Features</a></li>
              <li><a href="#how-it-works">How It Works</a></li>
              <li><a href="#testimonials">Testimonials</a></li>
              <li><a href="#faq">FAQ</a></li>
              <li><a href="#contact">Contact</a></li>
            </ul>
          </div>
          <div className="footer-column">
            <h3>Contact</h3>
            <p><FaEnvelope /> support@studygenix.com</p>
            <p><FaPhone /> +1-800-STUDYGENIX</p>
          </div>
        </div>
        <p className="footer-copy">&copy; 2025 StudyGenix. All rights reserved.</p>
      </footer>
    </div>
  );
}

export default LandingPage;