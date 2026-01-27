// import React from 'react';

// function Profile() {
//     return (
//         <h1>Profile page</h1>
//     )
// } export default Profile;

import React from 'react';
import './Profile.css';

function Profile({ profileImage, fullName, role, bio, email }) {
    return (
        <div className="profile-page-container">
            {/* 1. Profile Banner Section */}
            <div className="profile-hero">
                <div className="profile-banner"></div> {/* الجزء الموف اللي فوق */}
                <div className="profile-info-card">
                    <div className="profile-avatar-wrapper">
                        <img 
                            src={profileImage || 'default-avatar.png'} 
                            alt="User" 
                            className="profile-main-img" 
                        />
                        <div className="online-status-dot"></div>
                    </div>
                    <div className="user-text-info">
                        <h1>{fullName || "Demo User"}</h1>
                        <p>{role || "Student"} • {email}</p>
                    </div>
                    <div className="profile-actions">
                        <button className="btn-settings">Settings</button>
                        <button className="btn-edit">Edit Profile</button>
                    </div>
                </div>
            </div>

            {/* 2. Bio Section */}
            <div className="profile-bio-card">
                <h3>About Me</h3>
                <p>{bio || "Welcome back! This is your bio area."}</p>
            </div>

            {/* 3. Stats Section (Grid) */}
            <div className="profile-stats-grid">
                <div className="stat-card">
                    <div className="icon-blue">🏆</div>
                    <h2>0%</h2>
                    <p>Average Interview Score</p>
                </div>
                <div className="stat-card">
                    <div className="icon-green">✅</div>
                    <h2>0</h2>
                    <p>Interviews Completed</p>
                </div>
            </div>
        </div>
    );
} export default Profile;