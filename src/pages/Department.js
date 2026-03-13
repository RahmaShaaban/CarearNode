import React, { useState, useEffect } from 'react';
import './Department.css';

function Department() {
    // --- States ---
    const [courses, setCourses] = useState([]); 
    const [loadingCourses, setLoadingCourses] = useState(true);
    const [selectedCourses, setSelectedCourses] = useState([]);
    const [results, setResults] = useState(null);
    const [loadingResult, setLoadingResult] = useState(false);
    const [viewingDept, setViewingDept] = useState(null);
    const [error, setError] = useState(null); // لإظهار أي خطأ للمستخدم
    const [showAllSkills, setShowAllSkills] = useState(false);
    // --- 1. جلب المواد عند التحميل ---
    useEffect(() => {
        const fetchCourses = async () => {
            try {
                const response = await fetch('http://localhost:5001/api/subjects');
                const data = await response.json();

                if (data.success) {
                    const mappedCourses = data.data.map(subject => ({
                        id: subject.id,
                        name: subject.course_name, 
                        // عرض جزء من الوصف كـ تلميح
                        skills: subject.description 
                            ? subject.description.substring(0, 60) + (subject.description.length > 60 ? '...' : '') 
                            : 'Core Subject'
                    }));
                    setCourses(mappedCourses);
                } else {
                    setError("Failed to load subjects.");
                }
            } catch (err) {
                console.error("Error connecting to server:", err);
                setError("Server connection failed. Please try again later.");
            } finally {
                setLoadingCourses(false);
            }
        };

        fetchCourses();
    }, []);

    // --- 2. دوال التحكم ---
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
        setError(null);

        try {
            const response = await fetch('http://localhost:5001/api/dept/recommend', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ selectedCourses })
            });
            const data = await response.json();
            
            if (data.success && data.results) {
                setResults(data.results);
                // التمرير التلقائي لأسفل لرؤية النتيجة
                setTimeout(() => window.scrollTo({ top: 0, behavior: 'smooth' }), 100);
            } else {
                alert("No recommendation found. Try selecting different courses.");
            }
        } catch (err) {
            console.error(err);
            alert("Connection failed! Make sure the backend is running.");
        } finally {
            setLoadingResult(false);
        }
    };

    // دوال التنقل
    const handleRestart = () => { 
        setResults(null); 
        setSelectedCourses([]); 
        setViewingDept(null); 
        window.scrollTo({ top: 0, behavior: 'smooth' }); 
    };

    const handleReadMore = (dept) => { 
        setViewingDept(dept); 
        {/* تاني تعديل */ }


        setShowAllSkills(false);




        {/* تاني تعديل  نهاية*/ }
        window.scrollTo({ top: 0, behavior: 'smooth' }); 
    };

    const handleBack = () => setViewingDept(null);

    // --- 3. View: صفحة التفاصيل (Read More) ---
    // --- 3. View: صفحة التفاصيل (Read More) ---
if (viewingDept) {
    // تأكدي أننا نقرأ allSubjects الذي أرسلناه من الباك إند
    const fullSyllabus = viewingDept.allSubjects || []; 
    const matchedOnly = viewingDept.matchedSubjects || []; // المواد اللي الطالب اختارها فعلاً
    const skillsList = viewingDept.techSkills || [];
    const jobsList = viewingDept.jobs || [];

    return (
        <div className="checklist-wrapper">
            <div className="checklist-container">
                <button className="btn-back" onClick={handleBack}>
                    <i className="fa-solid fa-arrow-left"></i> Back to Results
                </button>
                
                <div className="department-details-card">
                    <div className="details-header">
                        <h2>{viewingDept.name}</h2>
                        <p className="details-description">{viewingDept.desc}</p>
                    </div>
                    
                    <div className="details-info-grid">
                        {/* عمود المواد: يعرض كل مواد القسم مع تمييز المختارة */}
                        <div className="info-column subjects-section">
                            <h3><i className="fa-solid fa-book-open"></i> Department Syllabus</h3>

                            <ul className="details-list">
                                {fullSyllabus.length > 0 ? (
                                    fullSyllabus.map((s, i) => {

                                        const cleanS = s.trim();
                                        const isMatched = matchedOnly.some(m => m.trim() === cleanS);
                                        // 2. المقارنة الذكية: هل المادة دي موجودة في قائمة اختيارات الطالب؟
                                        // بنستخدم .some عشان نلف على اختيارات الطالب وننظفها بردو قبل المقارنة

                                        // نتحقق هل المادة دي الطالب اختارها؟
                                        //const isMatched = matchedOnly.includes(s);
                                        return (
                                            <li key={i} className={isMatched ? "matched-item" : ""}

                                                style={{



                                                    fontWeight: isMatched ? '800' : 'normal',
                                                   // color: isMatched ? '#000' : 'inherit',
                                                    //backgroundColor: isMatched ? '#e0f2fe' : 'transparent', // خلفية خفيفة للتأكيد (اختياري)
                                                    //padding: isMatched ? '2px 8px' : '0',
                                                   // borderRadius: '4px'
                                                }}


                                            >
                                            {s}
                                            </li>


                                        );


                                    })
                                ) : (
                                    <li className="empty-msg">Syllabus loading or not found.</li>
                                )}
                            </ul>
                        </div>

                        {/* عمود المهارات */}
                        <div className="info-column skills-section">
                            <h3><i className="fa-solid fa-code"></i> Skills You'll Learn</h3>
                            <ul className="details-list">
                                

                        {/*تالت تعديل */}

                                {/*تالت تعديل */}

                                {/* 3. (تعديل جديد) عمود المهارات مع منطق الـ Show More و Show Less */}

                                {skillsList.length > 0 ? (
                                    // نعرض إما القائمة كاملة أو أول 15 عنصر فقط بناءً على الحالة
                                    (showAllSkills ? skillsList : skillsList.slice(0, 15)).map((s, i) => (
                                        <li key={i}>{s}</li>
                                    ))
                                ) : (
                                    <li>Core Skills</li>
                                )}
                            </ul>

                            {/* الزرار الذكي: يظهر لو العناصر أكتر من 15، ويغير شكله ووظيفته */}
                            {skillsList.length > 15 && (
                                <button
                                    onClick={() => setShowAllSkills(!showAllSkills)} // هنا بنعكس الحالة (لو مفتوح يقفل والعكس)
                                    style={{
                                        background: 'transparent',
                                        border: 'none',
                                        color: '#355d55', // نفس لون الثيم بتاعك
                                        cursor: 'pointer',
                                        fontSize: '0.9rem',
                                        fontWeight: 'bold',
                                        marginTop: '10px',
                                        textDecoration: 'underline',
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '5px'
                                    }}
                                >
                                    {showAllSkills ? (
                                        // الشكل لما تكون القائمة مفتوحة
                                        <>
                                            Show Less <i className="fa-solid fa-angle-up"></i>
                                        </>
                                    ) : (
                                        // الشكل لما تكون القائمة مقفولة
                                        <>
                                            Show More <i className="fa-solid fa-angle-down"></i>
                                        </>
                                    )}
                                </button>
                            )}
                        </div>

                        {/*تالت تعديل نهاية */}

                        {/*تالت تعديل نهاية */}

                        {/* عمود الوظائف */}
                        <div className="info-column jobs-section">
                            <h3><i className="fa-solid fa-briefcase"></i> Career Paths</h3>
                            <ul className="details-list">
                                {jobsList.length > 0 ? jobsList.map((j, i) => <li key={i}>{j}</li>) : <li>Software Roles</li>}
                            </ul>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );

    }

    // --- 4. View: الصفحة الرئيسية ---
    return (
        <div className="checklist-wrapper">
            <div className="checklist-container">
                <div className="header-section">
                    <h1 className="main-title">Academic Interest Checklist</h1>
                    
                    {error && <div className="error-banner">{error}</div>}

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
                                                <h3>{course.name}</h3>
                                                {selectedCourses.includes(course.name) && <i className="fa-solid fa-check-circle check-icon"></i>}
                                            </div>
                                            <p className="skills-text">{course.skills}</p>
                                        </div>
                                    ))
                                ) : (
                                    !error && <p className="no-data-msg">No subjects found.</p>
                                )}
                            </div>
                        )}
                        
                        <div className="button-container">
                            <button className="btn-recommend" onClick={handleRecommend} disabled={loadingResult || loadingCourses || courses.length === 0}>
                                {loadingResult ? "Analyzing..." : "Recommend Department"}
                            </button>
                        </div>
                    </>
                )}
                
                {/* قسم النتائج */}
                {results && (
                      <div className="results-list">
                        {results.map((dept, index) => {
                            const isTop = index === 0;
                            return (
                                <div key={index} className={`result-card-row ${isTop ? 'top-choice' : ''}`}>
                                    <div className="result-icon">
                                        {isTop ? <i className="fa-solid fa-trophy"></i> : <span className="rank-num">#{index + 1}</span>}
                                    </div>
                                    <div className="result-info">
                                        <div className="result-header">
                                            <h3>{dept.name}</h3>
                                            {isTop && <span className="badge-best-fit">Best Fit</span>}
                                        </div>
                                        <p>{dept.desc}</p>
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