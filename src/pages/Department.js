import React, { useState } from 'react';
import './Department.css';

const coursesData = [
    { name: "Compiler Theory", skills: "Parsing, Lexical Analysis" },
    { name: "Artificial Intelligence", skills: "Search Algorithms, Heuristics" },
    { name: "Machine Learning", skills: "Neural Networks, Regression" },
    { name: "Data Mining", skills: "Pattern Recognition, Big Data" },
    { name: "Business Intelligence", skills: "Analytics, Reporting" },
    { name: "E-Commerce", skills: "Business Models, Payment" },
    { name: "Computer Vision", skills: "Image Processing, Recognition" },
    { name: "Game Design", skills: "Unity, Unreal Engine, Physics" },
    { name: "Digital Signal Processing", skills: "Signals, Systems, transform" },
    { name: "Embedded Systems", skills: "Microcontrollers, RTOS" },
    { name: "Robotics & Control", skills: "Sensors, Actuators, Kinematics" },
    { name: "Computer Architecture", skills: "CPU Design, Assembly" }
];

function Department() {
    const [selectedCourses, setSelectedCourses] = useState([]);
    const [results, setResults] = useState(null);
    const [loading, setLoading] = useState(false);
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
            const response = await fetch('http://localhost:5000/api/departments/recommend', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ selectedCourses })
            });

            const data = await response.json();

            if (response.ok) {
                setResults(data.results);
                setTimeout(() => {
                    window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' });
                }, 100);
            } else {
                alert("Error: " + (data.error || "Unknown error"));
            }
        } catch (error) {
            console.error("Connection Error:", error);
            alert("Failed to connect. Ensure backend is running.");
        } finally {
            setLoading(false);
        }
    };

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

    // عرض صفحة التفاصيل
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

    return (
        <div className="checklist-wrapper">
            <div className="checklist-container">
                <div className="header-section">
                    <h1 className="main-title">Academic Interest Checklist</h1>
                    {!results ? (
                        <p className="sub-title">Select the courses you enjoyed the most.</p>
                    ) : (
                        <div className="result-header-actions">
                            <p className="sub-title">Here represent your top matches ranked by score.</p>
                            <button className="btn-restart" onClick={handleRestart}>
                                <i className="fa-solid fa-rotate-left"></i> Change Selection
                            </button>
                        </div>
                    )}
                </div>

                {!results && (
                    <>
                        <div className="grid-container">
                            {coursesData.map((course, index) => (
                                <div
                                    key={index}
                                    className={`course-card ${selectedCourses.includes(course.name) ? 'card-selected' : ''}`}
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

                {results && (
                    <div className="results-list">
                        {results.map((dept, index) => {
                            const isTopChoice = index === 0;
                            return (
                                <div key={index} className={`result-card-row ${isTopChoice ? 'top-choice' : ''}`}>
                                    <div className="result-icon">
                                        {isTopChoice ? <i className="fa-solid fa-trophy"></i> : <span>#{index + 1}</span>}
                                    </div>
                                    <div className="result-info">
                                        <div className="result-header">
                                            <h3>{dept.name}</h3>
                                            {isTopChoice && <span className="badge-best-fit">Best Fit</span>}
                                        </div>
                                        <p className="result-desc">{dept.desc}</p>
                                        <button className="btn-read-more" onClick={() => handleReadMore(dept)}>
                                            Read More <i className="fa-solid fa-arrow-right"></i>
                                        </button>
                                    </div>
                                    <div className="result-score">
                                        <span className="score-num">{dept.score}</span>
                                        <span className="score-label">pts</span>
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