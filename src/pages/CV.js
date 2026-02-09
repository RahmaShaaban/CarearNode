import React from 'react';
import { Link } from 'react-router-dom'; // ?? useNavigate ?? ???? ????? ??????
import './CV.css';

function CV () {
    return (
        <div className="cv-tools-container">
            <div className="cv-header">
                <h1 className="cv-main-title">Craft Your Perfect Resume</h1>
                <p className="cv-subtitle">
                    Choose a tool to get started: Build a professional CV from scratch or analyze your existing one with AI.
                </p>
            </div>

            <div className="tools-wrapper">
                {/* 1. ???? Analyze CV */}
                <Link to="/cv/analyze" className="tool-card analyze-card">
                    <div className="tool-icon">
                        <i className="fa-solid fa-cloud-arrow-up"></i>
                    </div>
                    <h2>Analyze CV</h2>
                    <p>Upload your resume and get AI-powered feedback to improve it.</p>
                </Link>

                {/* 2. ???? Build CV */}
                <Link to="/cv/build" className="tool-card build-card">
                    <div className="tool-icon">
                        <i className="fa-regular fa-file-lines"></i>
                    </div>
                    <h2>Build CV</h2>
                    <p>Create a professional resume step-by-step with our builder.</p>
                </Link>
            </div>
        </div>
    );
};

export default CV;