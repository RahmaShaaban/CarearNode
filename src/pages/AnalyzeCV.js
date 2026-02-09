import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import './AnalyzeCV.css';

const AnalyzeCV = () => {
    const navigate = useNavigate();
    const fileInputRef = useRef(null);

    const [file, setFile] = useState(null);
    const [text, setText] = useState("");

    // ???? ?????? ?????? ???????
    const handleBack = () => {
        navigate('/cv');
    };

    // ???? ?????? ?????
    const handleFileChange = (e) => {
        const selectedFile = e.target.files[0];
        if (selectedFile) {
            setFile(selectedFile);
        }
    };

    // ???? ????? ??? ????? ?????
    const handleUploadClick = () => {
        fileInputRef.current.click();
    };

    // ???? ?? Analyze (??????? ???? ?? ????????)
    const handleAnalyze = () => {
        if (!file && !text) {
            alert("Please upload a CV or paste text first!");
            return;
        }
        console.log("Analyzing...", { file, text });
        // ??? ????? ??? ????? ?????? ??? ?????
    };

    return (
        <div className="analyze-page-container">
            <div className="analyze-content-wrapper">

                {/* 1. ???? ?????? */}
                <button className="btn-back-link" onClick={handleBack}>
                    <i className="fa-solid fa-arrow-left"></i> Back
                </button>

                <div className="analyze-card">
                    <h2 className="analyze-title">Analyze CV</h2>

                    {/* 2. ????? ??? ????? */}
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
                                <p>{file.name}</p>
                                <span className="change-text">Click to change</span>
                            </div>
                        ) : (
                            <div className="upload-placeholder">
                                <i className="fa-solid fa-arrow-up-from-bracket upload-icon"></i>
                                <p>Click to upload PDF or Word</p>
                            </div>
                        )}
                    </div>

                    <div className="divider">
                        <span>OR PASTE TEXT</span>
                    </div>

                    {/* 3. ????? ??????? */}
                    <textarea
                        className="cv-text-area"
                        placeholder="Paste CV text here..."
                        rows="6"
                        value={text}
                        onChange={(e) => setText(e.target.value)}
                    ></textarea>
                </div>

                {/* 4. ???? ??????? ?????? */}
                <button className="btn-analyze-action" onClick={handleAnalyze}>
                    Analyze
                </button>
            </div>
        </div>
    );
};

export default AnalyzeCV;