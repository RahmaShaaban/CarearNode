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
    const [results, setResults] = useState(null); // ????? ????? ?? results ???
    const [loading, setLoading] = useState(false);

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
                setResults(data.results); // ????? ??????? ????
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
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

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
                                <i className="fa-solid fa-rotate-left"></i> Start Over
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

                {/* ??? ????? ???? ????? ??????? ?? ?????? ?????? */}
                {results && (
                    <div className="results-list">
                        {results.map((dept, index) => {
                            const isTopChoice = index === 0; // ????? ?? ?? ???? ????
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
                                        <button className="btn-read-more">
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