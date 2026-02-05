import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom'; // 1. ضيفنا useNavigate
import './RoadmapDetails.css';

const RoadmapDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate(); // عشان نقدر نحوله لصفحة تسجيل الدخول
  
  // --- States البيانات الأساسية ---
  const [roadmap, setRoadmap] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // --- States الجديدة (عشان التتبع والزرار) ---
  const [userId, setUserId] = useState(localStorage.getItem('userId')); // بنجيب اليوزر من المتصفح
  const [isEnrolled, setIsEnrolled] = useState(false); // هل هو مشترك؟
  const [completedSteps, setCompletedSteps] = useState([]); // الخطوات اللي خلصها
  const [progress, setProgress] = useState(0); // نسبة التقدم

  // 1. جلب البيانات (الرودماب + حالة الاشتراك)
  useEffect(() => {
    const fetchData = async () => {
      try {
        // أ. جلب تفاصيل الرودماب
        const response = await fetch(`http://localhost:5000/api/roadmaps/${id}`);
        const data = await response.json();

        if (data.success) {
          setRoadmap(data.data);
          
          // تحديد قائمة الخطوات (سواء جت بالاسم الجديد Steps أو القديم TechSkills)
          const stepsList = data.data.Steps || data.data.TechSkills || [];

          // ب. لو اليوزر مسجل، نسأل الباك إند: "هل اليوزر ده مشترك؟"
          if (userId) {
            const statusRes = await fetch(`http://localhost:5000/api/roadmaps/status/${id}/${userId}`);
            if (statusRes.ok) {
              const statusData = await statusRes.json();
              if (statusData.enrolled) {
                setIsEnrolled(true);
                // تحويل الأرقام للتأكد
                const completed = statusData.completedSteps?.map(Number) || [];
                setCompletedSteps(completed);
                // حساب النسبة
                if (stepsList.length > 0) {
                    const percent = Math.round((completed.length / stepsList.length) * 100);
                    setProgress(percent);
                }
              }
            }
          }
        } else {
          setError("Roadmap not found");
        }
      } catch (err) {
        console.error(err);
        setError("Connection error");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [id, userId]);

  // 2. دالة الضغط على زرار Start
  const handleStartRoadmap = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/roadmaps/enroll', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, roadmapId: id })
      });

      if (response.ok) {
        setIsEnrolled(true);
        setCompletedSteps([]);
        setProgress(0);
      } else {
          alert("Failed to enroll. Please try again.");
      }
    } catch (error) {
      console.error("Enrollment failed", error);
    }
  };

  // 3. دالة التعليم على الخطوات (Checkbox)
  const handleStepToggle = async (stepId) => {
    if (!isEnrolled) return; // لو مش مشترك ميعملش حاجة

    const stepIdInt = Number(stepId);
    let newCompletedSteps;

    // إضافة أو إزالة الخطوة
    if (completedSteps.includes(stepIdInt)) {
      newCompletedSteps = completedSteps.filter(id => id !== stepIdInt);
    } else {
      newCompletedSteps = [...completedSteps, stepIdInt];
    }

    setCompletedSteps(newCompletedSteps);

    // حساب البروجرس الجديد
    const stepsList = roadmap.Steps || roadmap.TechSkills || [];
    if (stepsList.length > 0) {
        const percent = Math.round((newCompletedSteps.length / stepsList.length) * 100);
        setProgress(percent);
    }

    // إبلاغ الباك إند
    await fetch('http://localhost:5000/api/roadmaps/progress', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, roadmapId: id, completedSteps: newCompletedSteps })
    });
  };


  if (loading) return <div className="loading-center"><i className="fa-solid fa-circle-notch fa-spin"></i> Loading Details...</div>;
  if (error) return <div className="error-center">{error}</div>;
  if (!roadmap) return <div className="error-center">Roadmap not found</div>;

  // تحديد القائمة النهائية للعرض (عشان نحل مشكلة الأسماء)
  const stepsToRender = roadmap.Steps || roadmap.TechSkills || [];

  return (
    <div className="details-page">
      {/* 1. الهيدر */}
      <div className="details-header">
        <Link to="/roadmaps" className="back-btn">
            <button className="btn-back">
                <i className="fa-solid fa-arrow-left"></i> Back to Roadmaps
            </button>
        </Link>
        
        <div className="header-content-wrapper">
          <div className="header-text">
            <div className="title-icon-wrapper">
                <div className="icon-large">
                    <i className="fa-solid fa-layer-group"></i> 
                </div>
                <div>
                    <h1>{roadmap.title}</h1>
                    <p className="DescribRoadmapTrack">{roadmap.description || "Master the skills needed for this path"}</p>
                </div>
            </div>

            {/* عرض البروجرس للمشتركين فقط */}
            {isEnrolled && (
                <div className="main-progress-container">
                    <div className="progress-info">
                    <span className={`status-badge ${progress === 100 ? 'completed' : 'in-progress'}`}>
                        {progress === 100 ? 'Completed' : 'In Progress'}
                    </span>
                    <span className="percentage-text">{progress}%</span>
                    </div>
                    <div className="progress-bar-bg">
                    <div className="progress-bar-fill" style={{ width: `${progress}%` }}></div>
                    </div>
                </div>
            )}
          </div>

          {/* أزرار التحكم (Start / Sign In) */}
          <div className="header-actions">
                {!userId ? (
                    <button className="btn-signin-action" onClick={() => navigate('/Sign_In')}>
                        Sign in to start tracking
                    </button>
                ) : !isEnrolled ? (
                    <button className="btn-start-roadmap" onClick={handleStartRoadmap}>
                        <i className="fa-solid fa-play"></i> Start this Roadmap
                    </button>
                ) : (
                    <button className="btn-continue-roadmap" disabled>
                        <i className="fa-solid fa-bars-progress"></i> Tracking Active
                    </button>
                )}
          </div>
        </div>
      </div>

      {/* 2. الخطوات (Timeline) */}
      <div className="timeline-container">
        {stepsToRender.length > 0 ? (
          stepsToRender.map((skill, index) => {
            
            // --- معالجة اختلاف الأسماء ---
            // 1. الترتيب
            const junction = skill.Roadmap_steps || skill.RoadmapSkill; 
            const stepOrder = junction ? junction.step_order : index + 1;
            
            // 2. هل الخطوة دي معمولة صح؟
            const isChecked = completedSteps.includes(Number(skill.id));
            
            // 3. المصادر
            const resources = skill.StepResources || skill.SkillResources || [];

            return (
                <div className={`timeline-step ${isChecked ? 'step-completed' : ''}`} key={skill.id}>
                
                <div className="step-header-row">
                    <div className="step-meta">
                        <span className="step-badge">Step {stepOrder}</span>
                        <span className="step-duration">
                            <i className="fa-regular fa-clock"></i> {skill.duration || "4 Weeks"}
                        </span>
                    </div>


                    {/* الـ Checkbox يظهر فقط للمشتركين */}
                    {isEnrolled && (
                        <div className="checkbox-wrapper" onClick={() => handleStepToggle(skill.id)}>
                            <div className={`custom-checkbox ${isChecked ? 'checked' : ''}`}>
                                {isChecked && <i className="fa-solid fa-check"></i>}
                            </div>
                            <span className="mark-text">{isChecked ? 'Completed' : 'Mark as done'}</span>
                        </div>
                    )}
                </div>

                {/* الاسم الجديد step_name */}
                <h2 className="step-title">{skill.step_name || skill.name}</h2>
                <p className="step-desc">{skill.description}</p>

                {/* 3. المصادر */}
                <div className="resources-section">
                    <h4><i className="fa-solid fa-book-open"></i> Recommended Resources:</h4>
                    
                    <div className="resources-list">
                        {resources.length > 0 ? (
                            resources.map((res) => {
                                // الاسم الجديد للينك هو url
                                const linkUrl = res.url || res.link;
                                if (!linkUrl) return null; 

                                return (
                                    <a href={linkUrl} target="_blank" rel="noopener noreferrer" className="resource-card" key={res.id}>
                                    <div className="res-info">
                                            {/* الاسم الجديد للعنوان resource_name */}
                                            <span className="res-title">{res.resource_name || res.title || "External Resource"}</span>
                                            <i className="fa-solid fa-arrow-up-right-from-square"></i>
                                    </div>
                                    <span className={`res-badge ${res.resource_type === 'Paid' ? 'paid' : 'free'}`}>
                                            {res.resource_type || res.type || 'Free'}
                                    </span>
                                    </a>
                                );
                            })
                        ) : (
                            <p className="no-res">No resources added yet.</p>
                        )}
                    </div>
                </div>
                </div>
            );
          })
        ) : (
          <div className="empty-state">No steps defined for this roadmap yet.</div>
        )}
      </div>
    </div>
  );
};

export default RoadmapDetails;
