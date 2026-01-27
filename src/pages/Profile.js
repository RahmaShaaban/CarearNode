// import React from 'react';

// function Profile() {
//     return (
//         <h1>Profile page</h1>
//     )
// } export default Profile;
import React, { useState , useRef } from 'react';
import './Profile.css';

function Profile() {
  // تجميع الداتا في Object واحد عشان الربط بالباك
  const [userData, setUserData] = useState({
    fullName: "Demo User",
    email: "user@example.com",
    bio: "Welcome back! This is a demo account.",
    profilePic: "https://via.placeholder.com/150" ,
    averageScore: 0, 
    interviewsDone: 0,
    courses: [
    { id: 1, name: "Frontend Development", completed: 8, total: 12, percentage: 65 },
    { id: 2, name: "React Mastery", completed: 3, total: 10, percentage: 30 }
    ],
    resumeUploaded: false, // لو true يظهر الملف، لو false يظهر الـ upload
    resumeName: "",
    milestones: [
    { id: 1, title: "Complete 'Advanced Hooks'", date: "Tomorrow", icon: "fa-book-open", color: "#3b82f6" },
    { id: 2, title: "Mock Interview: System Design", date: "Feb 24, 2026", icon: "fa-users", color: "#8b5cf6" },
    { id: 3, title: "Update Resume", date: "Next Week", icon: "fa-file-signature", color: "#f59e0b" }
    ]
  
  });
  const fileInputRef = useRef(null); // ده "الريموت" اللي هيشغل الـ input المخفي

  const handleUploadClick = () => {
    fileInputRef.current.click(); // لما ندوس على الزرار، كأننا دوسنا على الـ input
  };
  

  return (
    <div className="profile-container">
        <div className="profile-card">
            <div className="profile-header">
                <button className="logout-btn">
                <i className="fa-solid fa-arrow-right-from-bracket"></i> Logout
                </button>
            </div>

            <div className="avatar-section">
                <div className="avatar-wrapper">
                {/* لاحظي هنا بنادي على userData.profilePic */}
                <img src={userData.profilePic} className="avatar-img" alt="Profile" />
                </div>
                
                <div className="action-buttons">
                    <button className="btn-settings"><i className="fa-solid fa-gear"></i> Settings</button>
                    <button className="btn-edit"><i className="fa-solid fa-pen-to-square"></i> Edit Profile</button>
                </div>
            </div>

            <div className="profile-info">
                {/* بنادي على الاسم من الـ Object */}
                <h2 className="user-name">{userData.fullName}</h2>
                
                {/* الخطأ كان هنا: لازم نكتب userData.email */}
                <p className="user-meta">Student • {userData.email}</p> 
                
                <div className="about-section">
                    <h4 className="about-title">
                        <i className="fa-solid fa-circle-info"></i> About Me
                    </h4>
                    {/* والخطأ هنا كمان: لازم نكتب userData.bio */}
                    <p className="bio-text">{userData.bio}</p>
                </div>
            </div>

            <div className="stats-container">
                {/* Card 1: Interview Score */}
                <div className="stat-card score-card">
                    <div className="stat-icon-wrapper blue-bg">
                        <i className="fa-solid fa-trophy"></i>
                    </div>
                    <div className="stat-content">
                    {/* هنا بنادي على القيمة المتغيرة من الـ state */}
                        <span className="stat-value">{userData.averageScore}%</span>
                        <span className="stat-label">Average Interview Score</span>
                    </div>
                </div>

                {/* Card 2: Interviews Completed */}
                <div className="stat-card completed-card">
                    <div className="stat-icon-wrapper green-bg">
                        <i className="fa-solid fa-circle-check"></i>
                    </div>
                    <div className="stat-content">
                    {/* هنا كمان بنادي على القيمة المتغيرة */}
                        <span className="stat-value">{userData.interviewsDone}</span>
                        <span className="stat-label">Interviews Completed</span>
                    </div>
                </div>
            </div>

            {/* /////////// */}
            <div className="dashboard-grid">
                {/* Current Progress Section */}
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

                {/* My Resume Section */}
                <div className="dashboard-card">
                        <h4 className="card-title purple-text"><i className="fa-solid fa-file-invoice"></i> My Resume</h4>
                    <div className="resume-upload-zone">
                        <div className="upload-icon-wrapper">
                            <i className="fa-solid fa-cloud-arrow-up"></i>
                        </div>
                        
                        {/* الـ Input الحقيقي بس مخفي */}
                        <input 
                            type="file" 
                            ref={fileInputRef} 
                            style={{ display: 'none' }} 
                            accept=".pdf,.doc,.docx"
                            onChange={(e) => console.log(e.target.files[0])} // هنا الداتا اللي هتروح للباك
                        />

                        <p className="upload-text">No resume uploaded</p>
                        <p className="upload-subtext">Upload your CV to get AI insights</p>
                        
                        {/* الزرار بتاعك اللي هيشغل الـ Input */}
                        <button className="btn-upload-outline" onClick={handleUploadClick}>
                            Upload PDF / Word
                        </button>
                    </div>
                </div>
            </div>

            {/* last section  */}
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