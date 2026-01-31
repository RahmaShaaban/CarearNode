import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Navbar from './Navbar'; 
import './App.css';
import Home from './pages/Home';
import Interview from './pages/Interview';
import Department from './pages/Department';
import Roadmaps from './pages/Roadmaps';
import CV from './pages/CV';
import Sign_In from './pages/Sign_In';
import Profile from './pages/Profile';
import Sign_up from'./pages/Sign_up';
import Footer from './Footer'; 
import RoadmapDetails from './pages/RoadmapDetails';

function App() {
    return (
        <BrowserRouter>
           
            <div className="app-container">

                <Navbar />

               
                <div className="main-content">
                    <Routes>
                        <Route path="/" element={<Home />} />
                        <Route path="/interview" element={<Interview />} />
                        <Route path="/department" element={<Department />} />
                        <Route path="/Roadmaps" element={<Roadmaps />} />
                        <Route path="/cv" element={<CV />} />
                        <Route path="/Sign_In" element={<Sign_In />} />
                        <Route path="/signup" element={<Sign_up />} />
                        <Route path="/Profile" element={<Profile />} />
                        <Route path="/roadmap/:id" element={<RoadmapDetails />} />
                    </Routes>
                </div>

                
                <Footer />

            </div>
        </BrowserRouter>
    );
}

export default App;