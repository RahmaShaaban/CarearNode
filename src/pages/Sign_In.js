import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom'; 
import './Sign_In.css';
import logo from '../photos/logo.png';

function SignIn() {
    const [showPassword, setShowPassword] = useState(false);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');

    const navigate = useNavigate();

    const togglePasswordVisibility = () => {
        setShowPassword(!showPassword);
    };

    // 3. backend logic
    const handleSubmit = async (e) => {
        e.preventDefault(); // No Refresh

        try {
            // send data to backend
            const response = await fetch('http://localhost:5000/api/auth/login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ email, password }), // data sent
            });

            const data = await response.json();

            if (response.ok) {
                // if data right and the response of server is OK
                
                // 1. حفظ الايدي في المتصفح (مهم جداً عشان البروفايل يشتغل)
                if (data.userId) {
                    localStorage.setItem('userId', data.userId);
                }
                
                // (اختياري) لو عندك توكن ممكن تحفظيه هنا كمان
                // localStorage.setItem('token', data.token);

                alert("Logged in successfully!");

                // 2. التوجيه لصفحة البروفايل بدل الهوم
                navigate('/profile'); 
            } else {
                // if there is any problem like wrong email or password
                alert(data.message || "Failed to login, please check your data");
            }
        } catch (error) {
            console.error("Error:", error);
            alert("Failed to connect to server");
        }
    };

    return (
        <div className="signin-page">
            <div className="back-link-container">
                <Link to="/" className="back-link">
                    Back to Home
                </Link>
            </div>

            <div className="signin-card">
                <div className="logo-container">
                    <img src={logo} alt="CareerNode" className="signin-logo" />
                </div>

                <h2>Welcome Back</h2>
                <p className="subtitle">Enter your credentials to access your account</p>

                {/* 4.link betwwen function and Form */}
                <form className="signin-form" onSubmit={handleSubmit}>
                    <div className="form-group">
                        <label>Email</label>
                        <input
                            type="email"
                            placeholder="Enter your email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required 
                        />
                    </div>

                    <div className="form-group">
                        <label>Password</label>
                        <div className="password-wrapper">
                            <input
                                type={showPassword ? "text" : "password"}
                                placeholder="Enter your password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                            />

                            <span className="eye-icon" onClick={togglePasswordVisibility}>
                                {showPassword ? (
                                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>
                                ) : (
                                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" /></svg>
                                )}
                            </span>
                        </div>
                    </div>

                    <button type="submit" className="btn-primary">Sign In</button>

                    <p className="footer-text">
                        Don't have an account? <Link to="/signup" className="link-highlight">Sign Up</Link>
                    </p>
                </form>
            </div>
        </div>
    );
}

export default SignIn;