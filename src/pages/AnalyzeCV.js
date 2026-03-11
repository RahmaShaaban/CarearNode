import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import './AnalyzeCV.css';

const AnalyzeCV = () => {
    const navigate = useNavigate();
    const fileInputRef = useRef(null);

    const [file, setFile] = useState(null);
    const [analysisResult, setAnalysisResult] = useState(null); // ?????? ??????? ?? ????? ???
    const [isLoading, setIsLoading] = useState(false); // ???? ???????

    // --- ???? ?????? ????? ????? ????????? (????? ??? ???? ?? 5) ---
    // ???? ?????? ????? ????? (????? ??? ???? ?? 10)
    const getScoreDetails = (score) => {
        if (score >= 8) return { color: "#16a34a", label: "Excellent", icon: "fa-trophy" }; // 8 ?? 10 ?????
        if (score >= 6) return { color: "#2D4A43", label: "Good", icon: "fa-thumbs-up" };    // 6 ?? 10 ???
        return { color: "#2D4A43", label: "Needs Improvement", icon: "fa-circle-exclamation" };
    };

    const handleBack = () => {
        navigate('/cv');
    };

    const handleFileChange = (e) => {
        const selectedFile = e.target.files[0];
        if (selectedFile) {
            setFile(selectedFile);
            setAnalysisResult(null); // ????? ??????? ??????? ??? ?????? ??? ????
        }
    };

    const handleUploadClick = () => {
        fileInputRef.current.click();
    };

    const handleAnalyze = async () => {
        if (!file) {
            alert("Please upload a CV first!");
            return;
        }

        const userId = localStorage.getItem('userId');
        if (!userId) {
            alert("Please login first!");
            navigate('/Sign_In');
            return;
        }

        setIsLoading(true);

        try {
            // 1. ????? ???????? (FormData)
            const formData = new FormData();
            formData.append('cvFile', file); // ??? ????? ??????? ?? ????? ???
            formData.append('userId', userId);

            // 2. ????? ????? ????? ???
            const response = await fetch('http://localhost:5001/api/cv/upload', {
                method: 'POST',
                body: formData,
            });

            const data = await response.json();

            if (response.ok) {
                // 3. ????? ???????
                setAnalysisResult(data.data.analysis_result);
            } else {
                alert(data.message || "Something went wrong!");
            }

        } catch (error) {
            console.error("Error:", error);
            alert("Failed to connect to server.");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="analyze-page-container">
            <div className="analyze-content-wrapper">

                <button className="btn-back-link" onClick={handleBack}>
                    <i className="fa-solid fa-arrow-left"></i> Back
                </button>

                <div className="analyze-card">
                    <h2 className="analyze-title">Analyze CV</h2>

                    

                    {/* ????? ????? */}
                    <div className="upload-area" onClick={handleUploadClick}>
                        <input
                            type="file"
                            ref={fileInputRef}
                            onChange={handleFileChange}
                            style={{ display: 'none' }}
                            accept=".pdf,.doc,.docx"
                        />

                        {file ? (
                            <div className="file-selected">
                                <i className="fa-solid fa-file-circle-check success-icon"></i>
                                <p className="file-name-text">{file.name}</p>
                                <span className="change-text">Click to change</span>
                            </div>
                        ) : (
                            <div className="upload-placeholder">
                                <i className="fa-solid fa-cloud-arrow-up upload-icon"></i>
                                <p className="upload-instruction">Click to upload PDF</p>
                            </div>
                        )}
                    </div>

                    {/* ?? ??????? */}
                    <button
                        className="btn-analyze-action"
                        onClick={handleAnalyze}
                        disabled={isLoading}
                    >
                        {isLoading ? (
                            <span><i className="fa-solid fa-spinner fa-spin"></i> Analyzing...</span>
                        ) : (
                            "Analyze"
                        )}
                    </button>
                </div>

                {/* 4. ??? ??????? */}
                {analysisResult && (
                    <div className="results-container">

                        {/* ??? ?????? ??????? ?????? */}
                        {(() => {
                            // 1. ??????? ????? (?? ??? 4.2 ????? ?? 2 ???? ???? ?? 10? ?? ?? ????? ??? ????? ?? 10 ??????? ?????)
                            // ??????: ?? ????? ??? ??? ????? ?? 5? ????? ????? ?? 2 ???:
                            let rawScore = (parseFloat(analysisResult.overall_score) || 0) * 2;

                            // ?????? ??? ?? ????? 10
                            const finalScore = rawScore > 10 ? 10 : rawScore;

                            const { color, label, icon } = getScoreDetails(finalScore);

                            return (
                                <div className="score-section">
                                    <h3>CV Overall Score</h3>

                                    <div
                                        className="score-circle-container"
                                        style={{
                                            // 2. ???????? ???????: ???? ?? 36 (??? 360 / 10 = 36)
                                            background: `conic-gradient(${color} ${finalScore * 36}deg, #e2e8f0 0deg)`
                                        }}
                                    >
                                        <div className="score-circle-inner">
                                            <span className="score-number" style={{ color: color }}>
                                                {Number.isInteger(finalScore) ? finalScore : finalScore.toFixed(1)}
                                                {/* 3. ????? ???? ????? ?? 10 */}
                                                <span style={{ fontSize: '1.5rem', color: '#64748b', marginLeft: '5px' }}>/10</span>
                                            </span>
                                            <span className="score-label" style={{ color: color }}>
                                                {label}
                                            </span>
                                        </div>
                                    </div>

                                    {/* ... ???? ????? ... */}

                                    {/* ????? ??????? ??? ?????? */}
                                    <div className="score-message">
                                        <i className={`fa-solid ${icon}`} style={{ color: color }}></i>
                                        <p>Your CV is <strong>{label}</strong> based on AI analysis.</p>
                                    </div>
                                </div>
                            );
                        })()}

                        {/* ???? ??????? ????? */}
                        <div className="analysis-grid">
                            {/* ???? ????? */}
                            <div className="analysis-box strengths">
                                <h4><i className="fa-solid fa-check-circle"></i> Strengths</h4>
                                <ul>
                                    {analysisResult.strengths?.map((item, index) => (
                                        <li key={index}>{item}</li>
                                    ))}
                                </ul>
                            </div>

                            {/* ???????? ??????? */}
                            <div className="analysis-box missing">
                                <h4><i className="fa-solid fa-triangle-exclamation"></i> Missing Skills</h4>
                                <ul>
                                    {analysisResult.missing_skills?.map((item, index) => (
                                        <li key={index}>{item}</li>
                                    ))}
                                </ul>
                            </div>

                            {/* ???????? */}
                            <div className="analysis-box recommendations">
                                <h4><i className="fa-solid fa-lightbulb"></i> Recommendations</h4>
                                <ul>
                                    {analysisResult.recommendations?.map((item, index) => (
                                        <li key={index}>{item}</li>
                                    ))}
                                </ul>
                            </div>
                        </div>
                    </div>
                )}

            </div>
        </div>
    );
};

export default AnalyzeCV;