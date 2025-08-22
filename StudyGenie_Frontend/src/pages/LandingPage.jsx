import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  FaBrain,
  FaGlobe,
  FaRobot,
  FaBook,
  FaQuestionCircle,
  FaMapMarkerAlt,
  FaEnvelope,
  FaPhoneAlt,
  FaComments,
  FaChevronRight,
  FaChevronDown,
  FaFacebookF,
  FaTwitter,
  FaLinkedinIn,
  FaInstagram,
} from "react-icons/fa";
import Navbar from "../components/Navbar";
import "../style/LandingPage.css";
import AOS from "aos";
import "aos/dist/aos.css";
import Particles from "react-tsparticles";
import { tsParticles } from "tsparticles-engine";

const LandingPage = () => {
  const navigate = useNavigate();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [openAccordion, setOpenAccordion] = useState(null);

  // Initialize AOS
  useEffect(() => {
    AOS.init({
      duration: 800,
      easing: "ease-in-out",
      once: true,
      offset: 100,
    });

    // Header scroll effect
    const handleScroll = () => {
      const header = document.getElementById("header");
      if (window.scrollY > 100) {
        header.classList.add("scrolled");
      } else {
        header.classList.remove("scrolled");
      }
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Particles initialization for tsparticles v3.x
  const particlesInit = async () => {
    // Load tsparticles with all features
    await tsParticles.load({
      id: "particles-js",
      options: {
        particles: {
          number: { value: 80, density: { enable: true, value_area: 800 } },
          color: { value: "#9b59b6" },
          shape: {
            type: "circle",
            stroke: { width: 0, color: "#000000" },
            polygon: { nb_sides: 5 },
          },
          opacity: {
            value: 0.5,
            random: false,
            anim: { enable: false, speed: 1, opacity_min: 0.1, sync: false },
          },
          size: {
            value: 3,
            random: true,
            anim: { enable: false, speed: 40, size_min: 0.1, sync: false },
          },
          line_linked: {
            enable: true,
            distance: 150,
            color: "#9b59b6",
            opacity: 0.4,
            width: 1,
          },
          move: {
            enable: true,
            speed: 3,
            direction: "none",
            random: false,
            straight: false,
            out_mode: "out",
            bounce: false,
            attract: { enable: false, rotateX: 600, rotateY: 1200 },
          },
        },
        interactivity: {
          detect_on: "canvas",
          events: {
            onHover: { enable: true, mode: "grab" },
            onClick: { enable: true, mode: "push" },
            resize: true,
          },
          modes: {
            grab: { distance: 140, line_linked: { opacity: 1 } },
            bubble: {
              distance: 400,
              size: 40,
              duration: 2,
              opacity: 8,
              speed: 3,
            },
            repulse: { distance: 200, duration: 0.4 },
            push: { particles_nb: 4 },
            remove: { particles_nb: 2 },
          },
        },
        retina_detect: true,
      },
    });
  };

  const particlesLoaded = (container) => {
    console.log("Particles loaded:", container); // Optional: Log to confirm particles loaded
  };

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const toggleAccordion = (index) => {
    setOpenAccordion(openAccordion === index ? null : index);
  };

  const handleContactSubmit = (e) => {
    e.preventDefault();
    alert("Contact form submitted!"); // Replace with actual API call
  };

  const features = [
    {
      icon: FaGlobe,
      title: "Multilingual Support",
      description:
        "Learn in your preferred language with seamless translation and localized content.",
      link: "#",
    },
    {
      icon: FaRobot,
      title: "AI Tutor",
      description:
        "Get personalized guidance from an intelligent AI tutor, available 24/7.",
      link: "#",
    },
    {
      icon: FaBook,
      title: "Quiz Generation",
      description:
        "Create custom quizzes from your study materials to test your knowledge.",
      link: "#",
    },
    {
      icon: FaQuestionCircle,
      title: "Interactive Learning",
      description:
        "Engage with flashcards, practice questions, and interactive tools.",
      link: "#",
    },
  ];

  const roadmapItems = [
    {
      number: 1,
      title: "Sign Up",
      description: "Create an account to access all StudyGenix features.",
    },
    {
      number: 2,
      title: "Upload Materials",
      description: "Upload your study materials to generate quizzes and notes.",
    },
    {
      number: 3,
      title: "Learn & Practice",
      description: "Use the AI tutor and take quizzes to master your subjects.",
    },
    {
      number: 4,
      title: "Track Progress",
      description:
        "Monitor your learning journey with detailed analytics and insights.",
    },
  ];

  const faqs = [
    {
      question: "What is StudyGenix?",
      answer:
        "StudyGenix is an AI-powered educational platform offering personalized learning, multilingual support, and quiz generation.",
    },
    {
      question: "How do I create quizzes?",
      answer:
        "Upload your study materials, and our AI will generate custom quizzes tailored to your content.",
    },
    {
      question: "Is it available in multiple languages?",
      answer:
        "Yes, StudyGenix supports multiple languages for a global learning experience.",
    },
    {
      question: "Can I track my progress?",
      answer:
        "Absolutely, StudyGenix provides detailed analytics to monitor your learning progress and performance.",
    },
  ];

  return (
    <div className="landing-main">
      {/* Header with Navbar */}
      <header id="header">
        {/* <Navbar /> */}
      </header>

      {/* Hero Section */}
      <section id="home" className="hero">
        <Particles
          id="particles-js"
          init={particlesInit}
          loaded={particlesLoaded}
          options={{}} // Options are passed via tsParticles.load in particlesInit
        />
        <div className="hero-content" data-aos="fade-up">
          <h1>Unlock Your Learning Potential with StudyGenix</h1>
          <p>
            StudyGenix is your personalized guide to academic success. Using
            advanced AI, we create tailored learning paths, quizzes, and
            multilingual support to help you excel.
          </p>
          <div className="cta-buttons">
            <a
              href="#"
              className="primary-btn"
              onClick={() => navigate("/signup")}
            >
              Start For Free <FaChevronRight className="btn-icon" />
            </a>
            <a href="#features" className="secondary-btn">
              Explore Features <FaChevronDown className="btn-icon" />
            </a>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="features">
        <div className="container">
          <div className="section-header" data-aos="fade-up">
            <h2 className="section-title">Intelligent Learning Solutions</h2>
            <p className="section-subtitle">
              Discover how StudyGenix transforms your learning journey with
              innovative AI-powered features.
            </p>
          </div>
          <div className="features-grid">
            {features.map((feature, index) => {
              const Icon = feature.icon;
              return (
                <div
                  key={index}
                  className="feature-card"
                  data-aos="fade-up"
                  data-aos-delay={100 + index * 100}
                >
                  <div className="feature-icon">
                    <Icon />
                  </div>
                  <h3>{feature.title}</h3>
                  <p>{feature.description}</p>
                  <a href={feature.link} className="feature-link">
                    Learn More <FaChevronRight />
                  </a>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Roadmap Section */}
      <section id="roadmap" className="roadmap">
        <div className="container">
          <div className="section-header" data-aos="fade-up">
            <h2 className="section-title">Your Learning Journey</h2>
            <p className="section-subtitle">
              Follow our proven roadmap to transform your study challenges into
              academic success with AI-powered guidance.
            </p>
          </div>
          <div className="roadmap-container">
            <div className="roadmap-path">
              <svg viewBox="0 0 1200 300" preserveAspectRatio="none">
                <path d="M0,150 C300,50 600,250 900,50 L1200,150" />
              </svg>
            </div>
            <div className="roadmap-items">
              {roadmapItems.map((item, index) => (
                <div
                  key={index}
                  className="roadmap-item"
                  data-aos="fade-up"
                  data-aos-delay={100 + index * 100}
                >
                  <div className="roadmap-number">{item.number}</div>
                  <h3>{item.title}</h3>
                  <p>{item.description}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section id="faq" className="faq">
        <div className="container">
          <div className="section-header" data-aos="fade-up">
            <h2 className="section-title">Frequently Asked Questions</h2>
            <p className="section-subtitle">
              Find answers to common questions about StudyGenix’s AI-powered
              learning platform.
            </p>
          </div>
          <div className="faq-container">
            {faqs.map((faq, index) => (
              <div
                key={index}
                className={`accordion ${
                  openAccordion === index ? "active" : ""
                }`}
                data-aos="fade-up"
              >
                <div
                  className="accordion-header"
                  onClick={() => toggleAccordion(index)}
                >
                  <h3>{faq.question}</h3>
                  <FaChevronDown className="accordion-icon" />
                </div>
                <div className="accordion-content">
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
          <div className="section-header" data-aos="fade-up">
            <h2 className="section-title">Get in Touch</h2>
            <p className="section-subtitle">
              Have questions about StudyGenix? We’re here to help you excel in
              your learning journey.
            </p>
          </div>
          <div className="contact-grid">
            <div className="contact-info" data-aos="fade-up">
              <div className="contact-item">
                <div className="contact-icon">
                  <FaMapMarkerAlt />
                </div>
                <div className="contact-text">
                  <h3>Our Location</h3>
                  <p>123 Innovation Drive, Tech Park</p>
                  <p>San Francisco, CA 94107</p>
                </div>
              </div>
              <div className="contact-item">
                <div className="contact-icon">
                  <FaEnvelope />
                </div>
                <div className="contact-text">
                  <h3>Email Us</h3>
                  <a href="mailto:support@studygenix.com">
                    support@studygenix.com
                  </a>
                  <a href="mailto:info@studygenix.com">info@studygenix.com</a>
                </div>
              </div>
              <div className="contact-item">
                <div className="contact-icon">
                  <FaPhoneAlt />
                </div>
                <div className="contact-text">
                  <h3>Call Us</h3>
                  <a href="tel:+14155552671">+1 (415) 555-2671</a>
                  <p>Mon - Fri: 9AM - 6PM (PST)</p>
                </div>
              </div>
              <div className="contact-item">
                <div className="contact-icon">
                  <FaComments />
                </div>
                <div className="contact-text">
                  <h3>Live Chat</h3>
                  <p>Available 24/7 for urgent queries</p>
                  <a href="#">Start Chat</a>
                </div>
              </div>
            </div>
            <div className="contact-form" data-aos="fade-up">
              <form onSubmit={handleContactSubmit}>
                <div className="form-group">
                  <label htmlFor="name" className="form-label">
                    Your Name
                  </label>
                  <input
                    type="text"
                    id="name"
                    className="form-control"
                    placeholder="Enter your name"
                    required
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="email" className="form-label">
                    Your Email
                  </label>
                  <input
                    type="email"
                    id="email"
                    className="form-control"
                    placeholder="Enter your email"
                    required
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="subject" className="form-label">
                    Subject
                  </label>
                  <input
                    type="text"
                    id="subject"
                    className="form-control"
                    placeholder="What is this regarding?"
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="message" className="form-label">
                    Your Message
                  </label>
                  <textarea
                    id="message"
                    className="form-control"
                    placeholder="How can we help you?"
                    required
                  ></textarea>
                </div>
                <button type="submit" className="submit-btn">
                  Send Message
                </button>
              </form>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer>
        <div className="container">
          <div className="footer-grid">
            <div className="footer-info">
              <a href="#" className="footer-logo">
                <FaBrain /> StudyGenix
              </a>
              <p className="footer-description">
                Empowering students to excel with AI-powered learning and
                personalized study tools.
              </p>
              <div className="social-links">
                <a href="#" className="social-link">
                  <FaFacebookF />
                </a>
                <a href="#" className="social-link">
                  <FaTwitter />
                </a>
                <a href="#" className="social-link">
                  <FaLinkedinIn />
                </a>
                <a href="#" className="social-link">
                  <FaInstagram />
                </a>
              </div>
            </div>
            <div className="footer-links-section">
              <h3 className="footer-title">Quick Links</h3>
              <ul className="footer-links">
                <li>
                  <a href="#home">
                    <FaChevronRight /> Home
                  </a>
                </li>
                <li>
                  <a href="#features">
                    <FaChevronRight /> Features
                  </a>
                </li>
                <li>
                  <a href="#roadmap">
                    <FaChevronRight /> Roadmap
                  </a>
                </li>
                <li>
                  <a href="#faq">
                    <FaChevronRight /> FAQ
                  </a>
                </li>
                <li>
                  <a href="#contact">
                    <FaChevronRight /> Contact Us
                  </a>
                </li>
              </ul>
            </div>
            <div className="footer-links-section">
              <h3 className="footer-title">Our Services</h3>
              <ul className="footer-links">
                <li>
                  <a href="#">
                    <FaChevronRight /> Quiz Generation
                  </a>
                </li>
                <li>
                  <a href="#">
                    <FaChevronRight /> AI Tutor
                  </a>
                </li>
                <li>
                  <a href="#">
                    <FaChevronRight /> Multilingual Support
                  </a>
                </li>
                <li>
                  <a href="#">
                    <FaChevronRight /> Progress Tracking
                  </a>
                </li>
                <li>
                  <a href="#">
                    <FaChevronRight /> Interactive Tools
                  </a>
                </li>
              </ul>
            </div>
            <div className="footer-links-section">
              <h3 className="footer-title">Resources</h3>
              <ul className="footer-links">
                <li>
                  <a href="#">
                    <FaChevronRight /> Blog
                  </a>
                </li>
                <li>
                  <a href="#">
                    <FaChevronRight /> Study Guides
                  </a>
                </li>
                <li>
                  <a href="#">
                    <FaChevronRight /> Webinars
                  </a>
                </li>
                <li>
                  <a href="#">
                    <FaChevronRight /> Success Stories
                  </a>
                </li>
                <li>
                  <a href="#">
                    <FaChevronRight /> Learning Tips
                  </a>
                </li>
              </ul>
            </div>
          </div>
          <div className="copyright">
            &copy; 2025 <a href="#">StudyGenix</a>. All Rights Reserved. Privacy
            Policy | Terms of Service
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
