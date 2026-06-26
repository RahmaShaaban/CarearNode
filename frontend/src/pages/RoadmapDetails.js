import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import './RoadmapDetails.css';

const RoadmapDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  
  const [roadmap, setRoadmap] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [userId] = useState(localStorage.getItem('userId')); 
  const [isEnrolled, setIsEnrolled] = useState(false); 
  const [completedSteps, setCompletedSteps] = useState([]); 
  const [progress, setProgress] = useState(0); 

  const [quizData, setQuizData] = useState(null);
  const [showQuiz, setShowQuiz] = useState(false);
  const [currentStepId, setCurrentStepId] = useState(null);
  const [userAnswers, setUserAnswers] = useState({});
  const [quizResult, setQuizResult] = useState(null);
  const [quizLoading, setQuizLoading] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch(`http://localhost:5001/api/roadmaps/${id}`);
        const data = await response.json();

        if (data.success) {
          setRoadmap(data.data);
          const stepsList = data.data.Steps || data.data.TechSkills || [];

          if (userId) {
            const statusRes = await fetch(`http://localhost:5001/api/roadmaps/status/${id}/${userId}`);
            if (statusRes.ok) {
              const statusData = await statusRes.json();
              if (statusData.enrolled) {
                setIsEnrolled(true);
                const completed = statusData.completedSteps?.map(Number) || [];
                setCompletedSteps(completed);
                if (stepsList.length > 0) {
                    const percent = Math.round((completed.length / stepsList.length) * 100);
                    setProgress(percent);
                }
              }
            }
          }
        } else {
          setError("Roadmap not found");
        }
      } catch (err) {
        setError("Connection error");
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [id, userId]);

  const handleStartRoadmap = async () => {
    try {
      const response = await fetch('http://localhost:5001/api/roadmaps/enroll', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, roadmapId: id })
      });
      if (response.ok) {
        setIsEnrolled(true);
        setCompletedSteps([]);
        setProgress(0);
      }
    } catch (error) {
      console.error("Enrollment failed", error);
    }
  };

  const handleUnenroll = async () => {
      if (!window.confirm("Are you sure? All progress will be lost!")) return;
      try {
          const response = await fetch('http://localhost:5001/api/roadmaps/enroll', {
              method: 'DELETE',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ userId, roadmapId: id })
          });
          if (response.ok) {
              setIsEnrolled(false);
              setCompletedSteps([]);
              setProgress(0);
          }
      } catch (error) {
          console.error("Unenroll failed", error);
      }
  };

  const markStepAsComplete = async (stepId) => {
    const stepIdInt = Number(stepId);
    if (completedSteps.includes(stepIdInt)) return;

    const newCompletedSteps = [...completedSteps, stepIdInt];
    setCompletedSteps(newCompletedSteps);

    const stepsList = roadmap.Steps || roadmap.TechSkills || [];
    const percent = Math.round((newCompletedSteps.length / stepsList.length) * 100);
    setProgress(percent);

    await fetch('http://localhost:5001/api/roadmaps/progress', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, roadmapId: id, completedSteps: newCompletedSteps })
    });
  };

  const handleOpenQuiz = async (stepId) => {
    setQuizLoading(true);
    setCurrentStepId(stepId);
    try {
        const response = await fetch(`http://localhost:5001/api/roadmaps/step/${stepId}/quiz`);
        const data = await response.json();
        if (data.success) {
            setQuizData(data.quiz);
            setUserAnswers({});
            setQuizResult(null);
            setShowQuiz(true);
        }
    } catch (err) {
        alert("Failed to generate quiz.");
    } finally {
        setQuizLoading(false);
    }
  };

  const handleSubmitQuiz = () => {
    let score = 0;
    quizData.forEach((q, index) => {
        if (userAnswers[index] === q.correct_answer) score++;
    });
    const passed = score >= 3;
    setQuizResult({ score, total: quizData.length, passed });
    if (passed) markStepAsComplete(currentStepId);
  };

  if (loading) return <div className="loading-center"><i className="fa-solid fa-circle-notch fa-spin"></i> Loading...</div>;

  const stepsToRender = roadmap.Steps || roadmap.TechSkills || [];

  return (
    <div className="details-page">
      <div className="details-header">
        <Link to="/roadmaps">
            <button className="btn-back"><i className="fa-solid fa-arrow-left"></i> Back</button>
        </Link>
        <div className="header-content-wrapper">
          <div className="header-text">
            <div style={{display: 'flex', gap: '20px', alignItems: 'center'}}>
                <div className="icon-large"><i className="fa-solid fa-layer-group"></i></div>
                <div>
                    <h1>{roadmap.title}</h1>
                    <p className="DescribRoadmapTrack">{roadmap.description}</p>
                </div>
            </div>
            {isEnrolled && (
                <div className="main-progress-container">
                    <div className="progress-info">
                        <span className="status-badge">{progress === 100 ? 'Completed' : 'In Progress'}</span>
                        <span className="percentage-text">{progress}%</span>
                    </div>
                    <div className="progress-bar-bg">
                        <div className="progress-bar-fill" style={{ width: `${progress}%` }}></div>
                    </div>
                    <button className="btn-unenroll" onClick={handleUnenroll}>Unenroll</button>
                </div>
            )}
          </div>
          <div className="header-actions">
                {!userId ? <button className="btn-signin-action" onClick={() => navigate('/Sign_In')}>Sign In</button>
                : !isEnrolled ? <button className="btn-start-roadmap" onClick={handleStartRoadmap}>Start Roadmap</button>
                : <button className="btn-continue-roadmap" disabled>Tracking Active</button>}
          </div>
        </div>
      </div>

      <div className="timeline-container">
        {stepsToRender.map((skill, index) => {
          const isChecked = completedSteps.includes(Number(skill.id));
          const isFirstStep = index === 0;
          const prevStepId = index > 0 ? Number(stepsToRender[index-1].id) : null;
          const isLocked = !isFirstStep && !completedSteps.includes(prevStepId);
          const resources = skill.StepResources || skill.SkillResources || [];

          return (
            <div className={`timeline-step ${isChecked ? 'step-completed' : ''} ${isLocked ? 'step-is-locked' : ''}`} key={skill.id}>
              {isLocked && <div className="lock-label"><i className="fa-solid fa-lock"></i> Locked</div>}
              
              <div className="step-actions-row">
                <span className="step-badge">Step {index + 1}</span>
                {isEnrolled && !isLocked && (
                  <div style={{display: 'flex', gap: '15px'}}>
                    {!isChecked && (
                      <button className="btn-quiz" onClick={() => handleOpenQuiz(skill.id)} disabled={quizLoading}>
                        {quizLoading && currentStepId === skill.id ? 'AI Thinking...' : 'Take Quiz to Unlock'}
                      </button>
                    )}
                    <div className="checkbox-wrapper readonly">
                      <div className={`custom-checkbox ${isChecked ? 'checked' : ''}`}>
                        {isChecked && <i className="fa-solid fa-check"></i>}
                      </div>
                      <span className="mark-text">{isChecked ? 'Done' : 'Quiz Required'}</span>
                    </div>
                  </div>
                )}
              </div>

              <h2 className="step-title">{skill.step_name || skill.name}</h2>
              <p className="step-desc">{skill.description}</p>

              <div className="resources-section">
                <h4>Resources:</h4>
                <div className="resources-list">
                  {resources.map((res) => (
                    <a href={res.url || res.link} target="_blank" rel="noopener noreferrer" className="resource-card" key={res.id}>
                      <div className="res-info">
                        <span className="res-title">{res.resource_name || res.title}</span>
                        <i className="fa-solid fa-external-link"></i>
                      </div>
                      <span className={`res-badge ${res.resource_type === 'Paid' ? 'paid' : 'free'}`}>{res.resource_type || 'Free'}</span>
                    </a>
                  ))}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {showQuiz && quizData && (
        <div className="quiz-modal-overlay">
            <div className="quiz-modal">
                <button className="close-quiz" onClick={() => setShowQuiz(false)}>×</button>
                <div className="modal-header">
                    <h2><i className="fa-solid fa-lightbulb"></i> AI Knowledge Check</h2>
                </div>
                
                {!quizResult ? (
                    <>
                        <div className="quiz-content">
                            {quizData.map((q, qIdx) => (
                                <div key={qIdx} className="quiz-question-box">
                                    <p><strong>{qIdx + 1}.</strong> {q.question}</p>
                                    <div className="options-grid">
                                        {q.options.map((opt, optIdx) => (
                                            <button 
                                                key={optIdx} 
                                                className={`option-btn ${userAnswers[qIdx] === optIdx ? 'selected' : ''}`}
                                                onClick={() => setUserAnswers({...userAnswers, [qIdx]: optIdx})}
                                            >
                                                {opt}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            ))}
                        </div>
                        <button className="btn-submit-quiz" onClick={handleSubmitQuiz} disabled={Object.keys(userAnswers).length < quizData.length}>
                            Submit Answers
                        </button>
                    </>
                ) : (
                    <div className={`quiz-feedback ${quizResult.passed ? 'success' : 'fail'}`}>
                        <div className="result-icon">
                            {quizResult.passed ? <i className="fa-solid fa-circle-check fa-3x"></i> : <i className="fa-solid fa-circle-xmark fa-3x"></i>}
                        </div>
                        <h3>{quizResult.passed ? '🎉 Passed!' : '❌ Keep Practicing'}</h3>
                        <div className="score-display">
                            Your Score: <strong>{quizResult.score}</strong> / {quizResult.total}
                        </div>
                        <p className="result-msg">{quizResult.passed ? 'Excellent! Step unlocked.' : 'You need 3/5 to pass.'}</p>
                        <button className="btn-submit-quiz" onClick={() => setShowQuiz(false)}>
                            {quizResult.passed ? 'Continue Learning' : 'Try Again Later'}
                        </button>
                    </div>
                )}
            </div>
        </div>
      )}
    </div>
  );
};

export default RoadmapDetails;