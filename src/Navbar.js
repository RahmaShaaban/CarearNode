import React from 'react';
import { Link } from 'react-router-dom';
import logo from './photos/logo.png';
import './Navbar.css'; 
const Navbar = () => {
    return (
        <nav className="navbar">
            
            <Link to="/" className="navbar-logo">
                <img src={logo} alt="CareerNode Logo" style={{ width: '80px', height: 'auto' }} />
                
            </Link>

            
            <ul className="nav-links">
                <li><Link to="/">Home</Link></li>
                <li><Link to="/interview">Interview</Link></li>
                <li><Link to="/roadmaps">Roadmaps</Link></li>
                <li><Link to="/cv">CV Builder</Link></li>

               
                <li><Link to="/sign_in" className="nav-btn">Sign In</Link></li>
            </ul>
        </nav>
    );
};

export default Navbar;