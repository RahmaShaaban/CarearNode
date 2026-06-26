import React from 'react';
import './Footer.css';

const Footer = () => {
    return (
        <footer className="footer-container">
            <div className="footer-content">

               
                <div className="footer-section">
                    <h3 className="footer-logo">CareerNode</h3>
                    <p className="footer-description">
                        Empowering CS students to define their career tracks,
                        build professional CVs, and ace their interviews.
                    </p>
                </div>

                
                <div className="footer-section">
                    <h4>Quick Links</h4>
                    <ul className="footer-links">
                        <li><a href="/">Home</a></li>
                        <li><a href="/about">About Us</a></li>
                        <li><a href="/services">Services</a></li>
                        <li><a href="/contact">Contact</a></li>
                    </ul>
                </div>

                
                <div className="footer-section">
                    <h4>Get in Touch</h4>

                    
                    <p>
                        Email: <a href="mailto:support@careernode.com" style={{ color: 'inherit', textDecoration: 'none' }}>
                            support@careernode.com
                        </a>
                    </p>

                    <p>Location: Cairo, Egypt</p>

                    <div className="social-links">
                       
                        <a href="https://linkedin.com" target="_blank" rel="noopener noreferrer">LinkedIn</a>
                        <a href="https://github.com" target="_blank" rel="noopener noreferrer">GitHub</a>
                    </div>
                </div>
            </div>

            <div className="footer-bottom">
                <p>&copy; {new Date().getFullYear()} CareerNode. All Rights Reserved.</p>
            </div>
        </footer>
    );
};

export default Footer;