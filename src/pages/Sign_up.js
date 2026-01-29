import React, { useState, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import './Sign_up.css';
import logo from '../photos/logo.png';

function SignUp() {
    const [showPassword, setShowPassword] = useState(false);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [fullName, setFullName] = useState("");
    const [role, setRole] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [bio, setBio] = useState("");

    const fileInputRef = useRef(null);
    const [profileImage, setProfileImage] = useState(null);

    const navigate = useNavigate();

    const togglePasswordVisibility = () => {
        setShowPassword(!showPassword);
    };

    const handleImageChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setProfileImage(URL.createObjectURL(file));
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (password !== confirmPassword) {
            alert("كلمة المرور غير متطابقة!");
            return;
        }

        const formData = new FormData();
        formData.append('full_name', fullName);
        formData.append('email', email);
        formData.append('password', password);
        formData.append('role', role); // ضفنا الـ role عشان تتبعت للباك إند
        formData.append('about_me', bio);

        if (fileInputRef.current.files[0]) {
            formData.append('profileImage', fileInputRef.current.files[0]);
        }

        try {
            const response = await fetch('http://localhost:5000/api/auth/signup', {
                method: 'POST',
                body: formData,
            });

            const data = await response.json();

            if (response.ok) {
                // حفظ الـ userId عشان صفحة البروفايل تعرف اليوزر
                localStorage.setItem('userId', data.userId);
                alert("تم إنشاء الحساب بنجاح! مرحباً بك في CareerNode.");
                navigate('/Profile');
            } else {
                console.log("Server Error Details:", data);
                alert("فشل التسجيل: " + (data.message || "تأكدي من البيانات المدخلة"));
            }

        } catch (error) {
            console.error("Error:", error);
            alert("فشل الاتصال بالسيرفر. تأكدي إن الباك إند شغال.");
        }
    };

    return (
        <div className="signup-container">
            <div className="back-link-container">
                <Link to="/" className="back-btn">
                    <button className="btn-back">
                        <i className="fa-solid fa-arrow-left"></i> Back to Home
                    </button>
                </Link>
            </div>

            <div className="signup-card">
                <div className="logo-wrapper">
                    <img src={logo} alt="CareerNode" className="signup-logo" />
                </div>

                <h2 className="signup-title">Create Account</h2>
                <p className="signup-subtitle">Join CareerNode to start your journey</p>

                {/* Profile Photo Section - رجعنا الـ Hover والـ Placeholder */}
                <div className="profile-upload-section">
                    <div className="profile-circle" onClick={() => fileInputRef.current.click()}>
                        {!profileImage ? (
                            <>
                                <div className="default-placeholder">
                                    <svg className="camera-svg" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                        <path d="M12 15C13.6569 15 15 13.6569 15 12C15 10.3431 13.6569 9 12 9C10.3431 9 9 10.3431 9 12C9 13.6569 10.3431 15 12 15Z" stroke="#94a3b8" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                        <path d="M3 7C3 5.89543 3.89543 5 5 5H7L9 3H15L17 5H19C20.1046 5 21 5.89543 21 7V17C21 18.1046 20.1046 19 19 19H5C3.89543 19 3 18.1046 3 17V7Z" stroke="#94a3b8" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                    </svg>
                                </div>
                                <div className="hover-overlay">
                                    <span className="upload-text">Upload</span>
                                </div>
                            </>
                        ) : (
                            <>
                                <img src={profileImage} alt="Profile" className="preview-img" />
                                <div className="hover-overlay">
                                    <span className="upload-text">Change</span>
                                </div>
                            </>
                        )}
                    </div>
                    <input type="file" ref={fileInputRef} onChange={handleImageChange} style={{ display: 'none' }} accept="image/*" />
                    <p className="tap-text">Tap to upload picture</p>
                </div>

                <form className="signup-form-fields" onSubmit={handleSubmit}>
                    <div className="input-group">
                        <label className="input-label">Full Name</label>
                        <input type="text" className="form-input" placeholder="Enter your Name" value={fullName} onChange={(e) => setFullName(e.target.value)} required />
                    </div>

                    <div className="input-group">
                        <label className="input-label">Current Role</label>
                        <select className="form-select" value={role} onChange={(e) => setRole(e.target.value)} required>
                            <option value="" disabled>Select your current status</option>
                            <option value="student">Student</option>
                            <option value="graduated">Graduated</option>
                            <option value="employed">Employment</option>
                        </select>
                    </div>

                    <div className="input-group">
                        <label className="input-label">Email</label>
                        <input type="email" className="form-input" placeholder="Enter your email" value={email} onChange={(e) => setEmail(e.target.value)} required />
                    </div>

                    <div className="input-group">
                        <label className="input-label">Password</label>
                        <div className="password-field-container">
                            <input type={showPassword ? "text" : "password"} className="form-input" placeholder="Create a password" value={password} onChange={(e) => setPassword(e.target.value)} required />
                            <span className="eye-icon" onClick={togglePasswordVisibility}>
                                {showPassword ? (
                                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>
                                ) : (
                                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" /></svg>
                                )}
                            </span>
                        </div>
                    </div>

                    <div className="input-group">
                        <label className="input-label">Confirm Password</label>
                        <input type={showPassword ? "text" : "password"} className="form-input" placeholder="Confirm your password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} required />
                    </div>

                    {/* Bio Section - رجعنا الـ Bio سيكشن */}
                    <div className="input-group bio-field">
                        <label className="input-label">About Me (Bio)</label>
                        <textarea
                            placeholder="Briefly describe your interests and goals..."
                            rows="5"
                            className="form-textarea"
                            value={bio}
                            onChange={(e) => setBio(e.target.value)}
                        />
                    </div>

                    <button type="submit" className="signup-submit-btn">Register</button>
                    <p className="auth-footer-text">
                        Already have an account? <Link to="/Sign_In" className="auth-link">Sign in</Link>
                    </p>
                </form>
            </div>
        </div>
    );
}

export default SignUp;