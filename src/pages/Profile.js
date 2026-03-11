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
    const [jobOptions, setJobOptions] = useState([]);

    const [editForm, setEditForm] = useState({ fullName: "", email: "", role: "", bio: "" });

    const [userData, setUserData] = useState({
        fullName: "Loading...",
        email: "...",
        bio: "...",
        profilePic: "https://via.placeholder.com/150",
        role: "Student",
        averageScore: 0,
        interviewsDone: 0,
        resumeUploaded: false, 
        resumeName: "",        
        resumeDate: "",        
        enrolledRoadmaps: [],
        builtCvId: null
    });

    useEffect(() => {
        const fetchData = async () => {
            const userId = localStorage.getItem('userId');
            if (!userId) {
                navigate('/Sign_In');
                return;
            }

            try {
                const profileRes = await fetch(`http://localhost:5001/api/auth/profile/${userId}`);
                if (profileRes.ok) {
                    const data = await profileRes.json();
                    
                    const roadmaps = data.UserRoadmaps || [];
                    let totalProgress = 0;
                    roadmaps.forEach(r => totalProgress += (r.progress || 0));
                    const avgScore = roadmaps.length > 0 ? Math.round(totalProgress / roadmaps.length) : 0;

                    setUserData(prevState => ({
                        ...prevState,
                        fullName: data.full_name,
                        email: data.email,
                        bio: data.about_me || "No bio added yet.",
                        role: data.role || "Student",
                        profilePic: data.profile_image ? `http://localhost:5001${data.profile_image}` : "https://via.placeholder.com/150",
                        enrolledRoadmaps: roadmaps,
                        averageScore: avgScore,
                        // الربط مع بيانات الـ CV الحقيقية
                        resumeUploaded: !!data.builtCV,
                        resumeName: data.builtCV ? "AI Generated CV" : "",
                        resumeDate: data.builtCV ? new Date(data.builtCV.createdAt).toLocaleDateString() : "",
                        builtCvId: data.builtCV ? data.builtCV.id : null
                    }));
                }

                const jobsRes = await fetch('http://localhost:5001/api/jobs');
                if (jobsRes.ok) {
                    const jobsData = await jobsRes.json();
                    setJobOptions(jobsData);
                }
            } catch (error) {
                console.error("Error:", error);
            }
        };
        fetchData();
    }, [navigate]);

    const handleEditClick = () => {
        setEditForm({
            fullName: userData.fullName,
            email: userData.email,
            role: userData.role || "Student", 
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

    const handleSaveChanges = async () => {
        const userId = localStorage.getItem('userId');
        const formData = new FormData();
        formData.append('full_name', editForm.fullName);
        formData.append('email', editForm.email);
        formData.append('role', editForm.role);
        formData.append('bio', editForm.bio);
        if (imageFile) formData.append('profileImage', imageFile);

        try {
            const response = await fetch(`http://localhost:5001/api/auth/profile/${userId}`, {
                method: 'PUT',
                body: formData,
            });
            const data = await response.json();
            if (response.ok) {
                if (data.user.profile_image) localStorage.setItem('userImage', data.user.profile_image);
                window.location.reload();
            }
        } catch (error) { console.error(error); }
    };

    const handleLogout = () => {
        localStorage.clear();
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
                    <div className="avatar-wrapper">
                        <img src={isEditing ? previewImage : userData.profilePic} className="avatar-img" alt="Profile" />
                        {isEditing && (
                            <div className="camera-overlay" onClick={() => profileImageInputRef.current.click()}>
                                <i className="fa-solid fa-camera fa-xl"></i>
                            </div>
                        )}
                        <input type="file" ref={profileImageInputRef} onChange={handleImageChange} style={{ display: 'none' }} accept="image/*" />
                    </div>
                    {!isEditing && <button className="btn-edit" onClick={handleEditClick}><i className="fa-solid fa-pen-to-square"></i> Edit Profile</button>}
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
                    <div className="edit-form-container" style={{ padding: '20px 30px' }}>
                        <div className="form-group"><label>Full Name</label><input type="text" name="fullName" value={editForm.fullName} onChange={handleInputChange} className="form-input" /></div>
                        <div className="form-group"><label>Current Role</label>
                            <select name="role" value={editForm.role} onChange={handleInputChange} className="form-select">
                                <option value="Student">Student</option>
                                {jobOptions.map(job => <option key={job.id} value={job.title}>{job.title}</option>)}
                            </select>
                        </div>
                        <div className="form-group"><label>Email</label><input type="email" name="email" value={editForm.email} onChange={handleInputChange} className="form-input" /></div>
                        <div className="form-group"><label>Bio</label><textarea name="bio" value={editForm.bio} onChange={handleInputChange} rows="4" className="form-textarea" /></div>
                        <div className="edit-actions">
                            <button className="edit-btn btn-cancel" onClick={() => setIsEditing(false)}>Cancel</button>
                            <button className="edit-btn btn-save" onClick={handleSaveChanges}>Save Changes</button>
                        </div>
                    </div>
                )}

                <div className="stats-container">
                    <div className="stat-card score-card"><span className="stat-value">{userData.averageScore}%</span><span className="stat-label">Avg. Progress</span></div>
                    <div className="stat-card completed-card"><span className="stat-value">{userData.enrolledRoadmaps.length}</span><span className="stat-label">Active Paths</span></div>
                </div>

                <div className="dashboard-grid">
                    <div className="dashboard-card">
                        <h4 className="card-title"><i className="fa-solid fa-chart-line"></i> My Learning Paths</h4>
                        <div className="courses-list">
                            {userData.enrolledRoadmaps.map(enrollment => (
                                <div className="course-item" key={enrollment.id} onClick={() => navigate(`/roadmap/${enrollment.roadmapId}`)} style={{cursor: 'pointer'}}>
                                    <div className="course-info"><span className="course-name">{enrollment.Roadmap?.title}</span><span className="course-count">{enrollment.progress}%</span></div>
                                    <div className="progress-bar-container"><div className="progress-bar-fill" style={{ width: `${enrollment.progress}%` }}></div></div>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="dashboard-card">
                        <h4 className="card-title purple-text"><i className="fa-solid fa-file-invoice"></i> Resume</h4>
                        {!userData.resumeUploaded ? (
                            <div className="resume-upload-zone">
                                <p className="upload-text">No resume uploaded</p>
                                <button className="btn-upload-outline" onClick={() => navigate('/cv-builder')}>Create One Now</button>
                            </div>
                        ) : (
                            <div className="resume-active-container">
                                <div className="resume-file-card">
                                    <div className="file-icon-box"><i className="fa-solid fa-file-pdf"></i></div>
                                    <div className="file-info"><span className="file-name">{userData.resumeName}</span><span className="file-date">Saved on: {userData.resumeDate}</span></div>
                                </div>
                                <div className="resume-footer-actions">
                                    {/* روابط الـ Preview والـ Download الحقيقية */}
                                    <a href={`http://localhost:5001/api/cv-builder/preview/${userData.builtCvId}`} target="_blank" rel="noreferrer" className="btn-view-resume">View</a>
                                    <a href={`http://localhost:5001/api/cv-builder/download/${userData.builtCvId}`} target="_blank" rel="noreferrer" className="btn-Download-resume">Download PDF</a>
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