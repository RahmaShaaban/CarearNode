import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import logo from './photos/logo.png';
import './Navbar.css';

const Navbar = () => {
    const navigate = useNavigate();

    // 1. بنجيب التوكن والصورة
    const token = localStorage.getItem('userId'); // استخدمت userId عشان انتي بتعتمدي عليه في اللوجين
    const storedImage = localStorage.getItem('userImage');

    // 2. تكوين رابط الصورة الصحيح
    let profilePicUrl = 'https://cdn-icons-png.flaticon.com/512/3135/3135715.png'; // الافتراضي

    if (storedImage && storedImage !== 'null' && storedImage !== 'undefined' && storedImage !== '') {
        // لو الصورة بادئة بـ http (رابط خارجي)
        if (storedImage.startsWith('http')) {
            profilePicUrl = storedImage;
        }
        // لو الصورة جاية من الباك إند (بادئة بـ /uploads/)
        else {
            // بنشيل أي / زيادة في الأول عشان نضمن الرابط صح
            const cleanPath = storedImage.startsWith('/') ? storedImage : `/${storedImage}`;
            profilePicUrl = `http://localhost:5000${cleanPath}`;
        }
    }

    const handleLogout = () => {
        localStorage.clear();
        navigate('/sign_in');
    };

    return (
        <nav className="navbar">
            <Link to="/" className="navbar-logo">
                <img src={logo} alt="CareerNode Logo" style={{ width: '60px', height: 'auto' }} />
            </Link>

            <ul className="nav-links">
                <li><Link to="/">Home</Link></li>
                <li><Link to="/Department">Department</Link></li>
                <li><Link to="/roadmaps">Roadmaps</Link></li>
                <li><Link to="/cv">CV Builder</Link></li>
                <li><Link to="/interview">Interview</Link></li>

                {token ? (
                    <li style={{ display: 'flex', alignItems: 'center', gap: '15px', marginLeft: '10px' }}>
                        <Link to="/profile" title="My Profile">
                            <img
                                src={profilePicUrl}
                                alt="User Profile"
                                style={{
                                    width: '40px',
                                    height: '40px',
                                    borderRadius: '50%',
                                    objectFit: 'cover',
                                    border: '2px solid #007bff',
                                    cursor: 'pointer'
                                }}
                                onError={(e) => { e.target.src = 'https://cdn-icons-png.flaticon.com/512/3135/3135715.png' }} // لو الصورة باظت يحط الافتراضية
                            />
                        </Link>
                       
                    </li>
                ) : (
                    <li><Link to="/sign_in" className="nav-btn">Sign In</Link></li>
                )}
            </ul>
        </nav>
    );
};

export default Navbar;