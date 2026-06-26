import React from 'react';

const AboutUs = () => {
    return (
        <div style={{ backgroundColor: '#F0F7F5', minHeight: '100vh', padding: '60px 20px', fontFamily: "'Segoe UI', sans-serif" }}>
            <div style={{ maxWidth: '1000px', margin: '0 auto', backgroundColor: 'white', padding: '60px 50px', borderRadius: '15px', boxShadow: '0 10px 30px rgba(47, 93, 84, 0.08)' }}>

                {/* 1. Header Section */}
                <h1 style={{ color: '#2c3e50', fontSize: '2.8rem', marginBottom: '15px', textAlign: 'center', fontWeight: 'bold' }}>About CareerNode</h1>
                <p style={{ color: '#64748b', fontSize: '1.2rem', textAlign: 'center', lineHeight: '1.8', marginBottom: '60px', maxWidth: '800px', margin: '0 auto 60px' }}>
                    Bridging the gap between computer science academia and the dynamic tech job market. We are here to guide you from your first line of code to your first job offer.
                </p>

                {/* 2. Mission & Vision Section */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '30px', marginBottom: '80px' }}>
                    <div style={{ padding: '40px', borderLeft: '5px solid #58A492', backgroundColor: '#f8fafc', borderRadius: '0 12px 12px 0', transition: 'transform 0.3s' }} onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-5px)'} onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0)'}>
                        <h3 style={{ color: '#2F5D54', fontSize: '1.5rem', marginTop: 0, display: 'flex', alignItems: 'center', gap: '10px' }}>
                            <i className="fa-solid fa-bullseye"></i> Our Mission
                        </h3>
                        <p style={{ color: '#475569', lineHeight: '1.7', fontSize: '1.05rem' }}>
                            To empower CS students with AI-driven tools that help them discover their ideal tech tracks, build ATS-friendly resumes, and confidently ace their technical and HR interviews.
                        </p>
                    </div>

                    <div style={{ padding: '40px', borderLeft: '5px solid #58A492', backgroundColor: '#f8fafc', borderRadius: '0 12px 12px 0', transition: 'transform 0.3s' }} onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-5px)'} onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0)'}>
                        <h3 style={{ color: '#2F5D54', fontSize: '1.5rem', marginTop: 0, display: 'flex', alignItems: 'center', gap: '10px' }}>
                            <i className="fa-solid fa-lightbulb"></i> Our Vision
                        </h3>
                        <p style={{ color: '#475569', lineHeight: '1.7', fontSize: '1.05rem' }}>
                            To become the ultimate career compass for every software engineering student, ensuring no talent gets lost in the noise of the ever-evolving tech industry.
                        </p>
                    </div>
                </div>

                {/* 3. Detailed Features Section (What We Do) */}
                <div style={{ marginBottom: '80px' }}>
                    <h2 style={{ color: '#2c3e50', fontSize: '2.2rem', textAlign: 'center', marginBottom: '50px', borderBottom: '2px solid #F0F7F5', paddingBottom: '20px' }}>How We Help You Succeed</h2>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '40px' }}>

                        {/* Feature 1 */}
                        <div style={{ display: 'flex', gap: '25px', alignItems: 'flex-start' }}>
                            <div style={{ backgroundColor: '#2F5D54', color: 'white', width: '60px', height: '60px', borderRadius: '12px', display: 'flex', justifyContent: 'center', alignItems: 'center', fontSize: '1.8rem', flexShrink: 0 }}>
                                <i className="fa-solid fa-compass"></i>
                            </div>
                            <div>
                                <h3 style={{ color: '#2c3e50', fontSize: '1.4rem', margin: '0 0 10px 0' }}>1. Smart Career Track Navigation</h3>
                                <p style={{ color: '#475569', lineHeight: '1.7', margin: 0, fontSize: '1.05rem' }}>
                                  Helping you to choose the most suitable dapartment at Uni based on what u want and like to study & In case you want to know what you should study in any track of CS world to can choose between and start your learning journey! CareerNode helps you by providing the roadmaps of the most popular tracks and keeping your progress.
                                </p>
                            </div>
                        </div>

                        {/* Feature 2 */}
                        <div style={{ display: 'flex', gap: '25px', alignItems: 'flex-start' }}>
                            <div style={{ backgroundColor: '#2F5D54', color: 'white', width: '60px', height: '60px', borderRadius: '12px', display: 'flex', justifyContent: 'center', alignItems: 'center', fontSize: '1.8rem', flexShrink: 0 }}>
                                <i className="fa-solid fa-file-pdf"></i>
                            </div>
                            <div>
                                <h3 style={{ color: '#2c3e50', fontSize: '1.4rem', margin: '0 0 10px 0' }}>2. AI-Powered ATS Resume Builder</h3>
                                <p style={{ color: '#475569', lineHeight: '1.7', margin: 0, fontSize: '1.05rem' }}>
                                    Crafting a professional resume shouldn't be a struggle. Choose from our modern, industry-tested templates. Our system formats your skills and experience to ensure they bypass Applicant Tracking Systems (ATS), complete with real-time live previews.
                                </p>
                            </div>
                        </div>

                        {/* Feature 3 */}
                        <div style={{ display: 'flex', gap: '25px', alignItems: 'flex-start' }}>
                            <div style={{ backgroundColor: '#2F5D54', color: 'white', width: '60px', height: '60px', borderRadius: '12px', display: 'flex', justifyContent: 'center', alignItems: 'center', fontSize: '1.8rem', flexShrink: 0 }}>
                                <i className="fa-solid fa-user-tie"></i>
                            </div>
                            <div>
                                <h3 style={{ color: '#2c3e50', fontSize: '1.4rem', margin: '0 0 10px 0' }}>3. Advanced AI Mock Interviews</h3>
                                <p style={{ color: '#475569', lineHeight: '1.7', margin: 0, fontSize: '1.05rem' }}>
                                    Practice makes perfect. Step into our virtual interview room where our cutting-edge AI analyzes your performance. We process your verbal responses, voice tone, facial expressions, and body language to provide a detailed, actionable feedback dashboard.
                                </p>
                            </div>
                        </div>

                    </div>
                </div>

                {/* 4. Our Story Section */}
                <div style={{ backgroundColor: '#F0F7F5', padding: '40px', borderRadius: '12px', textAlign: 'center' }}>
                    <h2 style={{ color: '#2F5D54', fontSize: '1.8rem', margin: '0 0 15px 0' }}>Built by Students, for Students</h2>
                    <p style={{ color: '#475569', lineHeight: '1.7', margin: '0 auto', maxWidth: '700px', fontSize: '1.05rem' }}>
                        We know the struggle of applying for the first internship, formatting a CV late at night, and the anxiety of technical interviews. CareerNode was born out of our own experiences as Computer Science students, designed to give you the unfair advantage we wished we had.
                    </p>
                </div>

            </div>
        </div>
    );
};

export default AboutUs;