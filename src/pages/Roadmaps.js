import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import './Roadmaps.css'; // تأكدي إن ملف الـ CSS موجود جنبه

const Roadmaps = () => {
  const [roadmaps, setRoadmaps] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // 1. دالة جلب البيانات من الباك إند
  useEffect(() => {
    const fetchRoadmaps = async () => {
      try {
        const response = await fetch('http://localhost:5000/api/roadmaps/all'); 
        const data = await response.json();

        if (data.success) {
          setRoadmaps(data.data);
        } else {
          setError("Failed to load roadmaps");
        }
      } catch (err) {
        console.error("Error:", err);
        setError("Connection error");
      } finally {
        setLoading(false);
      }
    };

    fetchRoadmaps();
  }, []);

  // 2. دالة مساعدة لتحديد الأيقونة واللون (جزء الكارت سابقاً)
  const getIcon = (title) => {
    if (!title) return { icon: "fa-solid fa-road", color: "#64748b" };
    const t = title.toLowerCase();
    if (t.includes('front')) return { icon: "fa-solid fa-code", color: "#3b82f6" }; 
    if (t.includes('back')) return { icon: "fa-solid fa-server", color: "#8b5cf6" }; 
    if (t.includes('full')) return { icon: "fa-solid fa-layer-group", color: "#10b981" };
    if (t.includes('android') || t.includes('mobile')) return { icon: "fa-brands fa-android", color: "#3ddc84" };
    if (t.includes('data')) return { icon: "fa-solid fa-database", color: "#f59e0b" };
    return { icon: "fa-solid fa-road", color: "#64748b" }; 
  };

  // 3. تصميم الصفحة
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
          {/* هنا بنعمل Loop ونرسم الكروت مباشرة */}
          {roadmaps.map((roadmap) => {
            const style = getIcon(roadmap.title);
            
            return (
              <div className="roadmap-card" key={roadmap.id}>
                {/* الخط الملون الجانبي */}
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

                  {/* بيانات إضافية للشكل */}
                  <div className="card-meta">
                    <span><i className="fa-solid fa-list-ol"></i> Steps: TBD</span>
                    <span><i className="fa-regular fa-clock"></i> 6 Months</span>
                  </div>

                  {/* زرار التفاصيل */}
                  <Link to={`/roadmap/${roadmap.id}`} className="view-roadmap-btn">
                    View Roadmap <i className="fa-solid fa-arrow-right"></i>
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