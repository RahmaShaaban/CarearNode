// import React, { useEffect, useState } from 'react';
// import { useParams } from 'react-router-dom'; // عشان نسحب الـ ID من الرابط

// // ==========================================
// // 🧮 دوال حساب الدرجات (Scoring Logic) - كما هي في ملفك الأصلي
// // ==========================================
// export const calculateScores = (result) => {
//     // التحويل من هيكل الداتابيز (analysis_data) لهيكل الحسابات
//     const data = result.analysis_data || result; 
//     if (!data || data.error) return { knowledge: 0, verbal: 0, nonVerbal: 0, overall: 0, attireScore: 0 };

//     const knowledge = data.content?.score || 0;
//     const speech = data.speech || {};
//     let wpmScore = 100;
//     if (speech.wpm < 110) wpmScore = Math.max(0, 100 - (110 - speech.wpm));
//     else if (speech.wpm > 160) wpmScore = Math.max(0, 100 - (speech.wpm - 160));

//     let pauseScore = 100;
//     if (speech.pause_ratio > 45) pauseScore = Math.max(0, 100 - (speech.pause_ratio - 45) * 1.5);
//     else if (speech.pause_ratio < 15) pauseScore = 80;

//     let toneScore = 80; 
//     if (speech.tone?.includes("Dynamic")) toneScore = 100;
//     if (speech.tone?.includes("Monotone")) toneScore = 50;

//     const verbal = (wpmScore * 0.4) + (pauseScore * 0.4) + (toneScore * 0.2);

//     const vision = data.vision || {};
//     const handOpen = vision.hand?.open_score || 0; 
//     const explaining = vision.body?.explaining_score || 0; 
//     const straightRaw = vision.body?.straight_score || 0; 
//     const straight = straightRaw > 10 ? 100 : (straightRaw / 10) * 100;
//     const eye = vision.eye_contact?.score || 0;
//     const head = vision.head_focus?.score || 0;
//     const attire = vision.attire?.score || 0;
//     const positive = vision.emotions?.positive || 0;

//     const nonVerbal = (handOpen * 0.10) + (straight * 0.10) + (explaining * 0.10) + (eye * 0.30) + (head * 0.20) + (attire * 0.10) + (positive * 0.10);
//     const overall = (knowledge * 0.4) + (verbal * 0.3) + (nonVerbal * 0.3);

//     return {
//         knowledge: Number(knowledge).toFixed(1),
//         verbal: Number(verbal).toFixed(1),
//         nonVerbal: Number(nonVerbal).toFixed(1),
//         overall: Number(overall).toFixed(1),
//         attireScore: Number(attire)
//     };
// };

// export const calculateInterviewAverages = (allResults) => {
//     if (!allResults || allResults.length === 0) return { knowledge: 0, verbal: 0, nonVerbal: 0, overall: 0, attireScore: 0 };

//     let totalKnowledge = 0, totalVerbal = 0, totalNonVerbal = 0, totalOverall = 0, totalAttire = 0;
//     let validQuestionsCount = 0;

//     allResults.forEach(item => {
//         const scores = calculateScores(item);
//         totalKnowledge += parseFloat(scores.knowledge);
//         totalVerbal += parseFloat(scores.verbal);
//         totalNonVerbal += parseFloat(scores.nonVerbal);
//         totalOverall += parseFloat(scores.overall);
//         totalAttire += parseFloat(scores.attireScore);
//         validQuestionsCount++;
//     });

//     return {
//         knowledge: (totalKnowledge / validQuestionsCount).toFixed(1),
//         verbal: (totalVerbal / validQuestionsCount).toFixed(1),
//         nonVerbal: (totalNonVerbal / validQuestionsCount).toFixed(1),
//         overall: (totalOverall / validQuestionsCount).toFixed(1),
//         attireScore: (totalAttire / validQuestionsCount).toFixed(1)
//     };
// };

// // ==========================================
// // 🎨 مكون PillarCard (نفس الـ UI بتاعك بالظبط)
// // ==========================================
// const PillarCard = ({ icon, title, subtitle, score, colorHex, isStatus, statusText, isArabic }) => {
//     const isFormal = statusText === 'FORMAL' || statusText === 'رسمي';
//     const statusBg = isFormal ? '#e6f2ef' : '#f1f5f9';
//     const statusColor = isFormal ? '#2F5D54' : '#64748b';

//     return (
//         <div style={{
//             display: 'flex', justifyContent: 'space-between', alignItems: 'center',
//             padding: '20px 25px', marginBottom: '15px', backgroundColor: '#ffffff',
//             border: '1px solid #dbece8', borderRadius: '12px',
//             boxShadow: '0 4px 15px rgba(47, 93, 84, 0.05)',
//             flexDirection: isArabic ? 'row-reverse' : 'row'
//         }}>
//             <div style={{ display: 'flex', alignItems: 'center', gap: '20px', flexDirection: isArabic ? 'row-reverse' : 'row' }}>
//                 <div style={{
//                     width: '50px', height: '50px', borderRadius: '12px',
//                     backgroundColor: `${colorHex}1A`, color: colorHex,
//                     display: 'flex', justifyContent: 'center', alignItems: 'center'
//                 }}>{icon}</div>
//                 <div style={{ textAlign: isArabic ? 'right' : 'left' }}>
//                     <div style={{ fontWeight: 'bold', fontSize: '1.15rem', color: '#2F5D54' }}>{title}</div>
//                     <div style={{ fontSize: '0.9rem', color: '#64748b', marginTop: '4px' }}>{subtitle}</div>
//                 </div>
//             </div>
//             <div style={{ width: '130px', textAlign: isArabic ? 'left' : 'right' }}>
//                 {isStatus ? (
//                     <div style={{
//                         display: 'inline-block', padding: '6px 16px', backgroundColor: statusBg, 
//                         color: statusColor, borderRadius: '20px', fontSize: '0.8rem', fontWeight: 'bold',
//                         border: `1px solid ${isFormal ? '#58A492' : '#cbd5e1'}`
//                     }}>
//                         {isArabic ? `الحالة: ${statusText}` : `STATUS: ${statusText}`}
//                     </div>
//                 ) : (
//                     <>
//                         <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#2F5D54', marginBottom: '8px' }}>
//                             {Math.round(score)}/100
//                         </div>
//                         <div style={{ width: '100%', height: '8px', backgroundColor: '#e2e8f0', borderRadius: '4px', overflow: 'hidden', direction: 'ltr' }}>
//                             <div style={{ width: `${score}%`, height: '100%', backgroundColor: colorHex, borderRadius: '4px' }}></div>
//                         </div>
//                     </>
//                 )}
//             </div>
//         </div>
//     );
// };

// // ==========================================
// // 🚀 المكون الرئيسي (معدل لجلب البيانات من السيرفر)
// // ==========================================
// const OverallFeedback = ({ isArabic, interviewId: propsId }) => {
//     const { interviewId: urlId } = useParams(); 
    
//     // 💡 هنا بنحدد الـ ID اللي هنشتغل بيه: لو جاي في الـ Props نستخدمه، وإلا نستخدم اللي في الـ URL
//     const activeInterviewId = propsId || urlId; 

//     const [allResults, setAllResults] = useState([]);
//     const [loading, setLoading] = useState(true);

//     const primaryColor = '#58A492';
//     const darkGreen = '#2F5D54';
//     const bgColor = '#F0F7F5';

//     useEffect(() => {
//         console.log("🔍 Active Interview ID:", activeInterviewId);

//         const fetchFeedback = async () => {
//             if (!activeInterviewId) return; // لو مفيش ID نخرج فوراً

//             try {
//                 setLoading(true);
//                 // 📡 بنستخدم الـ activeInterviewId اللي حددناه فوق
//                 const response = await fetch(`http://localhost:5001/api/interview/feedback/${activeInterviewId}`);
//                 const result = await response.json();
                
//                 console.log("📡 Server Response:", result);

//                 if (result.success && result.data) {
//                     setAllResults(result.data);
//                 } else {
//                     console.error("❌ Failed to get data:", result.error);
//                 }
//             } catch (error) {
//                 console.error("❌ Fetch Error:", error);
//             } finally {
//                 setLoading(false);
//             }
//         };

//         fetchFeedback();
        
//     }, [activeInterviewId]); // 👈 لازم الـ Dependency تكون activeInterviewId

//     if (loading) return <div style={{ textAlign: 'center', padding: '50px', color: darkGreen }}>Loading Assessment...</div>;
//     if (allResults.length === 0) return <div style={{ textAlign: 'center', padding: '50px', color: 'red' }}>No Results Found.</div>;

//     const scores = calculateInterviewAverages(allResults);

//     const isFormalOverall = parseFloat(scores.attireScore) >= 50;
//     const formalityStatus = isArabic ? (isFormalOverall ? "رسمي" : "غير رسمي") : (isFormalOverall ? "FORMAL" : "CASUAL");

//     let overviewText = "";
//     if (scores.overall >= 80) overviewText = isArabic ? "أداء ممتاز! لقد أظهرت كفاءة عالية في المعرفة والتواصل." : "Excellent performance! You demonstrated high proficiency in knowledge and communication.";
//     else if (scores.overall >= 60) overviewText = isArabic ? "أداء جيد، ولكن هناك مساحة للتحسين في بعض المهارات." : "Good performance, but there is room for improvement in some areas.";
//     else overviewText = isArabic ? "الأداء دون التوقعات. تحتاج إلى تدريب مكثف على المعرفة التقنية ومهارات التواصل." : "Performance was below expectations. Significant improvements are needed.";

//     const icons = {
//         nonVerbal: <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>,
//         verbal: <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z"></path><path d="M19 10v2a7 7 0 0 1-14 0v-2"></path><line x1="12" y1="19" x2="12" y2="23"></line></svg>,
//         knowledge: <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path></svg>,
//         formality: <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="7" width="20" height="14" rx="2" ry="2"></rect><path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"></path></svg>
//     };

//     return (
//         <div style={{ borderRadius: '12px', padding: '20px 0', textAlign: isArabic ? 'right' : 'left', maxWidth: '1000px', margin: '0 auto' }}>
//             <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '25px', flexDirection: isArabic ? 'row-reverse' : 'row' }}>
//                 <h2 style={{ color: darkGreen, margin: 0, fontSize: '1.6rem', fontWeight: '800' }}>
//                     {isArabic ? "أعمدة التقييم الشامل" : "Overall Assessment Pillars"}
//                 </h2>
//                 <div style={{ background: primaryColor, color: '#fff', padding: '8px 20px', borderRadius: '50px', fontWeight: 'bold', fontSize: '1.1rem' }}>
//                     {isArabic ? "الدرجة الكلية: " : "Total Score: "} {scores.overall}%
//                 </div>
//             </div>

//             <div style={{ display: 'flex', flexDirection: 'column' }}>
//                 <PillarCard icon={icons.nonVerbal} title={isArabic ? "التواصل غير اللفظي" : "Non-Verbal Communication"} subtitle={isArabic ? "لغة الجسد، التواصل البصري" : "Body Language, Eye Contact"} score={scores.nonVerbal} colorHex={primaryColor} isArabic={isArabic} />
//                 <PillarCard icon={icons.verbal} title={isArabic ? "التواصل اللفظي" : "Verbal Communication"} subtitle={isArabic ? "وضوح الصوت، النبرة" : "Speech Clarity, Tone"} score={scores.verbal} colorHex={primaryColor} isArabic={isArabic} />
//                 <PillarCard icon={icons.knowledge} title={isArabic ? "المعرفة والمحتوى" : "Knowledge & Content"} subtitle={isArabic ? "الدقة التقنية، هيكلة الإجابة" : "Technical Accuracy, Structure"} score={scores.knowledge} colorHex={primaryColor} isArabic={isArabic} />
//                 <PillarCard icon={icons.formality} title={isArabic ? "المظهر العام" : "Formality Detection"} subtitle={isArabic ? "الملابس والسياق العام" : "Attire, Background"} isStatus={true} statusText={formalityStatus} colorHex={primaryColor} isArabic={isArabic} />
//             </div>

//             <h3 style={{ color: darkGreen, marginTop: '35px', marginBottom: '15px', fontWeight: 'bold' }}>{isArabic ? "نظرة عامة:" : "Overall Overview:"}</h3>
//             <div style={{ 
//                 background: '#ffffff', padding: '20px', borderRadius: '12px', border: '1px solid #dbece8',
//                 borderRight: isArabic ? `5px solid ${primaryColor}` : '1px solid #dbece8',
//                 borderLeft: isArabic ? '1px solid #dbece8' : `5px solid ${primaryColor}`,
//                 color: darkGreen, boxShadow: '0 4px 15px rgba(47, 93, 84, 0.05)'
//             }}>
//                 {overviewText}
//             </div>
//         </div>
//     );
// };

// export default OverallFeedback;
// import React, { useEffect, useState } from 'react';
// import { useParams } from 'react-router-dom';

// // ==========================================
// // 🧮 دوال حساب الدرجات (Scoring Logic)
// // ==========================================
// export const calculateScores = (result) => {
//     const data = result.analysis_data || result; 
//     if (!data || data.error) return { knowledge: 0, verbal: 0, nonVerbal: 0, overall: 0, attireScore: 0 };

//     const knowledge = data.content?.score || 0;
//     const speech = data.speech || {};
//     let wpmScore = 100;
//     if (speech.wpm < 110) wpmScore = Math.max(0, 100 - (110 - speech.wpm));
//     else if (speech.wpm > 160) wpmScore = Math.max(0, 100 - (speech.wpm - 160));

//     let pauseScore = 100;
//     if (speech.pause_ratio > 45) pauseScore = Math.max(0, 100 - (speech.pause_ratio - 45) * 1.5);
//     else if (speech.pause_ratio < 15) pauseScore = 80;

//     let toneScore = 80; 
//     if (speech.tone?.includes("Dynamic")) toneScore = 100;
//     if (speech.tone?.includes("Monotone")) toneScore = 50;

//     const verbal = (wpmScore * 0.4) + (pauseScore * 0.4) + (toneScore * 0.2);

//     const vision = data.vision || {};
//     const handOpen = vision.hand?.open_score || 0; 
//     const explaining = vision.body?.explaining_score || 0; 
//     const straightRaw = vision.body?.straight_score || 0; 
//     const straight = straightRaw > 10 ? 100 : (straightRaw / 10) * 100;
//     const eye = vision.eye_contact?.score || 0;
//     const head = vision.head_focus?.score || 0;
//     const attire = vision.attire?.score || 0;
//     const positive = vision.emotions?.positive || 0;

//     const nonVerbal = (handOpen * 0.10) + (straight * 0.10) + (explaining * 0.10) + (eye * 0.30) + (head * 0.20) + (attire * 0.10) + (positive * 0.10);
//     const overall = (knowledge * 0.4) + (verbal * 0.3) + (nonVerbal * 0.3);

//     return {
//         knowledge: Number(knowledge).toFixed(1),
//         verbal: Number(verbal).toFixed(1),
//         nonVerbal: Number(nonVerbal).toFixed(1),
//         overall: Number(overall).toFixed(1),
//         attireScore: Number(attire)
//     };
// };

// export const calculateInterviewAverages = (allResults) => {
//     if (!allResults || allResults.length === 0) return { knowledge: 0, verbal: 0, nonVerbal: 0, overall: 0, attireScore: 0 };

//     let totalKnowledge = 0, totalVerbal = 0, totalNonVerbal = 0, totalOverall = 0, totalAttire = 0;
//     let validQuestionsCount = 0;

//     allResults.forEach(item => {
//         const scores = calculateScores(item);
//         totalKnowledge += parseFloat(scores.knowledge);
//         totalVerbal += parseFloat(scores.verbal);
//         totalNonVerbal += parseFloat(scores.nonVerbal);
//         totalOverall += parseFloat(scores.overall);
//         totalAttire += parseFloat(scores.attireScore);
//         validQuestionsCount++;
//     });

//     return {
//         knowledge: (totalKnowledge / validQuestionsCount).toFixed(1),
//         verbal: (totalVerbal / validQuestionsCount).toFixed(1),
//         nonVerbal: (totalNonVerbal / validQuestionsCount).toFixed(1),
//         overall: (totalOverall / validQuestionsCount).toFixed(1),
//         attireScore: (totalAttire / validQuestionsCount).toFixed(1)
//     };
// };

// // ==========================================
// // 🎨 مكون PillarCard
// // ==========================================
// const PillarCard = ({ icon, title, subtitle, score, colorHex, isStatus, statusText, isArabic }) => {
//     const isFormal = statusText === 'FORMAL' || statusText === 'رسمي';
//     const statusBg = isFormal ? '#e6f2ef' : '#f1f5f9';
//     const statusColor = isFormal ? '#2F5D54' : '#64748b';

//     return (
//         <div style={{
//             display: 'flex', justifyContent: 'space-between', alignItems: 'center',
//             padding: '20px 25px', marginBottom: '15px', backgroundColor: '#ffffff',
//             border: '1px solid #dbece8', borderRadius: '12px',
//             boxShadow: '0 4px 15px rgba(47, 93, 84, 0.05)',
//             flexDirection: isArabic ? 'row-reverse' : 'row'
//         }}>
//             <div style={{ display: 'flex', alignItems: 'center', gap: '20px', flexDirection: isArabic ? 'row-reverse' : 'row' }}>
//                 <div style={{
//                     width: '50px', height: '50px', borderRadius: '12px',
//                     backgroundColor: `${colorHex}1A`, color: colorHex,
//                     display: 'flex', justifyContent: 'center', alignItems: 'center'
//                 }}>{icon}</div>
//                 <div style={{ textAlign: isArabic ? 'right' : 'left' }}>
//                     <div style={{ fontWeight: 'bold', fontSize: '1.15rem', color: '#2F5D54' }}>{title}</div>
//                     <div style={{ fontSize: '0.9rem', color: '#64748b', marginTop: '4px' }}>{subtitle}</div>
//                 </div>
//             </div>
//             <div style={{ width: '130px', textAlign: isArabic ? 'left' : 'right' }}>
//                 {isStatus ? (
//                     <div style={{
//                         display: 'inline-block', padding: '6px 16px', backgroundColor: statusBg, 
//                         color: statusColor, borderRadius: '20px', fontSize: '0.8rem', fontWeight: 'bold',
//                         border: `1px solid ${isFormal ? '#58A492' : '#cbd5e1'}`
//                     }}>
//                         {isArabic ? `الحالة: ${statusText}` : `STATUS: ${statusText}`}
//                     </div>
//                 ) : (
//                     <>
//                         <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#2F5D54', marginBottom: '8px' }}>
//                             {Math.round(score)}/100
//                         </div>
//                         <div style={{ width: '100%', height: '8px', backgroundColor: '#e2e8f0', borderRadius: '4px', overflow: 'hidden', direction: 'ltr' }}>
//                             <div style={{ width: `${score}%`, height: '100%', backgroundColor: colorHex, borderRadius: '4px' }}></div>
//                         </div>
//                     </>
//                 )}
//             </div>
//         </div>
//     );
// };

// // ==========================================
// // 🚀 المكون الرئيسي
// // ==========================================
// const OverallFeedback = ({ isArabic, interviewId: propsId }) => {
//     const { interviewId: urlId } = useParams(); 
//     const activeInterviewId = propsId || urlId; 

//     const [allResults, setAllResults] = useState([]);
//     const [loading, setLoading] = useState(true);

//     const primaryColor = '#58A492';
//     const darkGreen = '#2F5D54';

//     // 1️⃣ جلب البيانات من السيرفر
//     useEffect(() => {
//         const fetchFeedback = async () => {
//             if (!activeInterviewId) return;
//             try {
//                 setLoading(true);
//                 const response = await fetch(`http://localhost:5001/api/interview/feedback/${activeInterviewId}`);
//                 const result = await response.json();
//                 if (result.success && result.data) {
//                     setAllResults(result.data);
//                 }
//             } catch (error) {
//                 console.error("❌ Fetch Error:", error);
//             } finally {
//                 setLoading(false);
//             }
//         };
//         fetchFeedback();
//     }, [activeInterviewId]);

//     // 2️⃣ الحفظ التلقائي للملخص (Summary) عند اكتمال البيانات
//     useEffect(() => {
//         if (!loading && allResults.length > 0) {
//             const finalScores = calculateInterviewAverages(allResults);
            
//             // حساب النصوص والحالة برمجياً للإرسال
//             const isFormalOverall = parseFloat(finalScores.attireScore) >= 50;
//             const currentFormalityStatus = isArabic ? (isFormalOverall ? "رسمي" : "غير رسمي") : (isFormalOverall ? "FORMAL" : "CASUAL");
            
//             let currentOverviewText = "";
//             if (finalScores.overall >= 80) currentOverviewText = isArabic ? "أداء ممتاز! لقد أظهرت كفاءة عالية في المعرفة والتواصل." : "Excellent performance! You demonstrated high proficiency in knowledge and communication.";
//             else if (finalScores.overall >= 60) currentOverviewText = isArabic ? "أداء جيد، ولكن هناك مساحة للتحسين في بعض المهارات." : "Good performance, but there is room for improvement in some areas.";
//             else currentOverviewText = isArabic ? "الأداء دون التوقعات. تحتاج إلى تدريب مكثف على المعرفة التقنية ومهارات التواصل." : "Performance was below expectations. Significant improvements are needed.";

//             const saveSummaryToDB = async () => {
//                 const summaryPayload = {
//                     interviewId: activeInterviewId,
//                     overallScore: finalScores.overall,
//                     overallFeedback: currentOverviewText, 
//                     summaryData: {
//                         averages: finalScores,
//                         formalityStatus: currentFormalityStatus,
//                         overviewText: currentOverviewText
//                     }
//                 };

//                 try {
//                     await fetch('http://localhost:5001/api/interview/finish', {
//                         method: 'POST',
//                         headers: { 'Content-Type': 'application/json' },
//                         body: JSON.stringify(summaryPayload)
//                     });
//                     console.log("✅ Summary stored in Database successfully");
//                 } catch (err) {
//                     console.error("❌ Failed to store summary:", err);
//                 }
//             };
//             saveSummaryToDB();
//         }
//     }, [loading, allResults, activeInterviewId, isArabic]);

//     if (loading) return <div style={{ textAlign: 'center', padding: '50px', color: darkGreen }}>Loading Assessment...</div>;
//     if (allResults.length === 0) return <div style={{ textAlign: 'center', padding: '50px', color: 'red' }}>No Results Found.</div>;

//     // حسابات العرض في الـ UI
//     const scores = calculateInterviewAverages(allResults);
//     const isFormalOverall = parseFloat(scores.attireScore) >= 50;
//     const formalityStatus = isArabic ? (isFormalOverall ? "رسمي" : "غير رسمي") : (isFormalOverall ? "FORMAL" : "CASUAL");

//     let overviewText = "";
//     if (scores.overall >= 80) overviewText = isArabic ? "أداء ممتاز! لقد أظهرت كفاءة عالية في المعرفة والتواصل." : "Excellent performance! You demonstrated high proficiency in knowledge and communication.";
//     else if (scores.overall >= 60) overviewText = isArabic ? "أداء جيد، ولكن هناك مساحة للتحسين في بعض المهارات." : "Good performance, but there is room for improvement in some areas.";
//     else overviewText = isArabic ? "الأداء دون التوقعات. تحتاج إلى تدريب مكثف على المعرفة التقنية ومهارات التواصل." : "Performance was below expectations. Significant improvements are needed.";

//     const icons = {
//         nonVerbal: <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>,
//         verbal: <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z"></path><path d="M19 10v2a7 7 0 0 1-14 0v-2"></path><line x1="12" y1="19" x2="12" y2="23"></line></svg>,
//         knowledge: <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path></svg>,
//         formality: <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="7" width="20" height="14" rx="2" ry="2"></rect><path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"></path></svg>
//     };

//     return (
//         <div style={{ borderRadius: '12px', padding: '20px 0', textAlign: isArabic ? 'right' : 'left', maxWidth: '1000px', margin: '0 auto' }}>
//             <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '25px', flexDirection: isArabic ? 'row-reverse' : 'row' }}>
//                 <h2 style={{ color: darkGreen, margin: 0, fontSize: '1.6rem', fontWeight: '800' }}>
//                     {isArabic ? "أعمدة التقييم الشامل" : "Overall Assessment Pillars"}
//                 </h2>
//                 <div style={{ background: primaryColor, color: '#fff', padding: '8px 20px', borderRadius: '50px', fontWeight: 'bold', fontSize: '1.1rem' }}>
//                     {isArabic ? "الدرجة الكلية: " : "Total Score: "} {scores.overall}%
//                 </div>
//             </div>

//             <div style={{ display: 'flex', flexDirection: 'column' }}>
//                 <PillarCard icon={icons.nonVerbal} title={isArabic ? "التواصل غير اللفظي" : "Non-Verbal Communication"} subtitle={isArabic ? "لغة الجسد، التواصل البصري" : "Body Language, Eye Contact"} score={scores.nonVerbal} colorHex={primaryColor} isArabic={isArabic} />
//                 <PillarCard icon={icons.verbal} title={isArabic ? "التواصل اللفظي" : "Verbal Communication"} subtitle={isArabic ? "وضوح الصوت، النبرة" : "Speech Clarity, Tone"} score={scores.verbal} colorHex={primaryColor} isArabic={isArabic} />
//                 <PillarCard icon={icons.knowledge} title={isArabic ? "المعرفة والمحتوى" : "Knowledge & Content"} subtitle={isArabic ? "الدقة التقنية، هيكلة الإجابة" : "Technical Accuracy, Structure"} score={scores.knowledge} colorHex={primaryColor} isArabic={isArabic} />
//                 <PillarCard icon={icons.formality} title={isArabic ? "المظهر العام" : "Formality Detection"} subtitle={isArabic ? "الملابس والسياق العام" : "Attire, Background"} isStatus={true} statusText={formalityStatus} colorHex={primaryColor} isArabic={isArabic} />
//             </div>

//             <h3 style={{ color: darkGreen, marginTop: '35px', marginBottom: '15px', fontWeight: 'bold' }}>{isArabic ? "نظرة عامة:" : "Overall Overview:"}</h3>
//             <div style={{ 
//                 background: '#ffffff', padding: '20px', borderRadius: '12px', border: '1px solid #dbece8',
//                 borderRight: isArabic ? `5px solid ${primaryColor}` : '1px solid #dbece8',
//                 borderLeft: isArabic ? '1px solid #dbece8' : `5px solid ${primaryColor}`,
//                 color: darkGreen, boxShadow: '0 4px 15px rgba(47, 93, 84, 0.05)'
//             }}>
//                 {overviewText}
//             </div>
//         </div>
//     );
// };

// export default OverallFeedback;






import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';

// ==========================================
// 🧮 دوال حساب الدرجات (Scoring Logic)
// ==========================================
export const calculateScores = (result) => {
    const data = result.analysis_data || result; 
    if (!data || data.error) return { knowledge: 0, verbal: 0, nonVerbal: 0, overall: 0, attireScore: 0 };

    const knowledge = data.content?.score || 0;
    const speech = data.speech || {};
    let wpmScore = 100;
    if (speech.wpm < 110) wpmScore = Math.max(0, 100 - (110 - speech.wpm));
    else if (speech.wpm > 160) wpmScore = Math.max(0, 100 - (speech.wpm - 160));

    let pauseScore = 100;
    if (speech.pause_ratio > 45) pauseScore = Math.max(0, 100 - (speech.pause_ratio - 45) * 1.5);
    else if (speech.pause_ratio < 15) pauseScore = 80;

    let toneScore = 80; 
    if (speech.tone?.includes("Dynamic")) toneScore = 100;
    if (speech.tone?.includes("Monotone")) toneScore = 50;

    const verbal = (wpmScore * 0.4) + (pauseScore * 0.4) + (toneScore * 0.2);

    const vision = data.vision || {};
    const handOpen = vision.hand?.open_score || 0; 
    const explaining = vision.body?.explaining_score || 0; 
    const straightRaw = vision.body?.straight_score || 0; 
    const straight = straightRaw > 10 ? 100 : (straightRaw / 10) * 100;
    const eye = vision.eye_contact?.score || 0;
    const head = vision.head_focus?.score || 0;
    const attire = vision.attire?.score || 0;
    const positive = vision.emotions?.positive || 0;

    const nonVerbal = (handOpen * 0.10) + (straight * 0.10) + (explaining * 0.10) + (eye * 0.30) + (head * 0.20) + (attire * 0.10) + (positive * 0.10);
    const overall = (knowledge * 0.4) + (verbal * 0.3) + (nonVerbal * 0.3);

    return {
        knowledge: Number(knowledge).toFixed(1),
        verbal: Number(verbal).toFixed(1),
        nonVerbal: Number(nonVerbal).toFixed(1),
        overall: Number(overall).toFixed(1),
        attireScore: Number(attire)
    };
};

export const calculateInterviewAverages = (allResults) => {
    if (!allResults || allResults.length === 0) return { knowledge: 0, verbal: 0, nonVerbal: 0, overall: 0, attireScore: 0 };

    let totalKnowledge = 0, totalVerbal = 0, totalNonVerbal = 0, totalOverall = 0, totalAttire = 0;
    let validQuestionsCount = 0;

    allResults.forEach(item => {
        const scores = calculateScores(item);
        totalKnowledge += parseFloat(scores.knowledge);
        totalVerbal += parseFloat(scores.verbal);
        totalNonVerbal += parseFloat(scores.nonVerbal);
        totalOverall += parseFloat(scores.overall);
        totalAttire += parseFloat(scores.attireScore);
        validQuestionsCount++;
    });

    return {
        knowledge: (totalKnowledge / validQuestionsCount).toFixed(1),
        verbal: (totalVerbal / validQuestionsCount).toFixed(1),
        nonVerbal: (totalNonVerbal / validQuestionsCount).toFixed(1),
        overall: (totalOverall / validQuestionsCount).toFixed(1),
        attireScore: (totalAttire / validQuestionsCount).toFixed(1)
    };
};

// ==========================================
// 🎨 مكون PillarCard
// ==========================================
const PillarCard = ({ icon, title, subtitle, score, colorHex, isStatus, statusText, isArabic }) => {
    const isFormal = statusText === 'FORMAL' || statusText === 'رسمي';
    const statusBg = isFormal ? '#e6f2ef' : '#f1f5f9';
    const statusColor = isFormal ? '#2F5D54' : '#64748b';

    return (
        <div style={{
            display: 'flex', justifyContent: 'space-between', alignItems: 'center',
            padding: '20px 25px', marginBottom: '15px', backgroundColor: '#ffffff',
            border: '1px solid #dbece8', borderRadius: '12px',
            boxShadow: '0 4px 15px rgba(47, 93, 84, 0.05)',
            flexDirection: isArabic ? 'row-reverse' : 'row'
        }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '20px', flexDirection: isArabic ? 'row-reverse' : 'row' }}>
                <div style={{
                    width: '50px', height: '50px', borderRadius: '12px',
                    backgroundColor: `${colorHex}1A`, color: colorHex,
                    display: 'flex', justifyContent: 'center', alignItems: 'center'
                }}>{icon}</div>
                <div style={{ textAlign: isArabic ? 'right' : 'left' }}>
                    <div style={{ fontWeight: 'bold', fontSize: '1.15rem', color: '#2F5D54' }}>{title}</div>
                    <div style={{ fontSize: '0.9rem', color: '#64748b', marginTop: '4px' }}>{subtitle}</div>
                </div>
            </div>
            <div style={{ width: '130px', textAlign: isArabic ? 'left' : 'right' }}>
                {isStatus ? (
                    <div style={{
                        display: 'inline-block', padding: '6px 16px', backgroundColor: statusBg, 
                        color: statusColor, borderRadius: '20px', fontSize: '0.8rem', fontWeight: 'bold',
                        border: `1px solid ${isFormal ? '#58A492' : '#cbd5e1'}`
                    }}>
                        {isArabic ? `الحالة: ${statusText}` : `STATUS: ${statusText}`}
                    </div>
                ) : (
                    <>
                        <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#2F5D54', marginBottom: '8px' }}>
                            {Math.round(score)}/100
                        </div>
                        <div style={{ width: '100%', height: '8px', backgroundColor: '#e2e8f0', borderRadius: '4px', overflow: 'hidden', direction: 'ltr' }}>
                            <div style={{ width: `${score}%`, height: '100%', backgroundColor: colorHex, borderRadius: '4px' }}></div>
                        </div>
                    </>
                )}
            </div>
        </div>
    );
};

// ==========================================
// 🚀 المكون الرئيسي
// ==========================================
const OverallFeedback = ({ isArabic, interviewId: propsId }) => {
    const { interviewId: urlId } = useParams(); 
    const activeInterviewId = propsId || urlId; 

    const [allResults, setAllResults] = useState([]);
    const [loading, setLoading] = useState(true);

    // الـ States الخاصة بـ نسيج إرسال الإيميل
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [email, setEmail] = useState('');
    const [isSending, setIsSending] = useState(false);
    const [isSentSuccess, setIsSentSuccess] = useState(false);

    const primaryColor = '#58A492';
    const darkGreen = '#2F5D54';

    // 1️⃣ جلب البيانات من السيرفر
    useEffect(() => {
        const fetchFeedback = async () => {
            if (!activeInterviewId) return;
            try {
                setLoading(true);
                const response = await fetch(`http://localhost:5001/api/interview/feedback/${activeInterviewId}`);
                const result = await response.json();
                if (result.success && result.data) {
                    setAllResults(result.data);
                }
            } catch (error) {
                console.error("❌ Fetch Error:", error);
            } finally {
                setLoading(false);
            }
        };
        fetchFeedback();
    }, [activeInterviewId]);

    // 2️⃣ الحفظ التلقائي للملخص (Summary) عند اكتمال البيانات
    useEffect(() => {
        if (!loading && allResults.length > 0) {
            const finalScores = calculateInterviewAverages(allResults);
            
            const isFormalOverall = parseFloat(finalScores.attireScore) >= 50;
            const currentFormalityStatus = isArabic ? (isFormalOverall ? "رسمي" : "غير رسمي") : (isFormalOverall ? "FORMAL" : "CASUAL");
            
            let currentOverviewText = "";
            if (finalScores.overall >= 80) currentOverviewText = isArabic ? "أداء ممتاز! لقد أظهرت كفاءة عالية في المعرفة والتواصل." : "Excellent performance! You demonstrated high proficiency in knowledge and communication.";
            else if (finalScores.overall >= 60) currentOverviewText = isArabic ? "أداء جيد، ولكن هناك مساحة للتحسين في بعض المهارات." : "Good performance, but there is room for improvement in some areas.";
            else currentOverviewText = isArabic ? "الأداء دون التوقعات. تحتاج إلى تدريب مكثف على المعرفة التقنية ومهارات التواصل." : "Performance was below expectations. Significant improvements are needed.";

            const saveSummaryToDB = async () => {
                const summaryPayload = {
                    interviewId: activeInterviewId,
                    overallScore: finalScores.overall,
                    overallFeedback: currentOverviewText, 
                    summaryData: {
                        averages: finalScores,
                        formalityStatus: currentFormalityStatus,
                        overviewText: currentOverviewText
                    }
                };

                try {
                    await fetch('http://localhost:5001/api/interview/finish', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify(summaryPayload)
                    });
                    console.log("✅ Summary stored in Database successfully");
                } catch (err) {
                    console.error("❌ Failed to store summary:", err);
                }
            };
            saveSummaryToDB();
        }
    }, [loading, allResults, activeInterviewId, isArabic]);

    // دالة التعامل مع إرسال البريد الإلكتروني
    const handleEmailSubmit = async (e) => {
        e.preventDefault();
        setIsSending(true);
        try {
            const response = await fetch('http://localhost:5001/api/interview/send-report', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email: email, interviewId: activeInterviewId }),
            });
            if (response.ok) { 
                setIsSentSuccess(true); 
            } else { 
                alert(isArabic ? "فشل إرسال التقرير." : "Failed to send report."); 
            }
        } catch (error) {
            alert(isArabic ? "حدث خطأ في الاتصال بالسيرفر." : "Error connecting to the server.");
        } finally { 
            setIsSending(false); 
        }
    };

    if (loading) return <div style={{ textAlign: 'center', padding: '50px', color: darkGreen }}>Loading Assessment...</div>;
    if (allResults.length === 0) return <div style={{ textAlign: 'center', padding: '50px', color: 'red' }}>No Results Found.</div>;

    // حسابات العرض في الـ UI
    const scores = calculateInterviewAverages(allResults);
    const isFormalOverall = parseFloat(scores.attireScore) >= 50;
    const formalityStatus = isArabic ? (isFormalOverall ? "رسمي" : "غير رسمي") : (isFormalOverall ? "FORMAL" : "CASUAL");

    let overviewText = "";
    if (scores.overall >= 80) overviewText = isArabic ? "أداء ممتاز! لقد أظهرت كفاءة عالية في المعرفة والتواصل." : "Excellent performance! You demonstrated high proficiency in knowledge and communication.";
    else if (scores.overall >= 60) overviewText = isArabic ? "أداء جيد، ولكن هناك مساحة للتحسين في بعض المهارات." : "Good performance, but there is room for improvement in some areas.";
    else overviewText = isArabic ? "الأداء دون التوقعات. تحتاج إلى تدريب مكثف على المعرفة التقنية ومهارات التواصل." : "Performance was below expectations. Significant improvements are needed.";

    const icons = {
        nonVerbal: <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>,
        verbal: <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z"></path><path d="M19 10v2a7 7 0 0 1-14 0v-2"></path><line x1="12" y1="19" x2="12" y2="23"></line></svg>,
        knowledge: <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path></svg>,
        formality: <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="7" width="20" height="14" rx="2" ry="2"></rect><path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"></path></svg>
    };

    return (
        <div style={{ borderRadius: '12px', padding: '20px 0', textAlign: isArabic ? 'right' : 'left', maxWidth: '1000px', margin: '0 auto' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '25px', flexDirection: isArabic ? 'row-reverse' : 'row' }}>
                <h2 style={{ color: darkGreen, margin: 0, fontSize: '1.6rem', fontWeight: '800' }}>
                    {isArabic ? "أعمدة التقييم الشامل" : "Overall Assessment Pillars"}
                </h2>
                
                <div style={{ display: 'flex', alignItems: 'center', gap: '15px', flexDirection: isArabic ? 'row-reverse' : 'row' }}>
                    {/* زرار إرسال الإيميل الجديد داخل صفحة الأرقام الكلية */}
                    <button onClick={() => setIsModalOpen(true)} style={{ backgroundColor: '#2F5D54', color: '#ffffff', border: 'none', padding: '10px 20px', borderRadius: '50px', fontWeight: 'bold', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px' }}>
                        📧 {isArabic ? "إرسال التقرير الشامل" : "Send Full Report"}
                    </button>
                    
                    <div style={{ background: primaryColor, color: '#fff', padding: '8px 20px', borderRadius: '50px', fontWeight: 'bold', fontSize: '1.1rem' }}>
                        {isArabic ? "الدرجة الكلية: " : "Total Score: "} {scores.overall}%
                    </div>
                </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column' }}>
                <PillarCard icon={icons.nonVerbal} title={isArabic ? "التواصل غير اللفظي" : "Non-Verbal Communication"} subtitle={isArabic ? "لغة الجسد، التواصل البصري" : "Body Language, Eye Contact"} score={scores.nonVerbal} colorHex={primaryColor} isArabic={isArabic} />
                <PillarCard icon={icons.verbal} title={isArabic ? "التواصل اللفظي" : "Verbal Communication"} subtitle={isArabic ? "وضوح الصوت، النبرة" : "Speech Clarity, Tone"} score={scores.verbal} colorHex={primaryColor} isArabic={isArabic} />
                <PillarCard icon={icons.knowledge} title={isArabic ? "المعرفة والمحتوى" : "Knowledge & Content"} subtitle={isArabic ? "الدقة التقنية، هيكلة الإجابة" : "Technical Accuracy, Structure"} score={scores.knowledge} colorHex={primaryColor} isArabic={isArabic} />
                <PillarCard icon={icons.formality} title={isArabic ? "المظهر العام" : "Formality Detection"} subtitle={isArabic ? "الملابس والسياق العام" : "Attire, Background"} isStatus={true} statusText={formalityStatus} colorHex={primaryColor} isArabic={isArabic} />
            </div>

            <h3 style={{ color: darkGreen, marginTop: '35px', marginBottom: '15px', fontWeight: 'bold' }}>{isArabic ? "نظرة عامة:" : "Overall Overview:"}</h3>
            <div style={{ 
                background: '#ffffff', padding: '20px', borderRadius: '12px', border: '1px solid #dbece8',
                borderRight: isArabic ? `5px solid ${primaryColor}` : '1px solid #dbece8',
                borderLeft: isArabic ? '1px solid #dbece8' : `5px solid ${primaryColor}`,
                color: darkGreen, boxShadow: '0 4px 15px rgba(47, 93, 84, 0.05)'
            }}>
                {overviewText}
            </div>

            {/* الـ Modal المنبثق لإدخال البريد الإلكتروني وإظهار حالة الإرسال */}
            {isModalOpen && (
                <div style={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 9999 }}>
                    <div style={{ backgroundColor: '#ffffff', padding: '35px', borderRadius: '16px', width: '90%', maxWidth: '450px', boxShadow: '0 10px 25px rgba(0,0,0,0.1)', textAlign: isArabic ? 'right' : 'left', position: 'relative' }}>
                        <button onClick={() => { setIsModalOpen(false); setIsSentSuccess(false); }} style={{ position: 'absolute', top: '15px', right: isArabic ? 'auto' : '15px', left: isArabic ? '15px' : 'auto', background: 'none', border: 'none', fontSize: '1.2rem', cursor: 'pointer', color: '#666' }}>✕</button>
                        {!isSentSuccess ? (
                            <form onSubmit={handleEmailSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                                <h3 style={{ color: '#2f5d54', margin: '0 0 10px 0' }}>{isArabic ? "أدخل بريدك الإلكتروني" : "Enter Your Email"}</h3>
                                <input type="email" required placeholder="example@gmail.com" value={email} onChange={(e) => setEmail(e.target.value)} style={{ width: '100%', padding: '12px 15px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '1rem', boxSizing: 'border-box', color: '#000', textAlign: 'left', direction: 'ltr' }} />
                                <button type="submit" disabled={isSending} style={{ backgroundColor: '#58a492', color: '#ffffff', border: 'none', padding: '12px 24px', borderRadius: '8px', fontWeight: 'bold', cursor: isSending ? 'not-allowed' : 'pointer' }}>
                                    {isSending ? (isArabic ? "جاري الإرسال..." : "Sending...") : (isArabic ? "تأكيد وإرسال" : "Confirm & Send")}
                                </button>
                            </form>
                        ) : (
                            <div style={{ padding: '20px 0', textAlign: 'center' }}>
                                <div style={{ color: '#58a492', fontSize: '3rem', marginBottom: '10px' }}>✓</div>
                                <h3 style={{ color: '#2f5d54', margin: '0 0 15px 0' }}>{isArabic ? "تم إرسال الإيميل بنجاح!" : "Email Sent Successfully!"}</h3>
                                <button onClick={() => { setIsModalOpen(false); setIsSentSuccess(false); }} style={{ backgroundColor: '#2f5d54', color: '#fff', padding: '10px 25px', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold' }}>{isArabic ? "إغلاق" : "Close"}</button>
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};

export default OverallFeedback;