import React, { useState, useEffect } from 'react';
import './Department.css';

function Department() {
    // 1. تعريف الـ State
    const [courses, setCourses] = useState([]); // لتخزين المواد القادمة من الداتابيز
    const [loadingCourses, setLoadingCourses] = useState(true); // لعرض علامة التحميل
    const [selectedCourses, setSelectedCourses] = useState([]); // المواد التي اختارها الطالب
    const [results, setResults] = useState(null); // النتيجة النهائية (الأقسام)
    const [loadingResult, setLoadingResult] = useState(false); // تحميل النتيجة
    const [viewingDept, setViewingDept] = useState(null); // لعرض صفحة التفاصيل (Read More)

    // 2. ربط الفرونت بالباك: جلب المواد عند فتح الصفحة
    useEffect(() => {
        const fetchCourses = async () => {
            try {
                // نطلب البيانات من السيرفر
                const response = await fetch('http://localhost:5000/api/subjects');
                const data = await response.json();

                if (data.success) {
                    // 🔄 مرحلة التحويل (Mapping): تحويل بيانات الداتابيز لشكل يفهمه التصميم
                    const mappedCourses = data.data.map(subject => ({
                        // في الداتابيز اسمه course_name -> في الفرونت هنسميه name
                        name: subject.course_name, 
                        
                        // المهارات بتيجي مصفوفة -> هنحولها لنص مفصول بفاصلة
                        // لو مفيش مهارات، نعرض جزء من الوصف كبديل
                        skills: subject.skills && subject.skills.length > 0 
                            ? subject.skills.map(s => s.name).join(', ') 
                            : (subject.description ? subject.description.substring(0, 40) + '...' : 'General Concepts')
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

    // 3. دالة اختيار/إلغاء اختيار المادة
    const toggleCourse = (courseName) => {
        if (selectedCourses.includes(courseName)) {
            setSelectedCourses(selectedCourses.filter(c => c !== courseName));
        } else {
            setSelectedCourses([...selectedCourses, courseName]);
        }
    };

    // 4. دالة إرسال البيانات للباك اند للحصول على الترشيح
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
                body: JSON.stringify({ selectedCourses }) // نرسل أسماء المواد المختارة
            });

            const data = await response.json();

            if (data.success && data.results) {
                setResults(data.results);
                // نزول تلقائي للنتيجة
                setTimeout(() => {
                    window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' });
                }, 100);
            } else {
                alert("No recommendation found based on these courses.");
            }
        } catch (error) {
            console.error("Error:", error);
            alert("Connection failed!");
        } finally {
            setLoadingResult(false);
        }
    };

    // دوال التحكم في العرض
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

    const handleBack = () => {
        setViewingDept(null);
    };

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
                            {/* المواد */}
                            <div className="info-column subjects-section">
                                <h3><i className="fa-solid fa-book-open"></i> Related Subjects</h3>
                                <ul className="details-list">
                                    {viewingDept.subjects && viewingDept.subjects.length > 0 ? 
                                        viewingDept.subjects.map((s, i) => <li key={i}>{s}</li>) : <li>No subjects listed</li>}
                                </ul>
                            </div>
                            {/* المهارات */}
                            <div className="info-column skills-section">
                                <h3><i className="fa-solid fa-code"></i> Technical Skills</h3>
                                <ul className="details-list">
                                    {viewingDept.techSkills && viewingDept.techSkills.length > 0 ? 
                                        viewingDept.techSkills.map((s, i) => <li key={i}>{s}</li>) : <li>General Skills</li>}
                                </ul>
                            </div>
                            {/* الوظائف */}
                            <div className="info-column jobs-section">
                                <h3><i className="fa-solid fa-briefcase"></i> Common Jobs</h3>
                                <ul className="details-list">
                                    {viewingDept.jobs && viewingDept.jobs.length > 0 ? 
                                        viewingDept.jobs.map((j, i) => <li key={i}>{j}</li>) : <li>Software Engineer</li>}
                                </ul>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    // --- View 2: الصفحة الرئيسية (Checklist) ---
    return (
        <div className="checklist-wrapper">
            <div className="checklist-container">
                <div className="header-section">
                    <h1 className="main-title">Academic Interest Checklist</h1>
                    {!results ? (
                        <p className="sub-title">Select the courses you enjoyed the most to find your ranked majors.</p>
                    ) : (
                        <div className="result-header-actions">
                            <p className="sub-title">Here is your recommended major based on your choices.</p>
                            <button className="btn-restart" onClick={handleRestart}>
                                <i className="fa-solid fa-rotate-left"></i> Start Over
                            </button>
                        </div>
                    )}
                </div>

                {/* عرض المواد (من الداتابيز) */}
                {!results && (
                    <>
                        {loadingCourses ? (
                            <div className="loading-spinner">
                                <i className="fa-solid fa-spinner fa-spin"></i> Loading Subjects...
                            </div>
                        ) : (
                            <div className="grid-container">
                                {courses.length > 0 ? (
                                    courses.map((course, index) => (
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
                                    ))
                                ) : (
                                    <p style={{textAlign: 'center', color: '#666'}}>No subjects found in database.</p>
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

                {/* عرض النتائج */}
                {results && (
                    <div className="results-list">
                        {results.map((dept, index) => (
                            <div key={index} className={`result-card-row ${index === 0 ? 'top-choice' : ''}`}>
                                <div className="result-icon">
                                    {index === 0 ? <i className="fa-solid fa-trophy"></i> : <span className="rank-num">#{index + 1}</span>}
                                </div>
                                <div className="result-info">
                                    <div className="result-header">
                                        <h3>{dept.name}</h3>
                                        {index === 0 && <span className="badge-best-fit">Best Fit</span>}
                                    </div>
                                    <p>{dept.desc}</p>
                                    <button className="btn-read-more" onClick={() => handleReadMore(dept)}>
                                        Read More <i className="fa-solid fa-arrow-right"></i>
                                    </button>
                                </div>
                                <div className="result-score"><span>{dept.score}</span> pts</div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}

export default Department;