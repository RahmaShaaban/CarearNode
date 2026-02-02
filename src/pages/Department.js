import React, { useState, useEffect } from 'react';
import './Department.css';

function Department() {
    // --- 1. تعريف الـ States ---
    const [courses, setCourses] = useState([]); 
    const [loadingCourses, setLoadingCourses] = useState(true);
    const [selectedCourses, setSelectedCourses] = useState([]);
    const [results, setResults] = useState(null);
    const [loadingResult, setLoadingResult] = useState(false);
    const [viewingDept, setViewingDept] = useState(null);

    // --- 2. جلب المواد عند فتح الصفحة ---
    useEffect(() => {
        const fetchCourses = async () => {
            try {
                const response = await fetch('http://localhost:5000/api/subjects');
                const data = await response.json();

                if (data.success) {
                    // تحويل البيانات (Mapping)
                    const mappedCourses = data.data.map(subject => ({
                        id: subject.id, // ✅ أضفنا الـ ID عشان الأداء يكون أفضل
                        name: subject.course_name, 
                        // عرض الوصف مكان المهارات مؤقتاً
                        skills: subject.description 
                            ? subject.description.substring(0, 55) + (subject.description.length > 55 ? '...' : '')
                            : 'Core Computer Science Subject'
                    }));
                    setCourses(mappedCourses);
                } else {
                    console.error("Failed to load courses");
                }
            } catch (error) {
                console.error("Error connecting to server:", error);
            } finally {
                setLoadingCourses(false);
            }
        };

        fetchCourses();
    }, []);

    // --- 3. دوال التعامل مع الأحداث ---
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
        setLoadingResult(true);
        try {
            const response = await fetch('http://localhost:5000/api/dept/recommend', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ selectedCourses })
            });
            const data = await response.json();
            
            if (data.success && data.results) {
                setResults(data.results);
                setTimeout(() => window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' }), 100);
            } else {
                alert("No recommendation found.");
            }
        } catch (error) {
            console.error(error);
            alert("Connection failed! Make sure the backend is running.");
        } finally {
            setLoadingResult(false);
        }
    };

    // دوال التنقل
    const handleRestart = () => { setResults(null); setSelectedCourses([]); setViewingDept(null); window.scrollTo({ top: 0, behavior: 'smooth' }); };
    const handleReadMore = (dept) => { setViewingDept(dept); window.scrollTo({ top: 0, behavior: 'smooth' }); };
    const handleBack = () => setViewingDept(null);

    // --- View 1: صفحة التفاصيل (Read More) ---
    if (viewingDept) {
        return (
            <div className="checklist-wrapper">
                 <div className="checklist-container">
                    <button className="btn-back" onClick={handleBack}>
                        <i className="fa-solid fa-arrow-left"></i> Back to Recommendations
                    </button>
                    
                    <div className="department-details-card">
                        <div className="details-header">
                            <div className="details-main-icon"><i className="fa-solid fa-brain"></i></div>
                            <h2>{viewingDept.name}</h2>
                            <p className="details-description">{viewingDept.desc}</p>
                        </div>
                        
                        <div className="details-info-grid">
                            <div className="info-column subjects-section">
                                <h3><i className="fa-solid fa-book-open"></i> Related Subjects</h3>
                                <ul className="details-list">
                                    {/* حماية إضافية لو المصفوفة فاضية */}
                                    {viewingDept.subjects && viewingDept.subjects.length > 0 
                                        ? viewingDept.subjects.map((s, i) => <li key={i}>{s}</li>) 
                                        : <li className="empty-msg">General Subjects</li>}
                                </ul>
                            </div>
                            <div className="info-column skills-section">
                                <h3><i className="fa-solid fa-code"></i> Technical Skills</h3>
                                <ul className="details-list">
                                    {viewingDept.techSkills && viewingDept.techSkills.length > 0 
                                        ? viewingDept.techSkills.map((s, i) => <li key={i}>{s}</li>) 
                                        : <li className="empty-msg">Core Skills</li>}
                                </ul>
                            </div>
                            <div className="info-column jobs-section">
                                <h3><i className="fa-solid fa-briefcase"></i> Common Jobs</h3>
                                <ul className="details-list">
                                    {viewingDept.jobs && viewingDept.jobs.length > 0 
                                        ? viewingDept.jobs.map((j, i) => <li key={i}>{j}</li>) 
                                        : <li className="empty-msg">Tech Roles</li>}
                                </ul>
                            </div>
                        </div>
                    </div>
                 </div>
            </div>
        );
    }

    // --- View 2: الصفحة الرئيسية ---
    return (
        <div className="checklist-wrapper">
            <div className="checklist-container">
                <div className="header-section">
                    <h1 className="main-title">Academic Interest Checklist</h1>
                    {!results ? (
                        <p className="sub-title">Select the courses you enjoyed the most.</p>
                    ) : (
                        <div className="result-header-actions">
                            <p className="sub-title">Here is your recommended major.</p>
                            <button className="btn-restart" onClick={handleRestart}>
                                <i className="fa-solid fa-rotate-left"></i> Start Over
                            </button>
                        </div>
                    )}
                </div>

                {/* قسم اختيار المواد */}
                {!results && (
                    <>
                        {loadingCourses ? (
                            <div className="loading-container">
                                <i className="fa-solid fa-spinner fa-spin"></i> Loading Subjects...
                            </div>
                        ) : (
                            <div className="grid-container">
                                {courses.length > 0 ? (
                                    courses.map((course) => (
                                        <div key={course.id || course.name} 
                                             className={`card ${selectedCourses.includes(course.name) ? 'card-selected' : ''}`}
                                             onClick={() => toggleCourse(course.name)}>
                                            <div className="card-top">
                                                <h3 className="course-title">{course.name}</h3>
                                                <div className={`circle-check ${selectedCourses.includes(course.name) ? 'checked' : ''}`}></div>
                                            </div>
                                            <p className="skills-text">{course.skills}</p>
                                        </div>
                                    ))
                                ) : (
                                    <p className="no-data-msg">No subjects found in database.</p>
                                )}
                            </div>
                        )}
                        <div className="button-container">
                            <button className="btn-recommend" onClick={handleRecommend} disabled={loadingResult || loadingCourses}>
                                {loadingResult ? "Analyzing..." : "Recommend Department"}
                            </button>
                        </div>
                    </>
                )}
                
                {/* قسم النتائج (بالتصميم الكامل) */}
                {results && (
                     <div className="results-list">
                        {results.map((dept, index) => {
                            const isTopChoice = index === 0;
                            return (
                                <div key={index} className={`result-card-row ${isTopChoice ? 'top-choice' : ''}`}>
                                    {/* 1. الأيقونة (كأس أو رقم) */}
                                    <div className="result-icon">
                                        {isTopChoice ? <i className="fa-solid fa-trophy"></i> : <span className="rank-num">#{index + 1}</span>}
                                    </div>
                                    
                                    {/* 2. بيانات القسم */}
                                    <div className="result-info">
                                        <div className="result-header">
                                            <h3>{dept.name}</h3>
                                            {isTopChoice && <span className="badge-best-fit">Best Fit</span>}
                                        </div>
                                        <p>{dept.desc}</p>
                                        <button className="btn-read-more" onClick={() => handleReadMore(dept)}>
                                            Read More <i className="fa-solid fa-arrow-right"></i>
                                        </button>
                                    </div>

                                    {/* 3. النقاط */}
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