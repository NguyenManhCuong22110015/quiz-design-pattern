import React from 'react';
import { Link } from 'react-router-dom';
import { Container, Row, Col } from 'react-bootstrap';
import { FaFacebook, FaTwitter, FaInstagram, FaLinkedin, FaGithub } from 'react-icons/fa';
import '../../styles/Footer.css';

const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="footer mt-auto py-4">
        <hr/>
      <Container>
        <Row className="mb-4">
          <Col lg={4} md={6} className="mb-4 mb-md-0">
            <h5 className="footer-title">Quizz</h5>
            <p className="footer-desc">
              Create, share, and play engaging quizzes with our interactive platform. 
              Perfect for classrooms, training, or just having fun with friends.
            </p>
            <div className="social-icons">
              <a href="https://facebook.com" target="_blank" rel="noopener noreferrer" aria-label="Facebook">
                <FaFacebook className="social-icon" />
              </a>
              <a href="https://twitter.com" target="_blank" rel="noopener noreferrer" aria-label="Twitter">
                <FaTwitter className="social-icon" />
              </a>
              <a href="https://instagram.com" target="_blank" rel="noopener noreferrer" aria-label="Instagram">
                <FaInstagram className="social-icon" />
              </a>
              <a href="https://linkedin.com" target="_blank" rel="noopener noreferrer" aria-label="LinkedIn">
                <FaLinkedin className="social-icon" />
              </a>
              <a href="https://github.com" target="_blank" rel="noopener noreferrer" aria-label="GitHub">
                <FaGithub className="social-icon" />
              </a>
            </div>
          </Col>
          
          <Col lg={2} md={6} className="mb-4 mb-md-0">
            <h5 className="footer-heading">Links</h5>
            <ul className="footer-links">
              <li><Link to="/">Home</Link></li>
              <li><Link to="/about">About</Link></li>
              <li><Link to="/contact">Contact</Link></li>
              <li><Link to="/faq">FAQ</Link></li>
            </ul>
          </Col>
          
          <Col lg={3} md={6} className="mb-4 mb-md-0">
            <h5 className="footer-heading">Features</h5>
            <ul className="footer-links">
              <li><Link to="/admin/quizz">Create Quiz</Link></li>
              <li><Link to="/generate">AI Generator</Link></li>
              <li><Link to="/leaderboard">Leaderboards</Link></li>
              <li><Link to="/history">Quiz History</Link></li>
            </ul>
          </Col>
          
          <Col lg={3} md={6} className="mb-4 mb-md-0">
            <h5 className="footer-heading">Contact Us</h5>
            <address className="footer-contact">
              <p><i className="fas fa-map-marker-alt"></i> 123 Quiz Street, Learning City</p>
              <p><i className="fas fa-envelope"></i> support@quizz.com</p>
              <p><i className="fas fa-phone"></i> +1 (123) 456-7890</p>
            </address>
          </Col>
        </Row>
        
        <hr className="footer-divider" />
        
        <Row className="footer-bottom">
          <Col md={6} className="text-center text-md-start">
            <p className="mb-0">© {currentYear} Quizz. All rights reserved.</p>
          </Col>
          <Col md={6} className="text-center text-md-end">
            <ul className="footer-legal">
              <li><Link to="/privacy">Privacy Policy</Link></li>
              <li><Link to="/terms">Terms of Service</Link></li>
            </ul>
          </Col>
        </Row>
      </Container>
    </footer>
  );
};

export default Footer;