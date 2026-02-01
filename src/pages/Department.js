import React, { useState } from 'react';
import './Department.css';

// 1. استخدمنا بيانات الكورسات من نسختك (HEAD) لأنها منظمة ومقسمة
const coursesData = [
    // قسم CS & AI
    { name: "Introduction to Programming", skills: "Logic, C++, Problem Solving" },
    { name: "Data Structures & Algorithms", skills: "Optimization, Graphs, Trees" },
    { name: "Artificial Intelligence", skills: "Search Algorithms, Heuristics" },
    { name: "Machine Learning", skills: "Neural Networks, Regression" },
    { name: "Operating Systems", skills: "Process Management, Memory" },

    // قسم IS
    { name: "Software Engineering", skills: "SDLC, Agile, Design Patterns" },
    { name: "Database Systems", skills: "SQL, Normalization, Indexing" },
    { name: "System Analysis & Design", skills: "UML, Requirements" },
    { name: "E-Commerce", skills: "Business Models, Payment" },
    { name: "Project Management", skills: "Planning, Risk Management" },

    // قسم IT
    { name: "Computer Networks", skills: "TCP/IP, OSI Model, Routing" },
    { name: "Network Security", skills: "Firewalls, VPNs, IDS/IPS" },
    { name: "Cryptography", skills: "Encryption, Hashing" },
    { name: "Linear Algebra", skills: "Vectors, Matrices" },
    { name: "Probability & Statistics", skills: "Distributions, Hypothesis" }
];

function Department() {
    const [selectedCourses, setSelectedCourses] = useState([]);
    const [results, setResults] = useState(null);
    const [loading, setLoading] = useState(false);
    // أضفنا الـ State الجديدة من التحديث عشان ميزة التفاصيل تشتغل
    const [viewingDept, setViewingDept] = useState(null);

    const toggleCourse = (courseName) => {
        if (selectedCourses.includes(courseName)) {
            setSelectedCourses(selectedCourses.filter(c => c !== courseName));
        } else {
            setSelectedCourses([...selectedCourses, courseName]);
        }
    };

    const handleRecommend = async () => {
        if (selectedCourses.length === 0) {
            alert("Please select at least one course.");
            return;
        }

        setLoading(true);
        try {
            // 2. استخدمنا الرابط الصحيح من نسختك (/api/dept) المتوافق مع server.js
            const response = await fetch('http://localhost:5000/api/dept/recommend', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ selectedCourses })
            });

            const data = await response.json();
            console.log("Data from server:", data);

            if (response.ok) {
                if (data.results) {
                    setResults(data.results);
                    setTimeout(() => {
                        window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' });
                    }, 100);
                } else {
                    alert("Backend returned empty results.");
                }
            } else {
                alert("Error: " + (data.error || data.message || "Unknown error"));
            }
        } catch (error) {
            console.error("Connection Error:", error);
            alert("Failed to connect to server.");
        } finally {
            setLoading(false);
        }
    };

    // دوال التحكم في العرض (من التحديث الجديد)
    const handleRestart = () => {
        setResults(null);
        setSelectedCourses([]);
        setViewingDept(null);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const handleReadMore = (dept) => {
        setViewingDept(dept);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const handleBackToRecommendations = () => {
        setViewingDept(null);
    };

    // 3. عرض صفحة التفاصيل (من التحديث الجديد - Feature قوية)
    if (viewingDept) {
        return (
            <div className="checklist-wrapper">
                <div className="checklist-container">
                    <button className="btn-back" onClick={handleBackToRecommendations}>
                        <i className="fa-solid fa-arrow-left"></i> Back to Recommendations
                    </button>

                    <div className="department-details-card">
                        <div className="details-header">
                            <div className="details-main-icon">
                                <i className="fa-solid fa-brain"></i>
                            </div>
                            <h2>{viewingDept.name}</h2>
                            <p className="details-description">{viewingDept.desc}</p>
                        </div>

                        <div className="details-info-grid">
                            <div className="info-column subjects-section">
                                <h3><i className="fa-solid fa-book-open"></i> Distinct Subjects</h3>
                                <ul className="details-list">
                                    {viewingDept.subjects?.map((item, i) => <li key={i}>{item}</li>)}
                                </ul>
                            </div>

                            <div className="info-column skills-section">
                                <h3><i className="fa-solid fa-code"></i> Technical Skills</h3>
                                <ul className="details-list">
                                    {viewingDept.techSkills?.map((item, i) => <li key={i}>{item}</li>)}
                                </ul>
                            </div>

                            <div className="info-column jobs-section">
                                <h3><i className="fa-solid fa-briefcase"></i> Common Jobs</h3>
                                <ul className="details-list">
                                    {viewingDept.jobs?.map((item, i) => <li key={i}>{item}</li>)}
                                </ul>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    // العرض الرئيسي (Checklist + Results)
    return (
        <div className="checklist-wrapper">
            <div className="checklist-container">
                <div className="header-section">
                    <h1 className="main-title">Academic Interest Checklist</h1>

                    {!results ? (
                        <p className="sub-title">Select the courses you enjoyed the most to find your ranked majors.</p>
                    ) : (
                        <div className="result-header-actions">
                            <p className="sub-title">Here is your recommended major based on your skills.</p>
                            <button className="btn-restart" onClick={handleRestart}>
                                <i className="fa-solid fa-rotate-left"></i> Start Over
                            </button>
                        </div>
                    )}
                </div>

                {/* قائمة الكورسات */}
                {!results && (
                    <>
                        <div className="grid-container">
                            {coursesData.map((course, index) => (
                                <div
                                    key={index}
                                    className={`card ${selectedCourses.includes(course.name) ? 'card-selected' : ''}`}
                                    onClick={() => toggleCourse(course.name)}
                                >
                                    <div className="card-top">
                                        <h3 className="course-title">{course.name}</h3>
                                        <div className={`circle-check ${selectedCourses.includes(course.name) ? 'checked' : ''}`}></div>
                                    </div>
                                    <p className="skills-text">{course.skills}</p>
                                </div>
                            ))}
                        </div>

                        <div className="button-container">
                            <button className="btn-recommend" onClick={handleRecommend} disabled={loading}>
                                {loading ? "Analyzing..." : "Recommend Department"}
                            </button>
                        </div>
                    </>
                )}

                {/* قائمة النتائج (بالتصميم الجديد) */}
                {results && (
                    <div className="results-list">
                        {results.map((dept, index) => {
                            const isTopChoice = index === 0;
                            return (
                                <div key={index} className={`result-card-row ${isTopChoice ? 'top-choice' : ''}`}>
                                    <div className="result-icon">
                                        {isTopChoice ? <i className="fa-solid fa-trophy"></i> : <span className="rank-num">#{index + 1}</span>}
                                    </div>

                                    <div className="result-info">
                                        <div className="result-header">
                                            <h3>{dept.name}</h3>
                                            {isTopChoice && <span className="badge-best-fit">Best Fit</span>}
                                        </div>
                                        <p>{dept.desc}</p>

                                        {/* زرار Read More الجديد */}
                                        <button className="btn-read-more" onClick={() => handleReadMore(dept)}>
                                            Read More <i className="fa-solid fa-arrow-right"></i>
                                        </button>
                                    </div>

                                    <div className="result-score">
                                        <span>{dept.score}</span> pts
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>
        </div>
    );
}

export default Department;