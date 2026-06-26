import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import './Roadmaps.css';

const Roadmaps = () => {
  const [roadmaps, setRoadmaps] = useState([]);
  // التعديل 1: هنخزن كائن كامل بدل مصفوفة أرقام عشان نعرف التقدم
  const [userEnrollments, setUserEnrollments] = useState({}); 
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        // 1. جلب كل الرودمابس
        const roadmapsRes = await fetch('http://localhost:5001/api/roadmaps');
        const roadmapsData = await roadmapsRes.json();

        if (roadmapsData.success) {
          setRoadmaps(roadmapsData.data);
        } else {
          setError("Failed to load roadmaps");
        }

        // 2. جلب اشتراكات اليوزر
        const userId = localStorage.getItem('userId');
        if (userId) {
          const profileRes = await fetch(`http://localhost:5001/api/auth/profile/${userId}`);
          if (profileRes.ok) {
            const profileData = await profileRes.json();
            
            // التعديل 2: تحويل البيانات لـ Object عشان نوصل للتقدم بسهولة
            // الشكل هيكون: { "1": { progress: 50, status: 'in-progress' }, "3": { progress: 100, ... } }
            const enrollmentsMap = {};
            if (profileData.UserRoadmaps) {
                profileData.UserRoadmaps.forEach(item => {
                    enrollmentsMap[item.roadmapId] = item;
                });
            }
            setUserEnrollments(enrollmentsMap);
          }
        }

      } catch (err) {
        console.error("Error:", err);
        setError("Connection error");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const getIcon = (title) => {
    const mainColor = "#58A492"; 
    if (!title) return { icon: "fa-solid fa-road", color: mainColor };
    const t = title.toLowerCase();

    if (t.includes('front')) return { icon: "fa-solid fa-code", color: mainColor }; 
    if (t.includes('back')) return { icon: "fa-solid fa-server", color: mainColor }; 
    if (t.includes('full')) return { icon: "fa-solid fa-layer-group", color: mainColor };
    if (t.includes('android') || t.includes('mobile')) return { icon: "fa-brands fa-android", color: mainColor };
    if (t.includes('data') || t.includes('machine')) return { icon: "fa-solid fa-brain", color: mainColor };
    
    return { icon: "fa-solid fa-road", color: mainColor }; 
  };

  return (
    <div className="roadmaps-page">
      <div className="page-header">
        <h2>Career Roadmaps</h2>
        <p>Step-by-step guides to master your chosen path</p>
      </div>

      {loading ? (
        <div className="loading-spinner">
            <i className="fa-solid fa-circle-notch fa-spin"></i> Loading...
        </div>
      ) : error ? (
        <div className="error-message">{error}</div>
      ) : (
        <div className="roadmaps-grid">
          {roadmaps.map((roadmap) => {
            const style = getIcon(roadmap.title);
            const stepsCount = roadmap.Steps?.length || 0;
            
            // التعديل 3: استخراج بيانات الاشتراك الخاصة بالرودماب دي
            const enrollment = userEnrollments[roadmap.id];
            const isEnrolled = !!enrollment; // true لو موجود
            const isCompleted = enrollment?.progress === 100; // true لو 100%

            return (
              <div 
                className={`roadmap-card ${isEnrolled ? 'enrolled-active' : ''} ${isCompleted ? 'roadmap-completed' : ''}`} 
                key={roadmap.id}
              >
                {/* بادج الحالة (Enrolled أو Completed) */}
                {isEnrolled && (
                    <div className={`enrolled-badge ${isCompleted ? 'badge-completed' : ''}`}>
                        {isCompleted ? (
                            <><i className="fa-solid fa-trophy"></i> Completed</>
                        ) : (
                            <><i className="fa-solid fa-check"></i> Enrolled</>
                        )}
                    </div>
                )}

               {/* التعديل 1: لون الخط الجانبي (Accent) */}
                <div 
                    className="card-accent" 
                    style={{ backgroundColor: isCompleted ? '#16a376' : style.color }}
                ></div>

                <div className="card-content">
                  <div className="card-header">
                    {/* التعديل 2: ألوان خلفية الأيقونة والأيقونة نفسها */}
                    <div className="icon-box" style={{ 
                        backgroundColor: isCompleted ? '#dcfce7' : `${style.color}15`, /* خلفية أيقونة فاتحة جداً */
                        color: isCompleted ? '#16a376' : style.color /* أيقونة خضراء واضحة */
                    }}>
                      <i className={isCompleted ? "fa-solid fa-check-double" : style.icon}></i>
                    </div>
                    
                    <div className="header-text">
                      <h3>{roadmap.title}</h3>
                      <p>{roadmap.description || "Start your journey now..."}</p>
                    </div>
                  </div>
                  <div className="card-meta" style={{ justifyContent: 'flex-end' }}>
                    <span>
                        {stepsCount} Steps <i className="fa-solid fa-list-ol" style={{ marginLeft: '5px' }}></i>
                    </span>
                  </div>

                 {/* التعديل 4: منطق الزرار (Start vs Continue vs Completed) */}
                  {isCompleted ? (
                      // حالة الاكتمال: زرار ذهبي ينقل للمراجعة
                      <Link 
                        to={`/roadmap/${roadmap.id}`} 
                        className="view-roadmap-btn btn-completed"
                      >
                          Review Path 
                          <i className="fa-solid fa-star"></i>
                      </Link>
                  ) : (
                      // الحالات العادية: Start أو Continue
                      <Link 
                        to={`/roadmap/${roadmap.id}`} 
                        className={`view-roadmap-btn ${isEnrolled ? 'btn-continue' : ''}`}
                      >
                            {isEnrolled ? 'Continue Learning' : 'View Roadmap'} 
                            <i className={`fa-solid ${isEnrolled ? 'fa-play' : 'fa-arrow-right'}`}></i>
                      </Link>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default Roadmaps;