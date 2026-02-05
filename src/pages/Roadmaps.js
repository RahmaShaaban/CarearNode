import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import './Roadmaps.css';

const Roadmaps = () => {
  const [roadmaps, setRoadmaps] = useState([]);
  const [enrolledIds, setEnrolledIds] = useState([]); // هنخزن هنا أرقام الرودمابس المشترك فيها
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        // 1. جلب كل الرودمابس
        const roadmapsRes = await fetch('http://localhost:5000/api/roadmaps');
        const roadmapsData = await roadmapsRes.json();

        if (roadmapsData.success) {
          setRoadmaps(roadmapsData.data);
        } else {
          setError("Failed to load roadmaps");
        }

        // 2. جلب اشتراكات اليوزر (لو مسجل دخول)
        const userId = localStorage.getItem('userId');
        if (userId) {
          const profileRes = await fetch(`http://localhost:5000/api/auth/profile/${userId}`);
          if (profileRes.ok) {
            const profileData = await profileRes.json();
            // بنطلع مصفوفة فيها الـ ID بتاع الرودمابس اللي هو مشترك فيها بس
            // مثلا: [1, 3]
            const ids = profileData.UserRoadmaps 
              ? profileData.UserRoadmaps.map(item => item.roadmapId) 
              : [];
            setEnrolledIds(ids);
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
            
            // هل اليوزر مشترك في الرودماب دي؟
            const isEnrolled = enrolledIds.includes(roadmap.id);

            return (
              <div 
                className={`roadmap-card ${isEnrolled ? 'enrolled-active' : ''}`} 
                key={roadmap.id}
              >
                {/* بادج بيظهر بس للمشتركين */}
                {isEnrolled && (
                    <div className="enrolled-badge">
                        <i className="fa-solid fa-check"></i> Enrolled
                    </div>
                )}

                <div className="card-accent" style={{ backgroundColor: style.color }}></div>

                <div className="card-content">
                  <div className="card-header">
                    <div className="icon-box" style={{ backgroundColor: `${style.color}15`, color: style.color }}>
                      <i className={style.icon}></i>
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

                  {/* تغيير شكل الزرار لو مشترك */}
                  <Link to={`/roadmap/${roadmap.id}`} className={`view-roadmap-btn ${isEnrolled ? 'btn-continue' : ''}`}>
                        {isEnrolled ? 'Continue Learning' : 'View Roadmap'} 
                        <i className={`fa-solid ${isEnrolled ? 'fa-play' : 'fa-arrow-right'}`}></i>
                   </Link>
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