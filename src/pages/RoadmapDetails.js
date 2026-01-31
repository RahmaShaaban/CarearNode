import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import './RoadmapDetails.css';

const RoadmapDetails = () => {
  const { id } = useParams(); // بناخد رقم الـ roadmap من الرابط
  const [roadmap, setRoadmap] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchRoadmapDetails = async () => {
      try {
        // تأكدي إن الرابط هنا مطابق للباك إند عندك
        const response = await fetch(`http://localhost:5000/api/roadmaps/${id}`);
        const data = await response.json();

        if (data.success) {
          setRoadmap(data.data);
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

    fetchRoadmapDetails();
  }, [id]);

  if (loading) return <div className="loading-center"><i className="fa-solid fa-circle-notch fa-spin"></i> Loading Details...</div>;
  if (error) return <div className="error-center">{error}</div>;
  if (!roadmap) return <div className="error-center">Roadmap not found</div>;

  return (
    <div className="details-page">
      {/* 1. الهيدر (زرار الرجوع والعنوان) */}
      <div className="details-header">
        <Link to="/roadmaps" className="back-btn">
            <button className="btn-back">
                <i className="fa-solid fa-arrow-left"></i> Back to Roadmaps
            </button>
        </Link>
        
        <div className="header-content">
          <div className="icon-large">
            {/* بنحط أيقونة افتراضية أو نحددها حسب العنوان زي الصفحة اللي فاتت */}
            <i className="fa-solid fa-layer-group"></i> 
          </div>
          <div>
            <h1>{roadmap.title}</h1>
            <p className="DescribRoadmapTrack">{roadmap.description || "Master the skills needed for this path"}</p>
          </div>
        </div>
      </div>

      {/* 2. الخطوات (Timeline) */}
      <div className="timeline-container">
        {roadmap.TechSkills && roadmap.TechSkills.length > 0 ? (
          roadmap.TechSkills.map((skill, index) => (
            <div className="timeline-step" key={skill.id}>
              
              {/* رأس الخطوة (رقم الخطوة والمدة) */}
              <div className="step-meta">
                <span className="step-badge">Step {index + 1}</span>
                <span className="step-duration">
                    <i className="fa-regular fa-clock"></i> 4 Weeks {/* مدة افتراضية لو مش في الداتابيز */}
                </span>
              </div>

              {/* عنوان المهارة */}
              <h2 className="step-title">{skill.name}</h2>
              <p className="step-desc">{skill.description}</p>

              {/* 3. المصادر (Resources) */}
              <div className="resources-section">
                    <h4><i className="fa-solid fa-book-open"></i> Recommended Resources:</h4>
                    
                    <div className="resources-list">
                        {skill.SkillResources && skill.SkillResources.length > 0 ? (
                            skill.SkillResources.map((res) => {
                            
                                // >>> التعديل هنا: شرط الحماية <<<
                                // لو مفيش لينك، او اللينك فاضي، متعملش return للكارت ده
                                if (!res.link) return null; 

                                return (
                                    <a href={res.link} target="_blank" rel="noopener noreferrer" className="resource-card" key={res.id}>
                                    <div className="res-info">
                                        {/* هنا الحل بتاع العنوان اللي قولنا عليه قبل كده */}
                                        <span className="res-title">{res.title ? res.title : "External Resource"}</span>
                                        <i className="fa-solid fa-arrow-up-right-from-square"></i>
                                    </div>
                                    <span className={`res-badge ${res.type === 'Paid' ? 'paid' : 'free'}`}>
                                        {res.type || 'Free'}
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
          ))
        ) : (
          <div className="empty-state">No steps defined for this roadmap yet.</div>
        )}
      </div>
    </div>
  );
};

export default RoadmapDetails;