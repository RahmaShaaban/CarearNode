import React from 'react';
import { Link } from 'react-router-dom';
import './Home.css';


import interviewIcon from '../photos/interview_image.png';
import cvIcon from '../photos/cv_image.png';
import roadmapIcon from '../photos/roadmap_image.png';
import departmentIcon from '../photos/department_image.png';

const Home = () => {
    return (
        <div className="home-container">

            
            <div className="hero-section">
                <h1 className="main-title">
                    Master Your Tech Career
                </h1>
                <p className="subtitle">
                    The all-in-one AI platform for computer science students. Practice interviews,
                    build resumes, and find your path.
                </p>
            </div>

            <div className="cards-wrapper">

                
                <Link to="/interview" className="feature-card">
                    <div className="icon-container">
                        <img src={interviewIcon} alt="Interview" />
                    </div>
                    <h3>Interview Coach</h3>
                </Link>

              
                <Link to="/department" className="feature-card">
                    <div className="icon-container">
                        <img src={departmentIcon} alt="Department" />
                    </div>
                    <h3>Department Selector</h3>
                </Link>

                
                <Link to="/Roadmaps" className="feature-card">
                    <div className="icon-container">
                        <img src={roadmapIcon} alt="Roadmaps" />
                    </div>
                    <h3>Roadmaps</h3>
                </Link>

               
                <Link to="/cv" className="feature-card active-card">
                    <div className="icon-container">
                        <img src={cvIcon} alt="CV Builder" />
                    </div>
                    <h3>CV Builder</h3>
                </Link>

            </div>
        </div>
    );
};

export default Home;