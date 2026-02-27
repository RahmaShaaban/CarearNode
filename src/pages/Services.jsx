
import React from 'react';
import Roadmaps from './Roadmaps';

const Services = () => {
    const servicesList = [
        {
            icon: "fa-solid fa-route",
            title: "Career Track Guide",
            desc: "Confused between IS,CS,Csys,SC ? Our smart system analyzes your interests and skills to recommend the perfect Department for you & Showing the Roadmaps of the most popular tracks in Computer Science & Tracking your progress at any Roadmap you enrolled in, when completing any radmap we ensure your knowledge by a Quiz."
            
        },
        {
            icon: "fa-solid fa-file-invoice",
            title: "AI Resume Builder",
            desc: "Generate stunning, ATS-friendly resumes in minutes. Choose from professional templates and let our AI suggest the best action verbs and summaries for your skills."
        },
        {
            icon: "fa-solid fa-video",
            title: "AI Mock Interviews",
            desc: "Practice like it's real. Our AI analyzes your facial expressions, body language, and voice tone during the interview, providing instant, actionable feedback."
        }
    ];

    return (
        <div style={{ backgroundColor: '#F0F7F5', minHeight: '80vh', padding: '60px 20px', fontFamily: "'Segoe UI', sans-serif" }}>
            <div style={{ maxWidth: '1100px', margin: '0 auto' }}>

                <div style={{ textAlign: 'center', marginBottom: '50px' }}>
                    <h1 style={{ color: '#2F5D54', fontSize: '2.5rem', marginBottom: '15px' }}>Our Services</h1>
                    <p style={{ color: '#64748b', fontSize: '1.1rem' }}>Everything you need to launch your tech career, powered by advanced AI.</p>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '30px' }}>
                    {servicesList.map((srv, index) => (
                        <div key={index} style={{ backgroundColor: 'white', padding: '40px 30px', borderRadius: '15px', textAlign: 'center', boxShadow: '0 5px 20px rgba(0,0,0,0.05)', transition: 'transform 0.3s' }}
                            onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-10px)'}
                            onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0)'}>
                            <div style={{ width: '70px', height: '70px', backgroundColor: '#58A492', color: 'white', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '30px', margin: '0 auto 20px' }}>
                                <i className={srv.icon}></i>
                            </div>
                            <h3 style={{ color: '#2c3e50', fontSize: '1.3rem', marginBottom: '15px' }}>{srv.title}</h3>
                            <p style={{ color: '#64748b', lineHeight: '1.6' }}>{srv.desc}</p>
                        </div>
                    ))}
                </div>

            </div>
        </div>
    );
};

export default Services;