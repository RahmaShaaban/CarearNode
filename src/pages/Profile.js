import React, { useState, useRef, useEffect } from 'react'; // 1. زودنا useEffect
import { useNavigate } from 'react-router-dom'; // 2. عشان الـ Logout
import './Profile.css';

function Profile() {
  const navigate = useNavigate();
  const fileInputRef = useRef(null);

  // الحالة المبدئية (فاضية لحد ما الداتا تيجي)
  const [userData, setUserData] = useState({
    fullName: "Loading...",
    email: "...",
    bio: "...",
    profilePic: "https://via.placeholder.com/150",
    role: "Student",
    // البيانات دي لسه static (وهمية) لحد ما نعمل جداول ليها في الباك
    averageScore: 85, 
    interviewsDone: 12,
    courses: [
      { id: 1, name: "Frontend Development", completed: 8, total: 12, percentage: 65 },
      { id: 2, name: "React Mastery", completed: 3, total: 10, percentage: 30 }
    ],
    resumeUploaded: false,
    resumeName: "",
    milestones: [
      { id: 1, title: "Complete 'Advanced Hooks'", date: "Tomorrow", icon: "fa-book-open", color: "#3b82f6" },
      { id: 2, title: "Mock Interview: System Design", date: "Feb 24, 2026", icon: "fa-users", color: "#8b5cf6" },
      { id: 3, title: "Update Resume", date: "Next Week", icon: "fa-file-signature", color: "#f59e0b" }
    ]
  });

  // 3. useEffect: بتشتغل أول ما الصفحة تفتح
  useEffect(() => {
    const fetchProfile = async () => {
      // بنجيب الايدي اللي حفظناه وقت الـ Sign In (هشرحلك دي تحت)
      const userId = localStorage.getItem('userId'); 

      if (!userId) {
        alert("يجب تسجيل الدخول أولاً");
        navigate('/Sign_In'); // لو مفيش ايدي يرجعه لصفحة الدخول
        return;
      }

      try {
        const response = await fetch(`http://localhost:5000/api/auth/profile/${userId}`);
        const data = await response.json();

        if (response.ok) {
          // تحديث الحالة بالبيانات الحقيقية من الداتابيز
          setUserData(prevState => ({
            ...prevState, // حافظ على البيانات الوهمية (زي الكورسات)
            fullName: data.full_name,
            email: data.email,
            // لو مفيش bio جاي من الداتابيز حط جملة افتراضية
            bio: data.about_me || "No bio added yet.", 
            // لو في صورة جاية من الباك حط قبلها رابط السيرفر، لو مفيش حط صورة افتراضية
            profilePic: data.profile_image 
              ? `http://localhost:5000${data.profile_image}` 
              : "https://via.placeholder.com/150"
          }));
        } else {
          console.error("Error fetching profile:", data.message);
        }
      } catch (error) {
        console.error("Connection Error:", error);
      }
    };

    fetchProfile();
  }, [navigate]);

  const handleUploadClick = () => {
    fileInputRef.current.click();
  };

  // 4. دالة تسجيل الخروج
  const handleLogout = () => {
    localStorage.removeItem('userId'); // نمسح الايدي المحفوظ
    localStorage.removeItem('user');   // نمسح أي بيانات تانية
    navigate('/Sign_In'); // نوديه صفحة الدخول
  };

  return (
    <div className="profile-container">
        <div className="profile-card">
            <div className="profile-header">
                <button className="logout-btn" onClick={handleLogout}>
                  <i className="fa-solid fa-arrow-right-from-bracket"></i> Logout
                </button>
            </div>

            <div className="avatar-section">
                <div className="avatar-wrapper">
                  <img src={userData.profilePic} className="avatar-img" alt="Profile" />
                </div>
                
                <div className="action-buttons">
                    <button className="btn-settings"><i className="fa-solid fa-gear"></i> Settings</button>
                    <button className="btn-edit"><i className="fa-solid fa-pen-to-square"></i> Edit Profile</button>
                </div>
            </div>

            <div className="profile-info">
                <h2 className="user-name">{userData.fullName}</h2>
                <p className="user-meta">Student • {userData.email}</p> 
                
                <div className="about-section">
                    <h4 className="about-title">
                        <i className="fa-solid fa-circle-info"></i> About Me
                    </h4>
                    <p className="bio-text">{userData.bio}</p>
                </div>
            </div>

            {/* باقي الكود زي ما هو بالظبط للجزء الثابت */}
            <div className="stats-container">
                <div className="stat-card score-card">
                    <div className="stat-icon-wrapper blue-bg">
                        <i className="fa-solid fa-trophy"></i>
                    </div>
                    <div className="stat-content">
                        <span className="stat-value">{userData.averageScore}%</span>
                        <span className="stat-label">Average Interview Score</span>
                    </div>
                </div>

                <div className="stat-card completed-card">
                    <div className="stat-icon-wrapper green-bg">
                        <i className="fa-solid fa-circle-check"></i>
                    </div>
                    <div className="stat-content">
                        <span className="stat-value">{userData.interviewsDone}</span>
                        <span className="stat-label">Interviews Completed</span>
                    </div>
                </div>
            </div>

            <div className="dashboard-grid">
                <div className="dashboard-card">
                    <h4 className="card-title"><i className="fa-solid fa-chart-line"></i> Current Progress</h4>
                    <div className="courses-list">
                    {userData.courses.map(course => (
                        <div className="course-item" key={course.id}>
                        <div className="course-info">
                            <span className="course-name">{course.name}</span>
                            <span className="course-count">{course.completed}/{course.total} Modules</span>
                        </div>
                        <div className="progress-bar-container">
                            <div className="progress-bar-fill" style={{ width: `${course.percentage}%` }}></div>
                        </div>
                        <span className="progress-percentage">{course.percentage}% Completed</span>
                        </div>
                    ))}
                    </div>
                </div>

                <div className="dashboard-card">
                        <h4 className="card-title purple-text"><i className="fa-solid fa-file-invoice"></i> My Resume</h4>
                    <div className="resume-upload-zone">
                        <div className="upload-icon-wrapper">
                            <i className="fa-solid fa-cloud-arrow-up"></i>
                        </div>
                        
                        <input 
                            type="file" 
                            ref={fileInputRef} 
                            style={{ display: 'none' }} 
                            accept=".pdf,.doc,.docx"
                            onChange={(e) => console.log(e.target.files[0])}
                        />

                        <p className="upload-text">No resume uploaded</p>
                        <p className="upload-subtext">Upload your CV to get AI insights</p>
                        
                        <button className="btn-upload-outline" onClick={handleUploadClick}>
                            Upload PDF / Word
                        </button>
                    </div>
                </div>
            </div>

            <div className="milestones-card">
                <h4 className="card-title">
                    <i className="fa-solid fa-flag-checkered" style={{ color: '#43766C' }}></i> Upcoming Milestones
                </h4>
                <div className="milestones-grid">
                    {userData.milestones.map(item => (
                    <div className="milestone-item" key={item.id}>
                        <div className="milestone-icon" style={{ backgroundColor: `${item.color}15`, color: item.color }}>
                            <i className={`fa-solid ${item.icon}`}></i>
                        </div>
                        <div className="milestone-info">
                            <span className="milestone-title">{item.title}</span>
                            <span className="milestone-date">{item.date}</span>
                        </div>
                    </div>
                    ))}
                </div>
            </div>
        
        </div>
    </div>
  );
}

export default Profile;