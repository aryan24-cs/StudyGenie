import React from 'react';
import '../style/ContactMe.style.css';

function ContactMe() {
  return (
    <footer className="footer">
      <p>
        © {new Date().getFullYear()} Saswat Dash | 
        <a href="https://github.com/SaswatDash913" target="_blank" rel="noopener noreferrer">
          GitHub
        </a> | 
        <a href="MailTo:saswatdash2026@gmail.com">
          Gmail
        </a>
      </p>
      
    </footer>
    
  );
}

export default ContactMe;
