import React, { useState } from 'react';
import './Department.css';

// ????? ?????? (?????? ?????? ????? ??? ???? ???????? ???? ??)
const coursesData = [
    // ???? CS & AI
    { name: "Introduction to Programming", skills: "Logic, C++, Problem Solving" },
    { name: "Data Structures & Algorithms", skills: "Optimization, Graphs, Trees" },
    { name: "Artificial Intelligence", skills: "Search Algorithms, Heuristics" },
    { name: "Machine Learning", skills: "Neural Networks, Regression" },
    { name: "Operating Systems", skills: "Process Management, Memory" },

    // ???? IS
    { name: "Software Engineering", skills: "SDLC, Agile, Design Patterns" },
    { name: "Database Systems", skills: "SQL, Normalization, Indexing" },
    { name: "System Analysis & Design", skills: "UML, Requirements" },
    { name: "E-Commerce", skills: "Business Models, Payment" },
    { name: "Project Management", skills: "Planning, Risk Management" },

    // ???? IT
    { name: "Computer Networks", skills: "TCP/IP, OSI Model, Routing" },
    { name: "Network Security", skills: "Firewalls, VPNs, IDS/IPS" },
    { name: "Cryptography", skills: "Encryption, Hashing" },
    { name: "Linear Algebra", skills: "Vectors, Matrices" },
    { name: "Probability & Statistics", skills: "Distributions, Hypothesis" }
];

function Department() {
    const [selectedCourses, setSelectedCourses] = useState([]);
    const [results, setResults] = useState(null); // ??? ????? ????? ???????
    const [loading, setLoading] = useState(false);

    // ???? ?????? ??????
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
            const response = await fetch('http://localhost:5000/api/dept/recommend', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ selectedCourses })
            });

            const data = await response.json();

            console.log("Data from server:", data); // ??? ???? ???? ???????? ?? ????????

            if (response.ok) {
                if (data.results) {
                    setResults(data.results);
                    // ??????? ???: ???? ???? ?????? ???? ????? ???????
                    setTimeout(() => {
                        window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' });
                    }, 100);
                } else {
                    alert("Backend returned empty results. Check deptController.js!");
                }
            } else {
                alert("Error: " + data.error);
            }
        } catch (error) {
            console.error("Connection Error:", error);
            alert("Failed to connect to server.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="checklist-container">
            {/* ??????: ????? ??? ???? ?????? ?? ??????? ???? */}
            <div className="header-section">
                <h1 className="main-title">Academic Interest Checklist</h1>

                {!results ? (
                    <p className="sub-title">Select the courses you enjoyed the most to find your ranked majors.</p>
                ) : (
                    <div className="result-header-actions">
                        <p className="sub-title">Here is your recommended major based on your skills.</p>
                        <button className="btn-restart" onClick={() => { setResults(null); setSelectedCourses([]); }}>
                            <i className="fa-solid fa-rotate-left"></i> Start Over
                        </button>
                    </div>
                )}
            </div>

            {/* 1. ??? ????? ?????? (?????? ??? ??????? ????) */}
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

            {/* 2. ??? ??????? (????? ?? ??? results ???? ???? ????) */}
            {results && (
                <div className="results-list">
                    {results.map((dept, index) => (
                        <div key={index} className={`result-card-row ${index === 0 ? 'top-choice' : ''}`}>

                            {/* ???????? */}
                            <div className="result-icon">
                                {index === 0 ? <i className="fa-solid fa-trophy"></i> : <span className="rank-num">#{index + 1}</span>}
                            </div>

                            {/* ?????? ????? */}
                            {/* ?????? ????? */}
                            <div className="result-info">
                                <div className="result-header">
                                    <h3>{dept.name}</h3>
                                    {index === 0 && <span className="badge-best-fit">Best Fit</span>}
                                </div>
                                <p>{dept.desc}</p>

                                {/* >>>> ??????? ??? <<<< */}
                                <button className="btn-read-more">
                                    Read More <i className="fa-solid fa-arrow-right"></i>
                                </button>
                            </div>

                            {/* ?????? */}
                            <div className="result-score">
                                <span>{dept.score}</span> pts
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}

export default Department;