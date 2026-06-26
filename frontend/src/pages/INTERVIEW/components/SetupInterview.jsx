import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';

const SetupInterview = ({ formData, setFormData, setQuestions, setStep, setInterviewId }) => {
    const [loading, setLoading] = useState(false);
    
    const primaryColor = '#58A492';
    const darkGreen = '#2F5D54';    
    const bgColor = '#F0F7F5';      
    const [jobOptions, setJobOptions] = useState([]);

    useEffect(() => {
        document.body.style.backgroundColor = bgColor;
        return () => {
            document.body.style.backgroundColor = '';
        };
    }, []);

useEffect(() => {
        const fetchJobs = async () => {
            try {
                // تأكدي من تغيير الرابط حسب الـ API بتاعك
                const response = await fetch('http://localhost:5001/api/jobs'); 
                const data = await response.json();
                
                // 3. تشكيل البيانات عشان تناسب الـ CustomSelect (value, label)
                const formattedJobs = data.map((job) => ({
                    value: job.title,
                    label: job.title
                }));
                
                setJobOptions(formattedJobs);
            } catch (error) {
                console.error("Error fetching jobs:", error);
            }
        };

        fetchJobs();
    }, []);


    const handleStartInterview = async () => {
        setLoading(true);
        
        try {
            const userIdFromStorage = localStorage.getItem('userId');

            // 1️⃣ Create interview record
            console.log("Creating interview record in Database for user:", userIdFromStorage);
            const dbRes = await axios.post('http://localhost:5001/api/interview/start', {
                userId: userIdFromStorage, 
                track: formData.track,
                level: formData.level,
                language: formData.language // Sends the selected language correctly to the backend
            });

            if (dbRes.data.success) {
                setInterviewId(dbRes.data.interviewId);
                console.log("Interview ID created:", dbRes.data.interviewId);
            }

            // 2️⃣ Generate questions from AI
            const form = new FormData();
            form.append('track', formData.track);
            form.append('level', formData.level);
            form.append('language', formData.language);
            form.append('num_questions', formData.numQuestions);

            console.log("Generating questions from AI...");
            const res = await axios.post('http://localhost:5000/generate-question', form);
            
            let fetchedQuestions = [];
            if (res.data.questions && Array.isArray(res.data.questions)) {
                fetchedQuestions = res.data.questions;
            } else if (res.data.question) {
                fetchedQuestions = [res.data.question]; 
            } else {
                fetchedQuestions = ["Error loading question."];
            }

            setQuestions(fetchedQuestions);
            setStep(2); 

        } catch (err) {
            alert("Error starting interview. Check backend servers (5000 & 5001).");
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const PillOption = ({ active, onClick, label }) => (
        <button
            onClick={onClick}
            style={{
                padding: '8px 20px',
                borderRadius: '25px', 
                border: active ? `1px solid ${primaryColor}` : '1px solid #cbd5e1',
                backgroundColor: active ? primaryColor : '#ffffff',
                color: active ? '#ffffff' : '#64748b',
                fontSize: '0.9rem',
                fontWeight: '600',
                cursor: 'pointer',
                transition: 'all 0.2s ease',
                outline: 'none',
                display: 'inline-block'
            }}
        >
            {label}
        </button>
    );

    const CustomSelect = ({ value, options, onChange }) => {
        const [isOpen, setIsOpen] = useState(false);
        const dropdownRef = useRef(null);

        useEffect(() => {
            const handleClickOutside = (event) => {
                if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                    setIsOpen(false);
                }
            };
            document.addEventListener("mousedown", handleClickOutside);
            return () => document.removeEventListener("mousedown", handleClickOutside);
        }, []);

        return (
            <div ref={dropdownRef} style={{ position: 'relative', width: '100%' }}>
                <div 
                    onClick={() => setIsOpen(!isOpen)}
                    style={{
                        width: '100%', 
                        padding: '12px 12px', 
                        borderRadius: '8px', 
                        border: isOpen ? `2px solid ${primaryColor}` : `1px solid #cbd5e1`, 
                        fontSize: '0.95rem', 
                        color: darkGreen, 
                        backgroundColor: '#ffffff',
                        cursor: 'pointer',
                        boxSizing: 'border-box',
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        transition: 'border 0.2s ease'
                    }}
                >
                    <span>{value}</span>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={primaryColor} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ transform: isOpen ? 'rotate(180deg)' : 'rotate(0deg)', transition: 'transform 0.2s ease' }}>
                        <polyline points="6 9 12 15 18 9"></polyline>
                    </svg>
                </div>

                {isOpen && (
                    <ul style={{
                        position: 'absolute',
                        top: '100%',
                        left: 0,
                        right: 0,
                        marginTop: '5px',
                        padding: 0,
                        backgroundColor: '#ffffff',
                        border: '1px solid #cbd5e1',
                        borderRadius: '8px',
                        boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
                        zIndex: 1000,
                        listStyle: 'none',
                        maxHeight: '200px',
                        overflowY: 'auto',
                        boxSizing: 'border-box'
                    }}>
                        {options.map((option, index) => (
                            <li 
                                key={index}
                                onClick={() => {
                                    onChange(option.value);
                                    setIsOpen(false);
                                }}
                                style={{
                                    padding: '12px 15px',
                                    fontSize: '0.95rem',
                                    color: value === option.value ? '#ffffff' : darkGreen,
                                    backgroundColor: value === option.value ? primaryColor : '#ffffff',
                                    cursor: 'pointer',
                                    transition: 'background-color 0.2s ease, color 0.2s ease',
                                    borderBottom: index < options.length - 1 ? '1px solid #f1f5f9' : 'none',
                                    textAlign: 'left'
                                }}
                                onMouseEnter={(e) => {
                                    if (value !== option.value) e.target.style.backgroundColor = '#e6f2ef';
                                }}
                                onMouseLeave={(e) => {
                                    if (value !== option.value) e.target.style.backgroundColor = '#ffffff';
                                }}
                            >
                                {option.label}
                            </li>
                        ))}
                    </ul>
                )}
            </div>
        );
    };

    return (
        <div style={{ minHeight: '100vh', padding: '40px 20px', fontFamily: 'system-ui, -apple-system, sans-serif', textAlign: 'left', direction: 'ltr' }}>
            <div style={{ maxWidth: '1000px', margin: '0 auto' }}>
                <div style={{ marginBottom: '40px', textAlign: 'center' }}>
                    <h1 style={{ color: darkGreen, fontSize: '2.5rem', fontWeight: '800', marginBottom: '15px' }}>
                        AI Interview Coach
                    </h1>
                    <p style={{ color: '#64748b', fontSize: '1.1rem', lineHeight: '1.6', maxWidth: '700px', margin: '0 auto' }}>
                        The all-in-one AI platform for computer science students. Practice interviews, build resumes, and plan your path.
                    </p>
                </div>

                <div style={{ 
                    border: `1px solid #dbece8`, 
                    borderRadius: '12px', 
                    padding: '40px', 
                    backgroundColor: '#ffffff',
                    boxShadow: '0 4px 20px rgba(47, 93, 84, 0.08)',
                    maxWidth: '600px',
                    margin: '0 auto'
                }}>
                    <h2 style={{ fontSize: '1.3rem', color: darkGreen, fontWeight: 'bold', marginBottom: '25px', marginTop: 0, borderBottom: `1px solid ${bgColor}`, paddingBottom: '15px' }}>
                        Interview Configuration
                    </h2>
         <div style={{ marginBottom: '20px' }}>
    <label style={{ display: 'block', fontSize: '0.95rem', fontWeight: '700', color: darkGreen, marginBottom: '10px' }}>
        Target Role
    </label>
    
    <CustomSelect 
        value={formData.track} 
        onChange={(val) => setFormData({...formData, track: val})}
        options={
            jobOptions.length > 0 
                ? jobOptions 
                : [{ value: formData.track, label: "Loading roles..." }]
        }
    />
</div>


                    
                    <div style={{ marginBottom: '20px' }}>
                        <label style={{ display: 'block', fontSize: '0.95rem', fontWeight: '700', color: darkGreen, marginBottom: '10px' }}>
                            Experience Level
                        </label>
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px' }}>
                            <PillOption active={formData.level === 'Junior'} onClick={() => setFormData({...formData, level: 'Junior'})} label='Junior' />
                            <PillOption active={formData.level === 'Mid-Level'} onClick={() => setFormData({...formData, level: 'Mid-Level'})} label='Mid-Level' />
                            <PillOption active={formData.level === 'Senior'} onClick={() => setFormData({...formData, level: 'Senior'})} label='Senior' />
                        </div>
                    </div>

                    <div style={{ marginBottom: '20px' }}>
                        <label style={{ display: 'block', fontSize: '0.95rem', fontWeight: '700', color: darkGreen, marginBottom: '10px' }}>
                            Interview Language
                        </label>
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px' }}>
                            <PillOption active={formData.language === 'en'} onClick={() => setFormData({...formData, language: 'en'})} label="English" />
                            <PillOption active={formData.language === 'ar'} onClick={() => setFormData({...formData, language: 'ar'})} label="Arabic" />
                        </div>
                    </div>

                    <div style={{ marginBottom: '35px' }}>
                        <label style={{ display: 'block', fontSize: '0.95rem', fontWeight: '700', color: darkGreen, marginBottom: '10px' }}>
                            Number of Questions
                        </label>
                        <CustomSelect 
                            value={formData.numQuestions.toString()} 
                            onChange={(val) => setFormData({...formData, numQuestions: parseInt(val)})}
                            options={[
                                { value: "1", label: "1" },
                                { value: "2", label: "2" },
                                { value: "3", label: "3" },
                                { value: "4", label: "4" },
                                { value: "5", label: "5" }
                            ]}
                        />
                    </div>

                    <button 
                        onClick={handleStartInterview} 
                        disabled={loading}
                        style={{ 
                            width: '100%', padding: '14px', borderRadius: '8px', 
                            backgroundColor: primaryColor, color: '#fff', fontSize: '1.05rem', 
                            fontWeight: '600', border: 'none', cursor: loading ? 'wait' : 'pointer', 
                            display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '10px',
                            transition: 'all 0.2s ease', opacity: loading ? 0.7 : 1,
                            boxShadow: '0 4px 6px rgba(88, 164, 146, 0.2)'
                        }}
                        onMouseOver={(e) => { if(!loading) e.currentTarget.style.backgroundColor = darkGreen }}
                        onMouseOut={(e) => { if(!loading) e.currentTarget.style.backgroundColor = primaryColor} }
                    >
                        {loading 
                            ? "⏳ Preparing..." 
                            : (
                                <>
                                    Start Mock Interview
                                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                        <line x1="5" y1="12" x2="19" y2="12"></line><polyline points="12 5 19 12 12 19"></polyline>
                                    </svg>
                                </>
                            )
                        }
                    </button>
                </div>
            </div>
        </div>
    );
};

export default SetupInterview;