import React, { useState, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import './Sign_up.css';
import logo from '../photos/logo.png';

function SignUp() {
    const [showPassword, setShowPassword] = useState(false);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [fullName, setFullName] = useState("");
    const [role, setRole] = useState(""); // State موجودة بس مش مستخدمة في الفورم حالياً
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
                // 1. حفظ الايدي
                localStorage.setItem('userId', data.userId);

                // 2. (تعديل جديد) حفظ الصورة عشان تظهر في الهوم فوراً
                if (data.profile_image) {
                    localStorage.setItem('userImage', data.profile_image);
                } else {
                    localStorage.setItem('userImage', '');
                }

                alert("تم إنشاء الحساب بنجاح! مرحباً بك في CareerNode.");

                // 3. (تعديل جديد) التوجيه للهوم بدلاً من البروفايل
                navigate('/');
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
                <Link to="/" className="back-link">Back to CareerNode</Link>
            </div>

            <div className="signup-card">
                <div className="logo-wrapper">
                    <img src={logo} alt="CareerNode" className="signup-logo" />
                </div>

                <h2 className="signup-title">Create Account</h2>

                <div className="profile-upload-section">
                    <div className="profile-circle" onClick={() => fileInputRef.current.click()}>
                        {!profileImage ? (
                            <div className="default-placeholder">
                                <svg className="camera-svg" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                    <path d="M12 15C13.6569 15 15 13.6569 15 12C15 10.3431 13.6569 9 12 9C10.3431 9 9 10.3431 9 12C9 13.6569 10.3431 15 12 15Z" stroke="#94a3b8" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                    <path d="M3 7C3 5.89543 3.89543 5 5 5H7L9 3H15L17 5H19C20.1046 5 21 5.89543 21 7V17C21 18.1046 20.1046 19 19 19H5C3.89543 19 3 18.1046 3 17V7Z" stroke="#94a3b8" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                </svg>
                            </div>
                        ) : (
                            <img src={profileImage} alt="Profile" className="preview-img" />
                        )}
                    </div>
                    <input type="file" ref={fileInputRef} onChange={handleImageChange} style={{ display: 'none' }} accept="image/*" />
                </div>

                <form className="signup-form-fields" onSubmit={handleSubmit}>
                    <div className="input-group">
                        <label className="input-label">Full Name</label>
                        <input type="text" className="form-input" value={fullName} onChange={(e) => setFullName(e.target.value)} required />
                    </div>

                    <div className="input-group">
                        <label className="input-label">Email</label>
                        <input type="email" className="form-input" value={email} onChange={(e) => setEmail(e.target.value)} required />
                    </div>

                    <div className="input-group">
                        <label className="input-label">Password</label>
                        <input type={showPassword ? "text" : "password"} className="form-input" value={password} onChange={(e) => setPassword(e.target.value)} required />
                    </div>

                    <div className="input-group">
                        <label className="input-label">Confirm Password</label>
                        <input type={showPassword ? "text" : "password"} className="form-input" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} required />
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