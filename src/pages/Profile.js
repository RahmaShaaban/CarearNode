import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './Profile.css';

function Profile() {
    const navigate = useNavigate();
    const profileImageInputRef = useRef(null);
    const resumeInputRef = useRef(null);

    const [isEditing, setIsEditing] = useState(false);
    const [previewImage, setPreviewImage] = useState(null);
    const [imageFile, setImageFile] = useState(null);

    // State لتخزين الوظائف القادمة من الداتابيز
    const [jobOptions, setJobOptions] = useState([]);

    const [editForm, setEditForm] = useState({
        fullName: "",
        email: "",
        role: "",
        bio: ""
    });

    const [userData, setUserData] = useState({
        fullName: "Loading...",
        email: "...",
        bio: "...",
        profilePic: "https://via.placeholder.com/150",
        role: "Student",
        averageScore: 85,
        interviewsDone: 12,
        resumeUploaded: false, 
        resumeName: "",        
        resumeDate: "",        
        courses: [
            { id: 1, name: "Frontend Development", completed: 8, total: 12, percentage: 65 },
            { id: 2, name: "React Mastery", completed: 3, total: 10, percentage: 30 }
        ],
        milestones: [
            { id: 1, title: "Complete 'Advanced Hooks'", date: "Tomorrow", icon: "fa-book-open", color: "#3b82f6" },
            { id: 2, title: "Mock Interview: System Design", date: "Feb 24, 2026", icon: "fa-users", color: "#8b5cf6" },
            { id: 3, title: "Update Resume", date: "Next Week", icon: "fa-file-signature", color: "#f59e0b" }
        ]
    });

    // 1. جلب بيانات المستخدم + الوظائف
    useEffect(() => {
        const fetchData = async () => {
            const userId = localStorage.getItem('userId');
            if (!userId) {
                navigate('/Sign_In');
                return;
            }

            try {
                // أ. جلب بيانات البروفايل
                const profileRes = await fetch(`http://localhost:5000/api/auth/profile/${userId}`);
                const profileData = await profileRes.json();

                if (profileRes.ok) {
                    setUserData(prevState => ({
                        ...prevState,
                        fullName: profileData.full_name,
                        email: profileData.email,
                        bio: profileData.about_me || "No bio added yet.",
                        role: profileData.role || "Student",
                        profilePic: profileData.profile_image
                            ? `http://localhost:5000${profileData.profile_image}`
                            : "https://via.placeholder.com/150"
                    }));
                }

                // ب. جلب قائمة الوظائف
                const jobsRes = await fetch('http://localhost:5000/api/jobs');
                if (jobsRes.ok) {
                    const jobsData = await jobsRes.json();
                    setJobOptions(jobsData);
                }

            } catch (error) {
                console.error("Connection Error:", error);
            }
        };

        fetchData();
    }, [navigate]);

    const handleEditClick = () => {
        setEditForm({
            fullName: userData.fullName,
            email: userData.email,
            // هنا بنخلي القيمة الافتراضية هي الدور الحالي لليوزر
            role: userData.role || "student", 
            bio: userData.bio === "No bio added yet." ? "" : userData.bio
        });
        setPreviewImage(userData.profilePic);
        setIsEditing(true);
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setEditForm(prev => ({ ...prev, [name]: value }));
    };

    const handleImageChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setImageFile(file);
            setPreviewImage(URL.createObjectURL(file));
        }
    };

    const handleResumeChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            const today = new Date().toLocaleDateString('en-US');
            setUserData(prev => ({
                ...prev,
                resumeUploaded: true,
                resumeName: file.name,
                resumeDate: today
            }));
        }
    };

    const handleRemoveResume = () => {
        setUserData(prev => ({
            ...prev,
            resumeUploaded: false,
            resumeName: "",
            resumeDate: ""
        }));
        if(resumeInputRef.current) resumeInputRef.current.value = "";
    };

    const handleSaveChanges = async () => {
        const userId = localStorage.getItem('userId');
        const formData = new FormData();
        formData.append('full_name', editForm.fullName);
        formData.append('email', editForm.email);
        formData.append('role', editForm.role);
        formData.append('bio', editForm.bio);

        if (imageFile) {
            formData.append('profileImage', imageFile);
        }

        try {
            const response = await fetch(`http://localhost:5000/api/auth/profile/${userId}`, {
                method: 'PUT',
                body: formData,
            });

            const data = await response.json();

            if (response.ok) {
                setUserData(prev => ({
                    ...prev,
                    fullName: data.user.full_name,
                    email: data.user.email,
                    role: data.user.role,
                    bio: data.user.about_me,
                    profilePic: data.user.profile_image
                        ? `http://localhost:5000${data.user.profile_image}`
                        : prev.profilePic
                }));
                setIsEditing(false);
                alert("Changes saved successfully!");
            }
        } catch (error) {
            console.error("Save Error:", error);
            alert("Failed to connect to server");
        }
    };

    const handleLogout = () => {
        localStorage.removeItem('userId');
        navigate('/Sign_In');
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
                    <div className="avatar-wrapper" style={{ position: 'relative' }}>
                        <img
                            src={isEditing ? previewImage : userData.profilePic}
                            className="avatar-img"
                            alt="Profile"
                            style={{ opacity: isEditing ? 0.7 : 1 }}
                        />
                        {isEditing && (
                            <div
                                className="camera-overlay"
                                onClick={() => profileImageInputRef.current.click()}
                                style={{
                                    position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)',
                                    cursor: 'pointer', color: 'white', background: 'rgba(0,0,0,0.5)', padding: '10px', borderRadius: '50%'
                                }}
                            >
                                <i className="fa-solid fa-camera fa-xl"></i>
                            </div>
                        )}
                        <input
                            type="file"
                            ref={profileImageInputRef}
                            onChange={handleImageChange}
                            style={{ display: 'none' }}
                            accept="image/*"
                        />
                    </div>

                    {!isEditing && (
                        <div className="action-buttons">
                            <button className="btn-edit" onClick={handleEditClick}>
                                <i className="fa-solid fa-pen-to-square"></i> Edit Profile
                            </button>
                        </div>
                    )}
                </div>

                {!isEditing ? (
                    <div className="profile-info">
                        <h2 className="user-name">{userData.fullName}</h2>
                        <p className="user-meta">{userData.role} • {userData.email}</p>
                        <div className="about-section">
                            <h4 className="about-title"><i className="fa-solid fa-circle-info"></i> About Me</h4>
                            <p className="bio-text">{userData.bio}</p>
                        </div>
                    </div>
                ) : (
                    <div className="edit-form-container" style={{ padding: '20px', width: '100%' }}>
                        <div className="form-group" style={{ marginBottom: '15px' }}>
                            <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>Full Name</label>
                            <input type="text" name="fullName" value={editForm.fullName} onChange={handleInputChange} className="form-input" style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #ddd' }} />
                        </div>
                        
                        {/* >>> التعديل هنا: الـ Dropdown الديناميكي <<< */}
                        <div className="form-group" style={{ marginBottom: '15px' }}>
                            <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>Current Role</label>
                            <select 
                                name="role" 
                                value={editForm.role} // هنا القيمة هتبقى الدور الحالي لليوزر أول ما يفتح الـ Edit
                                onChange={handleInputChange} 
                                className="form-select" 
                                style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #ddd' }}
                            >
                                {/* 1. خيار Student الثابت */}
                                <option value="student">Student</option>

                                {/* 2. باقي الوظائف من الداتابيز */}
                                {jobOptions.length > 0 && jobOptions.map((job) => (
                                    <option key={job.id} value={job.title}>
                                        {job.title}
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div className="form-group" style={{ marginBottom: '15px' }}>
                            <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>Email</label>
                            <input type="email" name="email" value={editForm.email} onChange={handleInputChange} className="form-input" style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #ddd' }} />
                        </div>
                        <div className="form-group" style={{ marginBottom: '20px' }}>
                            <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>Bio</label>
                            <textarea name="bio" value={editForm.bio} onChange={handleInputChange} rows="4" className="form-textarea" style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #ddd' }} />
                        </div>
                        <div className="edit-actions">
                            <button className="edit-btn btn-cancel" onClick={() => setIsEditing(false)}>
                                Cancel
                            </button>
                            <button className="edit-btn btn-save" onClick={handleSaveChanges}>
                                Save Changes
                            </button>
                        </div>
                    </div>
                )}

                <div className="stats-container">
                    <div className="stat-card score-card">
                        <div className="stat-icon-wrapper blue-bg"><i className="fa-solid fa-trophy"></i></div>
                        <div className="stat-content">
                            <span className="stat-value">{userData.averageScore}%</span>
                            <span className="stat-label">Average Score</span>
                        </div>
                    </div>
                    <div className="stat-card completed-card">
                        <div className="stat-icon-wrapper green-bg"><i className="fa-solid fa-circle-check"></i></div>
                        <div className="stat-content">
                            <span className="stat-value">{userData.interviewsDone}</span>
                            <span className="stat-label">Interviews</span>
                        </div>
                    </div>
                </div>

                <div className="dashboard-grid">
                    <div className="dashboard-card">
                        <h4 className="card-title"><i className="fa-solid fa-chart-line"></i> Progress</h4>
                        <div className="courses-list">
                            {userData.courses.map(course => (
                                <div className="course-item" key={course.id}>
                                    <span className="course-name">{course.name}</span>
                                    <div className="progress-bar-container">
                                        <div className="progress-bar-fill" style={{ width: `${course.percentage}%` }}></div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="dashboard-card">
                        <input
                            type="file"
                            ref={resumeInputRef}
                            style={{ display: 'none' }}
                            accept=".pdf,.doc,.docx"
                            onChange={handleResumeChange}
                        />

                        {!userData.resumeUploaded ? (
                            <>
                                <h4 className="card-title purple-text"><i className="fa-solid fa-file-invoice"></i> Resume</h4>
                                <div className="resume-upload-zone">
                                    <div className="upload-icon-wrapper">
                                        <i className="fa-solid fa-cloud-arrow-up"></i>
                                    </div>
                                    <p className="upload-text">No resume uploaded</p>
                                    <p className="upload-subtext">Upload your CV to get AI insights</p>
                                    <button className="btn-upload-outline" onClick={() => resumeInputRef.current.click()}>Upload PDF</button>
                                </div>
                            </>
                        ) : (
                            <div className="resume-active-container">
                                <div className="resume-header-row">
                                    <h4 className="card-title purple-text" style={{ margin: 0 }}><i className="fa-solid fa-file-invoice"></i> My Resume</h4>
                                    <span className="badge-active">Active</span>
                                </div>

                                <div className="resume-file-card">
                                    <div className="file-icon-box">
                                        <i className="fa-solid fa-file-pdf"></i>
                                    </div>
                                    <div className="file-info">
                                        <span className="file-name">{userData.resumeName}</span>
                                        <span className="file-date">Uploaded: {userData.resumeDate}</span>
                                    </div>
                                </div>

                                <button className="btn-view-resume">
                                    <i className="fa-regular fa-eye"></i> View
                                </button>

                                <div className="resume-footer-actions">
                                    <button className="btn-remove-resume" onClick={handleRemoveResume}>
                                        <i className="fa-regular fa-trash-can"></i> Remove
                                    </button>
                                    <button className="btn-replace-resume" onClick={() => resumeInputRef.current.click()}>
                                        Replace File
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}

export default Profile;