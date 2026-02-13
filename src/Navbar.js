import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import logo from './photos/logo.png';
import './Navbar.css';


const Navbar = () => {
    const navigate = useNavigate();

    // --- 1. الجزء الجديد: التحكم في القائمة ---
    const [isOpen, setIsOpen] = useState(false);
    const toggleMenu = () => setIsOpen(!isOpen);



    // 1. جلب البيانات من الذاكرة
    const userId = localStorage.getItem('userId');
    const storedImage = localStorage.getItem('userImage');

    // 2. شرط ذكي للتأكد من أن المستخدم مسجل دخول فعلاً
    // (يمنع ظهور الصورة لو القيمة "undefined" أو "null" بالخطأ)
    const isLoggedIn = userId && userId !== 'null' && userId !== 'undefined' && userId !== '';

    // 3. تجهيز رابط الصورة
    let profilePicUrl = 'https://cdn-icons-png.flaticon.com/512/3135/3135715.png'; // الصورة الافتراضية

    if (storedImage && storedImage !== 'null' && storedImage !== 'undefined' && storedImage !== '') {
        // لو الرابط كامل (جاي من جوجل أو فيسبوك)
        if (storedImage.startsWith('http')) {
            profilePicUrl = storedImage;
        }
        // لو الرابط من السيرفر بتاعنا (بيبدأ بـ /uploads)
        else {
            // تنظيف المسار لضمان عدم تكرار السلاش
            const cleanPath = storedImage.startsWith('/') ? storedImage : `/${storedImage}`;
            profilePicUrl = `http://localhost:5000${cleanPath}`;
        }
    }

    const handleLogout = () => {
        localStorage.clear(); // مسح كل البيانات
        navigate('/sign_in'); // الرجوع لصفحة الدخول
        window.location.reload(); // ريفريش للصفحة عشان النافبار يحس بالتغيير
    };

    return (
        <nav className="navbar">
            <Link to="/" className="navbar-logo">
                <img src={logo} alt="CareerNode Logo" style={{ width: '60px', height: 'auto' }} />
            </Link>

            {/* --- 3. زرار الموبايل (جديد) --- */}
            <div className="menu-icon" onClick={toggleMenu}>
                <i className={isOpen ? 'fas fa-times' : 'fas fa-bars'}></i>
            </div>

            {/* --- 4. القائمة (ضيفنا كلاس active و onClick للقفل) --- */}
            <ul className={isOpen ? "nav-links active" : "nav-links"}>
                <li><Link to="/" onClick={toggleMenu}>Home</Link></li>
                <li><Link to="/Department" onClick={toggleMenu}>Department</Link></li>
                <li><Link to="/roadmaps" onClick={toggleMenu}>Roadmaps</Link></li>
                <li><Link to="/cv" onClick={toggleMenu}>CV</Link></li>
                <li><Link to="/interview" onClick={toggleMenu}>Interview</Link></li>




                {/*


            <ul className="nav-links">
                <li><Link to="/">Home</Link></li>
                <li><Link to="/Department">Department</Link></li>
                <li><Link to="/roadmaps">Roadmaps</Link></li>
                <li><Link to="/cv">CV Builder</Link></li>
                <li><Link to="/interview">Interview</Link></li>

                */}

                {/* استخدام الشرط الجديد isLoggedIn */}
                {isLoggedIn ? (
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
                                    border: '2px solid #43766C', // استخدمت اللون الأخضر بتاعك
                                    cursor: 'pointer'
                                }}
                                // لو الصورة باظت، ارجع للصورة الافتراضية
                                onError={(e) => { e.target.src = 'https://cdn-icons-png.flaticon.com/512/3135/3135715.png' }}
                            />
                        </Link>

                        {/* زرار خروج عشان تقدري ترجعي لـ Sign In */}
                       
                    </li>
                ) : (
                    <li><Link to="/sign_in" className="nav-btn">Sign In</Link></li>
                )}
            </ul>
        </nav>
    );
};

export default Navbar;