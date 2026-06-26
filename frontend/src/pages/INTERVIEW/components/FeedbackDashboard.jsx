import React, { useState, useRef, useEffect } from 'react';
import html2canvas from 'html2canvas';
import { jsPDF } from 'jspdf';
import OverallFeedback from './OverallFeedback';

const DetailedAnalysisCard = ({ icon, title, value, score, colorHex, tip }) => {
    const safeScore = parseInt(score) || 0;
    return (
        <div style={{ backgroundColor: '#ffffff', borderRadius: '12px', border: '1px solid #e2e8f0', padding: '20px', marginBottom: '15px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                    <div style={{ width: '40px', height: '40px', borderRadius: '10px', backgroundColor: `${colorHex}15`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.2rem', color: colorHex }}>{icon}</div>
                    <strong style={{ fontSize: '1.1rem', color: '#1f2937' }}>{title}</strong>
                </div>
                <div style={{ fontSize: '1.3rem', fontWeight: 'bold', color: colorHex }}>{value}</div>
            </div>
            <div style={{ width: '100%', height: '10px', backgroundColor: '#f1f5f9', borderRadius: '50px', overflow: 'hidden', marginBottom: '15px', direction: 'ltr' }}>
                <div style={{ width: `${safeScore}%`, height: '100%', backgroundColor: colorHex, borderRadius: '50px' }}></div>
            </div>
            <div style={{ backgroundColor: '#f8fafc', borderRadius: '8px', padding: '10px 14px', display: 'flex', alignItems: 'center', gap: '10px' }}>
                <span style={{ fontSize: '1.1rem' }}>💡</span><span style={{ color: '#475569', fontSize: '0.9rem' }}>{tip}</span>
            </div>
        </div>
    );
};

const SquareCard = ({ icon, label, value, subLabel, colorHex, isCircular = false }) => {
    const safeValue = value || 0;
    const numValue = parseInt(safeValue) || 0;
    return (
        <div style={{ backgroundColor: '#ffffff', borderRadius: '16px', border: '1px solid #e2e8f0', padding: '25px 20px', display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', flex: '1', minWidth: '200px' }}>
            <div style={{ width: '55px', height: '55px', borderRadius: '50%', backgroundColor: `${colorHex}15`, display: 'flex', justifyContent: 'center', alignItems: 'center', fontSize: '1.6rem', color: colorHex, marginBottom: '15px' }}>{icon}</div>
            <div style={{ color: '#475569', fontSize: '1.05rem', fontWeight: '600', marginBottom: '15px' }}>{label}</div>
            {isCircular ? (
                <div style={{ width: '85px', height: '85px', borderRadius: '50%', background: `conic-gradient(${colorHex} ${numValue}%, #f1f5f9 ${numValue}%)`, display: 'flex', justifyContent: 'center', alignItems: 'center', marginBottom: '10px' }}>
                    <div style={{ width: '70px', height: '70px', backgroundColor: '#fff', borderRadius: '50%', display: 'flex', justifyContent: 'center', alignItems: 'center', fontSize: '1.4rem', fontWeight: 'bold', color: '#0f172a' }}>
                        {safeValue}{typeof safeValue === 'number' || !isNaN(safeValue) ? '%' : ''}
                    </div>
                </div>
            ) : (<div style={{ fontSize: '2rem', fontWeight: 'bold', color: colorHex, marginBottom: '10px' }}>{safeValue}</div>)}
            <div style={{ color: '#94a3b8', fontSize: '0.9rem', marginTop: 'auto' }}>{subLabel}</div>
        </div>
    );
};

const FeedbackDashboard = ({ allResults, handleStartNew, interviewId }) => {
    const [selectedView, setSelectedView] = useState('overall');
    const [activeTab, setActiveTab] = useState('vision');
    const [isDownloading, setIsDownloading] = useState(false);
    const reportRef = useRef();
    
    const primaryColor = '#58A492'; 
    const darkGreen = '#2F5D54';    
    const bgColor = '#F0F7F5';      

    useEffect(() => {
        document.body.style.backgroundColor = bgColor;
        return () => { document.body.style.backgroundColor = ''; };
    }, []);

    const handleExportPDF = async () => {
        const element = reportRef.current;
        if (!element) return;
        setIsDownloading(true);
        try {
            const canvas = await html2canvas(element, { scale: 2, useCORS: true, backgroundColor: '#f8fafc' });
            const imgData = canvas.toDataURL('image/png');
            const pdf = new jsPDF('p', 'mm', [210, (canvas.height * 210) / canvas.width]);
            pdf.addImage(imgData, 'PNG', 0, 0, 210, (canvas.height * 210) / canvas.width);
            pdf.save(`Interview_Report.pdf`);
        } catch (error) {
            console.error("Error generating PDF:", error);
            alert("Failed to export report.");
        } finally {
            setIsDownloading(false);
        }
    };

    let currentResult = {};
    let b = {}, h = {}, attireStatus = "Casual", isFormal = false, eye = {}, head = {}, face = {}, s = {};
    let strScore = 0, wordsCount = 0;
    let expScore = 0, crossedScore = 0, faceTouchScore = 0, opennessRaw = "Normal", opennessScore = 50;
    let expTip = "", strTip = "", openTip = "", crossTip = "", touchTip = "", overallBodyAdvice = "";

    if (selectedView !== 'overall') {
        currentResult = allResults[selectedView] || {};

        if (!currentResult.error) {
            b = currentResult.vision?.body || {};
            h = currentResult.vision?.hand || {};
            attireStatus = currentResult.vision?.attire?.status || "Casual";
            isFormal = attireStatus.toLowerCase().includes('formal');
            eye = currentResult.vision?.eye_contact || {};
            head = currentResult.vision?.head_focus || {};
            face = currentResult.vision?.emotions || {};
            s = currentResult.speech || {};

            strScore = b.straight_score || 0;
            const transcriptText = s.transcript || "";
            wordsCount = transcriptText.trim() === "" ? 0 : transcriptText.trim().split(/\s+/).length;

            expScore = b.explaining_score || 0;
            crossedScore = b.crossed_arm_score || 0;
            faceTouchScore = b.touch_face_score || 0;
            opennessRaw = b.body_openness || "Normal";
            opennessScore = opennessRaw === "Open" ? 100 : (opennessRaw === "Normal" ? 50 : 30);

            expTip = expScore >= 20 ? "Great use of hands to illustrate your points." : "Use your hands more to illustrate your points.";
            strTip = strScore >= 60 ? "Excellent straight posture. Keep it up!" : "Keep your back straight to look more confident.";
            openTip = opennessRaw === "Open" ? "Open and welcoming body language." : "Try to uncross limbs to look more approachable.";
            crossTip = crossedScore > 20 ? "Avoid crossing your arms as it can signal defensiveness." : "Open and welcoming body language. Keep it up!";
            touchTip = faceTouchScore > 20 ? "Avoid touching your face as it can signal nervousness." : "Good control over your hand movements.";

            let negativeFeedbacks = [];
            if (strScore < 50) negativeFeedbacks.push("sitting straight");
            if (opennessRaw === "Closed" || crossedScore > 20) negativeFeedbacks.push("avoiding crossed arms and closed posture");
            if (faceTouchScore > 20) negativeFeedbacks.push("reducing face touches");
            if (expScore < 10) negativeFeedbacks.push("using explaining gestures more");

            if (negativeFeedbacks.length === 0) {
                overallBodyAdvice = "Outstanding performance! Your body language was professional, open, and reflected high confidence.";
            } else {
                overallBodyAdvice = "To improve your body language and appear more confident, focus on: " + negativeFeedbacks.join(", and ") + ".";
            }
        }
    }

    return (
        <div className="dashboard-container" style={{ maxWidth: '1200px', margin: '0 auto', padding: '20px', fontFamily: 'system-ui, -apple-system, sans-serif' }}>
            
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '20px', marginBottom: '30px', flexWrap: 'wrap' }}>
                <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                    <button onClick={() => setSelectedView('overall')} style={{ padding: '12px 25px', borderRadius: '8px', border: 'none', backgroundColor: selectedView === 'overall' ? primaryColor : '#ffffff', color: selectedView === 'overall' ? '#ffffff' : darkGreen, fontWeight: 'bold', cursor: 'pointer', transition: 'all 0.2s', boxShadow: selectedView === 'overall' ? '0 4px 6px rgba(88, 164, 146, 0.3)' : '0 2px 4px rgba(0,0,0,0.05)' }}>
                        Overall Feedback
                    </button>
                    {allResults.map((_, index) => (
                        <button key={index} onClick={() => setSelectedView(index)} style={{ padding: '12px 25px', borderRadius: '8px', border: 'none', backgroundColor: selectedView === index ? primaryColor : '#ffffff', color: selectedView === index ? '#ffffff' : darkGreen, fontWeight: 'bold', cursor: 'pointer', transition: 'all 0.2s', boxShadow: selectedView === index ? '0 4px 6px rgba(88, 164, 146, 0.3)' : '0 2px 4px rgba(0,0,0,0.05)' }}>
                            Question {index + 1}
                        </button>
                    ))}
                </div>

       
            </div>

            {selectedView === 'overall' ? (
                <OverallFeedback allResults={allResults} interviewId={interviewId}/>
            ) : currentResult.error ? (
                <div style={{textAlign: 'center', padding: '50px', color: 'red', fontSize: '1.2rem'}}>
                    Error analyzing this specific question.
                </div>
            ) : (
                <div className="question-details">
                    <div className="control-bar" style={{ display: 'flex', justifyContent: 'center', gap: '10px', marginBottom: '20px', flexWrap: 'wrap' }}>
                        <button className={`tab-btn ${activeTab === 'vision' ? 'active' : ''}`} onClick={() => setActiveTab('vision')} style={{ padding: '10px 20px', borderRadius: '50px', border: 'none', background: activeTab === 'vision' ? primaryColor : 'transparent', color: activeTab === 'vision' ? '#fff' : darkGreen, fontWeight: 'bold', cursor: 'pointer' }}>Body Language</button>
                        <button className={`tab-btn ${activeTab === 'eye' ? 'active' : ''}`} onClick={() => setActiveTab('eye')} style={{ padding: '10px 20px', borderRadius: '50px', border: 'none', background: activeTab === 'eye' ? primaryColor : 'transparent', color: activeTab === 'eye' ? '#fff' : darkGreen, fontWeight: 'bold', cursor: 'pointer' }}>Eye Contact & Head Pose</button>
                        <button className={`tab-btn ${activeTab === 'face' ? 'active' : ''}`} onClick={() => setActiveTab('face')} style={{ padding: '10px 20px', borderRadius: '50px', border: 'none', background: activeTab === 'face' ? primaryColor : 'transparent', color: activeTab === 'face' ? '#fff' : darkGreen, fontWeight: 'bold', cursor: 'pointer' }}>Face</button>
                        <button className={`tab-btn ${activeTab === 'speech' ? 'active' : ''}`} onClick={() => setActiveTab('speech')} style={{ padding: '10px 20px', borderRadius: '50px', border: 'none', background: activeTab === 'speech' ? primaryColor : 'transparent', color: activeTab === 'speech' ? '#fff' : darkGreen, fontWeight: 'bold', cursor: 'pointer' }}>Speech</button>
                        <button className={`tab-btn ${activeTab === 'content' ? 'active' : ''}`} onClick={() => setActiveTab('content')} style={{ padding: '10px 20px', borderRadius: '50px', border: 'none', background: activeTab === 'content' ? primaryColor : 'transparent', color: activeTab === 'content' ? '#fff' : darkGreen, fontWeight: 'bold', cursor: 'pointer' }}>Content</button>
                    </div>

                    <div className="result-content" ref={reportRef} style={{ padding: '20px', backgroundColor: '#ffffff', borderRadius: '12px', border: '1px solid #dbece8', boxShadow: '0 4px 15px rgba(47, 93, 84, 0.05)' }}>
                        
               <div style={{ background: '#f8fafc', padding: '20px', borderRadius: '12px', borderLeft: `5px solid ${primaryColor}`, marginBottom: '30px' }}>
    {/* تم إضافة الخصائص هنا لحل مشكلة قراءة النص العربي والإنجليزي */}
    <h3 style={{ 
        margin: 0, 
        color: darkGreen, 
        fontSize: '1.4rem',
        direction: 'rtl',          // بداية القراءة من اليمين
        textAlign: 'right',        // محاذاة النص لليمين
        unicodeBidi: 'plaintext'   // الحفاظ على ترتيب الكلمات الإنجليزية داخل النص العربي
    }}>
        "{currentResult.questionText}"
    </h3>
</div>
                        {wordsCount < 10  && (
                            <div style={{ backgroundColor: '#fff4f4', border: '1px solid #fca5a5', color: '#b91c1c', padding: '15px 20px', borderRadius: '8px', marginBottom: '25px', display: 'flex', alignItems: 'center', gap: '10px', textAlign: 'left' }}>
                                <span style={{ fontSize: '1.5rem' }}>⚠️</span>
                                <div>
                                    <strong style={{ display: 'block', fontSize: '1.1rem', marginBottom: '5px' }}>Warning: Insufficient Content</strong>
                                    <span>The system could not hear you clearly or the answer was too short.</span>
                                </div>
                            </div>
                        )}

                        {activeTab === 'vision' && (
                            <div style={{ maxWidth: '1050px', margin: '0 auto' }}>
                                <div style={{ marginBottom: '30px', textAlign: 'left' }}>
                                    <h3 style={{ fontSize: '1.4rem', color: darkGreen, margin: 0 }}>Body Language & Attire</h3>
                                </div>
                                <div style={{ display: 'flex', gap: '30px', alignItems: 'flex-start' }}>
                                    <div style={{ flex: '1.4', display: 'flex', flexDirection: 'column' }}>
                                        <DetailedAnalysisCard icon="⚡" title='Explaining Gestures' value={`${expScore}%`} score={expScore} colorHex={primaryColor} tip={expTip} />
                                        <DetailedAnalysisCard icon="🪑" title='Sitting Straight' value={`${strScore}%`} score={strScore} colorHex={primaryColor} tip={strTip} />
                                        <DetailedAnalysisCard icon="👤" title='Body Openness' value={opennessRaw} score={opennessScore} colorHex={opennessScore > 50 ? primaryColor : "#64748b"} tip={openTip} />
                                    </div>
                                    <div style={{ flex: '1', display: 'flex', flexDirection: 'column' }}>
                                        <div style={{ display: 'flex', gap: '15px', marginBottom: '15px' }}>
                                            <SquareCard icon='🖐️' label='Open Hands' value={h.open_score || 0} subLabel='Trust' colorHex={primaryColor} isCircular={true} />
                                            <SquareCard icon='✊' label='Closed Hands' value={h.clasped_score || 0} subLabel='Nervous' colorHex='#64748b' isCircular={true} />
                                        </div>
                                        <DetailedAnalysisCard icon="🙅" title='Crossed Arms' value={`${crossedScore}%`} score={crossedScore} colorHex={crossedScore > 20 ? '#ef4444' : primaryColor} tip={crossTip} />
                                        <DetailedAnalysisCard icon="😳" title='Face Touches' value={`${faceTouchScore}%`} score={faceTouchScore} colorHex={faceTouchScore > 20 ? '#ef4444' : primaryColor} tip={touchTip} />
                                    </div>
                                </div>
                                <div style={{ marginTop: '20px', width: '50%' }}>
                                    <DetailedAnalysisCard icon="👔" title='Formal Attire' value={isFormal ? "Formal" : "Casual"} score={isFormal ? 100 : 35} colorHex={isFormal ? primaryColor : "#f97316"} tip={isFormal ? "Excellent professional attire." : "Formal wear is preferred."} />
                                </div>
                                <div style={{ marginTop: '20px', backgroundColor: '#f8fafc', borderRadius: '10px', borderLeft: `6px solid ${primaryColor}`, padding: '20px', textAlign: 'left' }}>
                                    <strong style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px', color: primaryColor }}>
                                        <span>💡</span> Body Language Advice:
                                    </strong>
                                    <p style={{ margin: 0, color: darkGreen, lineHeight: '1.6' }}>{overallBodyAdvice}</p>
                                </div>
                            </div>
                        )}

                        {activeTab === 'eye' && (
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                                <div style={{ borderBottom: '2px solid #e2e8f0', paddingBottom: '15px', textAlign: 'left' }}>
                                    <h2 style={{ color: darkGreen, margin: 0 }}>Eye & Head Tracking</h2>
                                </div>
                                <div style={{ display: 'flex', gap: '20px', flexWrap: 'wrap' }}>
                                    <div style={{ flex: '1', display: 'flex', flexDirection: 'column', gap: '15px' }}>
                                        <SquareCard icon='👁️' label='Eye Contact' value={eye.score} colorHex={primaryColor} isCircular={true} />
                                        <div style={{ backgroundColor: '#f0f7f5', border: `1px solid ${primaryColor}`, borderRadius: '12px', padding: '20px', color: darkGreen, textAlign: 'left' }}>
                                            <strong>Advice:</strong> <p>{eye.advice || "-"}</p>
                                        </div>
                                    </div>
                                    <div style={{ flex: '1', display: 'flex', flexDirection: 'column', gap: '15px' }}>
                                        <SquareCard icon='👤' label='Head Pose' value={head.score} colorHex={primaryColor} isCircular={true} />
                                        <div style={{ backgroundColor: '#f0f7f5', border: `1px solid ${primaryColor}`, borderRadius: '12px', padding: '20px', color: darkGreen, textAlign: 'left' }}>
                                            <strong>Advice:</strong> <p>{head.advice || "-"}</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}

                        {activeTab === 'face' && (
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                                <div style={{ borderBottom: '2px solid #e2e8f0', paddingBottom: '15px', textAlign: 'left' }}>
                                    <h2 style={{ color: darkGreen, margin: 0 }}>Emotional Expression</h2>
                                </div>
                                <div style={{ display: 'flex', gap: '20px', flexWrap: 'wrap' }}>
                                    <div style={{ flex: '1', backgroundColor: '#ffffff', borderRadius: '12px', border: '1px solid #e2e8f0', padding: '25px 15px', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                                        <div style={{ fontSize: '3rem', marginBottom: '15px' }}>😃</div>
                                        <div style={{ fontWeight: '600' }}>Positive</div>
                                        <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: primaryColor }}>{face.positive || 0}%</div>
                                    </div>
                                    <div style={{ flex: '1', backgroundColor: '#ffffff', borderRadius: '12px', border: '1px solid #e2e8f0', padding: '25px 15px', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                                        <div style={{ fontSize: '3rem', marginBottom: '15px' }}>😐</div>
                                        <div style={{ fontWeight: '600' }}>Neutral</div>
                                        <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#64748b' }}>{face.neutral || 0}%</div>
                                    </div>
                                    <div style={{ flex: '1', backgroundColor: '#ffffff', borderRadius: '12px', border: '1px solid #e2e8f0', padding: '25px 15px', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                                        <div style={{ fontSize: '3rem', marginBottom: '15px' }}>😥</div>
                                        <div style={{ fontWeight: '600' }}>Negative</div>
                                        <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#ef4444' }}>{face.negative || 0}%</div>
                                    </div>
                                </div>
                                <div style={{ backgroundColor: '#f8fafc', borderRadius: '10px', borderLeft: `6px solid ${primaryColor}`, padding: '25px', textAlign: 'left' }}>
                                    <h4 style={{ margin: '0 0 10px 0', color: primaryColor }}>Conclusion:</h4>
                                    <p style={{ margin: 0, color: darkGreen }}>
                                        { (face.positive > 50) ? "Your expressions reflect enthusiasm and confidence." : "Your expressions are calm, try to smile more." }
                                    </p>
                                </div>
                            </div>
                        )}

                        {activeTab === 'speech' && (
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                                <div style={{ borderBottom: '2px solid #e2e8f0', paddingBottom: '15px', textAlign: 'left' }}>
                                    <h2 style={{ color: darkGreen, margin: 0 }}>Speech Analysis</h2>
                                </div>
                                <div style={{ display: 'flex', gap: '20px', flexWrap: 'wrap' }}>
                                    <SquareCard icon='🗣️' label='Speaking Pace' value={`${s.wpm || 0} WPM`} subLabel={s.wpm_feedback || 'Words per minute'} colorHex={primaryColor} />
                                    <SquareCard icon='🎙️' label='Voice Tone' value={s.tone || "N/A"} subLabel='Tone Analysis' colorHex={primaryColor} isTextValue={true} />
                                    <SquareCard icon='⏸️' label='Pauses Ratio' value={`${s.pause_ratio || 0}%`} subLabel={s.speech_pattern || 'Speech Pattern'} colorHex={(s.pause_ratio || 0) > 40 ? '#f59e0b' : primaryColor} />
                                </div>
                              
                            </div>
                        )}

                      {activeTab === 'content' && (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '25px', position: 'relative' }}>
        <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '-10px' }}>
            <div style={{ backgroundColor: '#0f4c5c', color: 'white', padding: '10px 25px', borderRadius: '25px', fontWeight: 'bold', fontSize: '1.2rem', boxShadow: '0 4px 6px rgba(0,0,0,0.1)' }}>
                Score: {currentResult.content?.score || 0}/100
            </div>
        </div>

        <div style={{ backgroundColor: '#f8fafc', padding: '25px', borderRadius: '15px', border: '1px solid #e2e8f0', textAlign: 'left', boxShadow: '0 2px 4px rgba(0,0,0,0.02)' }}>
            <h4 style={{ color: '#0f4c5c', display: 'flex', alignItems: 'center', gap: '10px', marginTop: 0, borderBottom: '1px solid #e2e8f0', paddingBottom: '10px' }}>
                📢 General Feedback:
            </h4>
            {/* 🚀 التعديل هنا: إضافة direction و textAlign و unicodeBidi */}
            <p style={{ color: '#475569', lineHeight: '1.6', fontSize: '1.05rem', marginTop: '15px', direction: 'rtl', textAlign: 'right', unicodeBidi: 'plaintext' }}>
                {currentResult.content?.feedback || "No feedback available."}
            </p>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))', gap: '20px' }}>
            <div style={{ backgroundColor: '#fffdf5', padding: '25px', borderRadius: '15px', border: '1px solid #fef3c7', textAlign: 'left' }}>
                <h4 style={{ color: '#92400e', display: 'flex', alignItems: 'center', gap: '10px', marginTop: 0 }}>
                    💡 Tips to Improve:
                </h4>
                <ul style={{ listStyleType: 'none', padding: 0, color: '#92400e', marginTop: '15px' }}>
                    {(currentResult.content?.tips || []).map((tip, i) => (
                        // 🚀 التعديل هنا لترتيب النقاط (Tips)
                        <li key={i} style={{ marginBottom: '15px', display: 'flex', gap: '10px', alignItems: 'flex-start', lineHeight: '1.5', direction: 'rtl', textAlign: 'right', unicodeBidi: 'plaintext' }}>
                            <span style={{ fontSize: '1.2rem' }}>•</span>
                            <span>{tip}</span>
                        </li>
                    ))}
                    {(!currentResult.content?.tips || currentResult.content.tips.length === 0) && (
                        <li style={{ direction: 'rtl', textAlign: 'right' }}>No tips available.</li>
                    )}
                </ul>
            </div>

            <div style={{ backgroundColor: '#f0fdf4', padding: '25px', borderRadius: '15px', border: '1px solid #dcfce7', textAlign: 'left' }}>
                <h4 style={{ color: '#166534', display: 'flex', alignItems: 'center', gap: '10px', marginTop: 0 }}>
                    ✅ Ideal Answer:
                </h4>
                {/* 🚀 التعديل هنا للإجابة النموذجية */}
                <div style={{ color: '#166534', lineHeight: '1.7', fontSize: '0.95rem', backgroundColor: 'rgba(255,255,255,0.6)', padding: '15px', borderRadius: '10px', marginTop: '15px', border: '1px solid #dcfce7', direction: 'rtl', textAlign: 'right', unicodeBidi: 'plaintext' }}>
                    {currentResult.content?.ideal_answer || "Ideal answer will be provided soon."}
                </div>
            </div>
        </div>
    </div>
)}
                    </div>

                    <div style={{ marginTop: '40px', display: 'flex', justifyContent: 'center' }}>
                        <button onClick={handleStartNew} style={{ padding: '15px 40px', borderRadius: '50px', border: 'none', backgroundColor: darkGreen, color: '#fff', fontSize: '1.1rem', fontWeight: 'bold', cursor: 'pointer' }}>
                            Start New Interview
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default FeedbackDashboard;