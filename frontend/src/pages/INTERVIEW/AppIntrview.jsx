import React, { useState, useEffect } from 'react';
import SetupInterview from './components/SetupInterview';
import RecordingStep from './components/RecordingStep';
import FeedbackDashboard from './components/FeedbackDashboard';
import axios from 'axios';
import './AppIntrview.css';

// ✨ [Smart Loader - Keeping the original style, English only]
const AnalyzingLoader = ({ onStartWaiting, onSendToEmail, currentProgress, totalQuestions, onBackToSetup }) => {
    const primaryColor = '#58A492'; 
    const darkGreen = '#2F5D54';    

    const [viewState, setViewState] = useState('choice'); 
    const [email, setEmail] = useState('');
    const [isSubmitted, setIsSubmitted] = useState(false);
    const [isSendingEmailReq, setIsSendingEmailReq] = useState(false);

    const handleStartWaiting = () => {
        setViewState('wait');
        onStartWaiting(); 
    };

    const handleSubmitEmail = async () => {
        if (!email.includes('@')) {
            alert("Please enter a valid email");
            return;
        }
        setIsSendingEmailReq(true);
        await onSendToEmail(email); 
        setIsSendingEmailReq(false);
        setIsSubmitted(true);
    };

    return (
        <div style={{ minHeight: '80vh', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', fontFamily: 'system-ui, -apple-system, sans-serif', padding: '20px', direction: 'ltr' }}>
            {viewState === 'choice' && (
                <div style={{ backgroundColor: '#ffffff', padding: '40px', borderRadius: '16px', border: `1px solid #dbece8`, boxShadow: '0 4px 20px rgba(47, 93, 84, 0.08)', width: '100%', maxWidth: '500px', textAlign: 'center' }}>
                     <h2 style={{ color: darkGreen, margin: '0 0 15px 0', fontSize: '1.6rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px' }}>
                        <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke={primaryColor} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
                            <polyline points="22 4 12 14.01 9 11.01"></polyline>
                        </svg>
                        Answers recorded successfully!
                    </h2>
                    <p style={{ color: '#475569', marginBottom: '30px', fontSize: '1.1rem' }}>How would you like to receive your analysis results?</p>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                        <button onClick={handleStartWaiting} style={{ backgroundColor: primaryColor, color: '#ffffff', border: 'none', padding: '14px 24px', borderRadius: '8px', fontWeight: 'bold', fontSize: '1.1rem', cursor: 'pointer', transition: 'all 0.2s ease', boxShadow: '0 4px 10px rgba(88, 164, 146, 0.3)' }}>
                            <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
                                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 15 15"></polyline></svg>
                                Wait for Analysis Now
                            </span>
                        </button>
                        <button onClick={() => setViewState('email')} style={{ backgroundColor: '#ffffff', color: darkGreen, border: `2px solid ${darkGreen}`, padding: '14px 24px', borderRadius: '8px', fontWeight: 'bold', fontSize: '1.1rem', cursor: 'pointer', transition: 'all 0.2s ease' }}>
                           <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
                                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path><polyline points="22,6 12,13 2,6"></polyline></svg>
                                Send report to email
                            </span>
                        </button>
                    </div>
                </div>
            )}
            {viewState === 'wait' && (
                <>
                    <div style={{ width: '60px', height: '60px', border: `6px solid #dbece8`, borderTop: `6px solid ${primaryColor}`, borderRadius: '50%', animation: 'spin 1s linear infinite', marginBottom: '20px' }}></div>
                    <style>{`@keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }`}</style>
                    <h2 style={{ color: darkGreen, fontSize: '1.8rem', marginBottom: '10px', textAlign: 'center' }}>Analyzing your performance...</h2>
                    <p style={{ color: primaryColor, fontSize: '1.2rem', fontWeight: 'bold', margin: '0 0 10px 0' }}>{`Analyzing Question ${currentProgress} of ${totalQuestions}`}</p>
                </>
            )}
            {viewState === 'email' && (
                <div style={{ backgroundColor: '#ffffff', padding: '40px 30px', borderRadius: '16px', border: `1px solid #dbece8`, boxShadow: '0 4px 20px rgba(47, 93, 84, 0.08)', width: '100%', maxWidth: '450px', textAlign: 'center' }}>
                    {isSubmitted ? (
                        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                            <svg width="60" height="60" viewBox="0 0 24 24" fill="none" stroke={primaryColor} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ marginBottom: '15px' }}><circle cx="12" cy="12" r="10"></circle><path d="M8 12.5l3 3 5-6"></path></svg>
                            <h3 style={{ color: darkGreen, margin: '0 0 10px 0', fontSize: '1.5rem' }}>Request received!</h3>
                            <p style={{ color: '#475569', fontSize: '1.05rem', lineHeight: '1.5', margin: '0 0 25px 0' }}>
                                Your detailed report will arrive in your inbox in a few minutes. <br/>
                               
                            </p>
                            <button onClick={onBackToSetup} style={{ backgroundColor: primaryColor, color: '#ffffff', border: 'none', padding: '12px 24px', borderRadius: '8px', fontWeight: 'bold', fontSize: '1rem', cursor: 'pointer', width: '100%' }}>Setup New Interview</button>
                        </div>
                    ) : (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                            <h4 style={{ color: darkGreen, margin: '0 0 5px 0', textAlign: 'left' }}>Enter your email:</h4>
                            <input type="email" placeholder="example@gmail.com" value={email} onChange={(e) => setEmail(e.target.value)} style={{ width: '100%', padding: '14px 15px', borderRadius: '8px', border: '1px solid #cbd5e1', direction: 'ltr' }} />
                            <button onClick={handleSubmitEmail} disabled={isSendingEmailReq} style={{ backgroundColor: primaryColor, color: '#ffffff', border: 'none', padding: '14px 24px', borderRadius: '8px', fontWeight: 'bold', cursor: isSendingEmailReq ? 'wait' : 'pointer', opacity: isSendingEmailReq ? 0.7 : 1 }}>{isSendingEmailReq ? "⏳..." : "Confirm"}</button>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

function App() {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({ track: 'Computer Science', level: 'Junior', language: 'en', numQuestions: 1 });
  const [questions, setQuestions] = useState([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [interviewId, setInterviewId] = useState(null); 
  const [recordedAnswers, setRecordedAnswers] = useState([]); 
  const [allResults, setAllResults] = useState([]);
  const [showLoaderOptions, setShowLoaderOptions] = useState(false);
  const [analyzingProgress, setAnalyzingProgress] = useState(0);

  useEffect(() => {
      document.documentElement.style.backgroundColor = '#F0F7F5';
      document.body.style.backgroundColor = '#F0F7F5';
      document.body.style.margin = '0';
      return () => {
          document.documentElement.style.backgroundColor = '';
          document.body.style.backgroundColor = '';
      };
  }, []);

  const startSequentialAnalysis = async () => {
      const resultsArray = [];
      let totalScoreSum = 0;

      for (let i = 0; i < recordedAnswers.length; i++) {
          setAnalyzingProgress(i + 1);
          const answer = recordedAnswers[i];
          
          const pythonFormData = new FormData();
          pythonFormData.append('file', answer.file); 
          pythonFormData.append('question', answer.question);
          pythonFormData.append('language', formData.language);

          try {
              console.log(`📡 Analyzing Q${i+1}...`);
              const aiResponse = await axios.post('http://localhost:5000/analyze/all', pythonFormData);
              const analysisData = aiResponse.data;

              await axios.post('http://localhost:5001/api/interview/save-result', {
                  interviewId: interviewId,
                  questionText: answer.question,
                  analysisResults: analysisData
              });
              
              const currentScore = analysisData.content?.score || 0;
              totalScoreSum += currentScore;

              resultsArray.push({
                  questionText: answer.question,
                  ...analysisData 
              });

          } catch (err) {
              console.error(`❌ Error Q${i+1}:`, err);
              resultsArray.push({ questionText: answer.question, error: true });
          }
      }

      const finalOverallScore = recordedAnswers.length > 0 ? Math.round(totalScoreSum / recordedAnswers.length) : 0;
      try {
          await axios.post('http://localhost:5001/api/interview/finish', {
              interviewId: interviewId,
              overallScore: finalOverallScore,
              overallFeedback: "Interview analysis completed successfully"
          });
      } catch (fErr) {
          console.error("Error finalizing interview:", fErr);
      }

      setAllResults(resultsArray);
      setShowLoaderOptions(false); 
  };

  // 🚀 الدالة الجديدة اللي هتبعت المهمة للباك إند في الخلفية
  const startBackgroundAnalysis = async (userEmail) => {
      const formDataToSend = new FormData();
      
      // 1. إضافة البيانات الأساسية
      formDataToSend.append('interviewId', interviewId);
      formDataToSend.append('language', formData.language);
      formDataToSend.append('email', userEmail);
      
      // 2. إضافة كل الفيديوهات والأسئلة مرة واحدة
      recordedAnswers.forEach((answer, index) => {
          formDataToSend.append('files', answer.file);
          formDataToSend.append(`questions[${index}]`, answer.question);
      });

 

      try {
          // نكلم Node.js ونقوله: "ابدأ التحليل في الخلفية"
          await axios.post('http://localhost:5001/api/interview/analyze-background', formDataToSend, {
              headers: { 'Content-Type': 'multipart/form-data' }
          });
          console.log("Background analysis started successfully!");
      } catch (err) {
          console.error("Failed to start background analysis:", err);
      }
  };

  const handleNextQuestion = (videoFile) => {
      setRecordedAnswers(prev => [...prev, { question: questions[currentQuestionIndex], file: videoFile }]);
      setCurrentQuestionIndex(prev => prev + 1);
  };

  const handleFinishRecording = (lastVideoFile) => {
      const finalAnswers = [...recordedAnswers, { question: questions[currentQuestionIndex], file: lastVideoFile }];
      setRecordedAnswers(finalAnswers);
      setShowLoaderOptions(true);
      setStep(3); 
  };

  const handleStartNew = () => {
      setStep(1); setQuestions([]); setRecordedAnswers([]); setAllResults([]);
      setCurrentQuestionIndex(0); setShowLoaderOptions(false); setAnalyzingProgress(0); setInterviewId(null);
  };

  return (
    <div className="app-interview-container" style={{ minHeight: '100vh', backgroundColor: '#F0F7F5' }}>
      {step === 1 && (
        <SetupInterview 
            formData={formData} setFormData={setFormData} setQuestions={setQuestions} 
            setStep={setStep} setInterviewId={setInterviewId} 
        />
      )}
      {step === 2 && (
        <RecordingStep 
            key={currentQuestionIndex} questions={questions} currentQuestionIndex={currentQuestionIndex} 
            onNext={handleNextQuestion} onFinish={handleFinishRecording} onBack={() => setStep(1)}
        />
      )}
      {step === 3 && (
          showLoaderOptions ? (
              <AnalyzingLoader 
                  onStartWaiting={startSequentialAnalysis} 
                  onSendToEmail={startBackgroundAnalysis} 
                  currentProgress={analyzingProgress}
                  totalQuestions={questions.length} 
                  onBackToSetup={handleStartNew} 
              />
          ) : (
              <FeedbackDashboard 
                  interviewId={interviewId} 
                  allResults={allResults} 
                  handleStartNew={handleStartNew}
              />
          )
      )}
    </div>
  );
}

export default App;