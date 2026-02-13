import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './CvBuilder.css';

const CvBuilder = () => {
    const navigate = useNavigate();
    const [step, setStep] = useState(1);
    const [loading, setLoading] = useState(false);
    const [generatedId, setGeneratedId] = useState(null); 
    const [availableTemplates, setAvailableTemplates] = useState([]); // لتخزين القوالب من الداتابيز

    // الحالة الأساسية للبيانات
    const [formData, setFormData] = useState({
        personalInfo: { fullName: '', email: '', phone: '', address: '', linkedin: '', website: '' },
        summary: '',
        experience: [{ title: '', company: '', startDate: '', endDate: '', role: '' }],
        education: [{ degree: '', school: '', year: '' }],
        skills: '', 
        templateId: 'ats-002', // القيمة الافتراضية
        templateSettings: { color: '#003366', font: 'Arial' }
    });

    // جلب القوالب من الباك إند بمجرد تحميل الصفحة
    useEffect(() => {
        const fetchTemplates = async () => {
            try {
                const response = await fetch('http://localhost:5000/api/cv-builder/templates');
                const data = await response.json();
                if (data.success) {
                    setAvailableTemplates(data.data);
                }
            } catch (error) {
                console.error("Error fetching templates:", error);
            }
        };
        fetchTemplates();
    }, []);

    // --- دوال التعامل مع الإدخال ---
    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handlePersonalChange = (e) => {
        setFormData({
            ...formData,
            personalInfo: { ...formData.personalInfo, [e.target.name]: e.target.value }
        });
    };

    const handleArrayChange = (index, field, value, section) => {
        const updatedList = [...formData[section]];
        updatedList[index][field] = value;
        setFormData({ ...formData, [section]: updatedList });
    };

    const addItem = (section, item) => {
        setFormData({ ...formData, [section]: [...formData[section], item] });
    };

    const removeItem = (index, section) => {
        const updatedList = [...formData[section]];
        updatedList.splice(index, 1);
        setFormData({ ...formData, [section]: updatedList });
    };

    // --- إرسال البيانات للباك اند ---
    const handleSubmit = async () => {
        setLoading(true);
        const userId = localStorage.getItem('userId');
        const skillsArray = formData.skills.split(',').map(s => s.trim()).filter(s => s);

        const payload = {
            userId: userId,
            personalInfo: formData.personalInfo,
            summary: formData.summary,
            experience: formData.experience,
            education: formData.education,
            skills: skillsArray,
            templateId: formData.templateId,
            templateSettings: formData.templateSettings
        };

        try {
            const response = await fetch('http://localhost:5000/api/cv-builder/save', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });

            const data = await response.json();

            if (data.success) {
                setGeneratedId(data.data.id);
                setStep(5); 
            } else {
                alert('Error saving CV: ' + (data.message || data.data || data.error));
            }
        } catch (error) {
            console.error(error);
            alert('Connection Error');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="cv-builder-container">
            <div className="builder-header">
                <h2>AI CV Builder</h2>
                <div className="progress-steps">
                    <span className={step >= 1 ? 'active' : ''}>1. Personal</span>
                    <span className={step >= 2 ? 'active' : ''}>2. Experience</span>
                    <span className={step >= 3 ? 'active' : ''}>3. Education & Skills</span>
                    <span className={step >= 4 ? 'active' : ''}>4. Summary</span>
                    <span className={step >= 5 ? 'active' : ''}>5. Finish</span>
                </div>
            </div>

            <div className="builder-content">
                {/* Step 1: Personal Info */}
                {step === 1 && (
                    <div className="form-step fade-in">
                        <h3>Personal Information</h3>
                        <div className="form-grid">
                            <input type="text" name="fullName" placeholder="Full Name" value={formData.personalInfo.fullName} onChange={handlePersonalChange} />
                            <input type="email" name="email" placeholder="Email" value={formData.personalInfo.email} onChange={handlePersonalChange} />
                            <input type="text" name="phone" placeholder="Phone Number" value={formData.personalInfo.phone} onChange={handlePersonalChange} />
                            <input type="text" name="address" placeholder="Address" value={formData.personalInfo.address} onChange={handlePersonalChange} />
                            <input type="text" name="linkedin" placeholder="LinkedIn URL" value={formData.personalInfo.linkedin} onChange={handlePersonalChange} />
                            <input type="text" name="website" placeholder="Portfolio" value={formData.personalInfo.website} onChange={handlePersonalChange} />
                        </div>
                        <div className="btn-group">
                            <button className="btn-next" onClick={() => setStep(2)}>Next <i className="fa-solid fa-arrow-right"></i></button>
                        </div>
                    </div>
                )}

                {/* Step 2: Experience */}
                {step === 2 && (
                    <div className="form-step fade-in">
                        <h3>Experience</h3>
                        {formData.experience.map((exp, index) => (
                            <div key={index} className="array-item">
                                <div className="item-header">
                                    <h4>Job #{index + 1}</h4>
                                    {index > 0 && <button className="btn-remove" onClick={() => removeItem(index, 'experience')}><i className="fa-solid fa-trash"></i></button>}
                                </div>
                                <div className="form-grid">
                                    <input type="text" placeholder="Job Title" value={exp.title} onChange={(e) => handleArrayChange(index, 'title', e.target.value, 'experience')} />
                                    <input type="text" placeholder="Company" value={exp.company} onChange={(e) => handleArrayChange(index, 'company', e.target.value, 'experience')} />
                                    <input type="text" placeholder="Start Date" value={exp.startDate} onChange={(e) => handleArrayChange(index, 'startDate', e.target.value, 'experience')} />
                                    <input type="text" placeholder="End Date" value={exp.endDate} onChange={(e) => handleArrayChange(index, 'endDate', e.target.value, 'experience')} />
                                </div>
                                <textarea placeholder="Describe your role..." value={exp.role} onChange={(e) => handleArrayChange(index, 'role', e.target.value, 'experience')} rows="4"></textarea>
                            </div>
                        ))}
                        <button className="btn-add" onClick={() => addItem('experience', { title: '', company: '', startDate: '', endDate: '', role: '' })}>+ Add Another Job</button>
                        <div className="btn-group">
                            <button className="btn-back" onClick={() => setStep(1)}>Back</button>
                            <button className="btn-next" onClick={() => setStep(3)}>Next</button>
                        </div>
                    </div>
                )}

                {/* Step 3: Education & Skills */}
                {step === 3 && (
                    <div className="form-step fade-in">
                        <h3>Education</h3>
                        {formData.education.map((edu, index) => (
                            <div key={index} className="array-item">
                                <div className="item-header">
                                    <h4>Education #{index + 1}</h4>
                                    {index > 0 && <button className="btn-remove" onClick={() => removeItem(index, 'education')}><i className="fa-solid fa-trash"></i></button>}
                                </div>
                                <div className="form-grid">
                                    <input type="text" placeholder="Degree" value={edu.degree} onChange={(e) => handleArrayChange(index, 'degree', e.target.value, 'education')} />
                                    <input type="text" placeholder="University" value={edu.school} onChange={(e) => handleArrayChange(index, 'school', e.target.value, 'education')} />
                                    <input type="text" placeholder="Year" value={edu.year} onChange={(e) => handleArrayChange(index, 'year', e.target.value, 'education')} />
                                </div>
                            </div>
                        ))}
                        <button className="btn-add" onClick={() => addItem('education', { degree: '', school: '', year: '' })}>+ Add Education</button>
                        <hr className="divider" />
                        <h3>Skills</h3>
                        <textarea name="skills" value={formData.skills} onChange={handleChange} placeholder="React, Node.js..." rows="3"></textarea>
                        <div className="btn-group">
                            <button className="btn-back" onClick={() => setStep(2)}>Back</button>
                            <button className="btn-next" onClick={() => setStep(4)}>Next</button>
                        </div>
                    </div>
                )}

                {/* Step 4: Summary & Template Selection */}
                {step === 4 && (
                    <div className="form-step fade-in">
                        <h3>Professional Summary</h3>
                        <textarea name="summary" value={formData.summary} onChange={handleChange} placeholder="Summary..." rows="5"></textarea>
                        
                        <div className="template-selector">
                            <h4>Select Template</h4>
                            <div className="templates-grid">
                                {availableTemplates.map((temp) => (
                                    <div 
                                        key={temp.id}
                                        className={`template-card ${formData.templateId === temp.id ? 'selected' : ''}`}
                                        onClick={() => setFormData({...formData, templateId: temp.id})}
                                    >
                                        {temp.preview_image ? (
                                            <img src={temp.preview_image} alt={temp.name} className="template-preview-img" />
                                        ) : (
                                            <i className="fa-solid fa-file-lines"></i>
                                        )}
                                        <span>{temp.name}</span>
                                        {formData.templateId === temp.id && <i className="fa-solid fa-check-circle select-badge"></i>}
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div className="btn-group">
                            <button className="btn-back" onClick={() => setStep(3)}>Back</button>
                            {loading ? (
                                <button className="btn-submit" disabled><i className="fa-solid fa-spinner fa-spin"></i> AI Processing...</button>
                            ) : (
                                <button className="btn-submit" onClick={handleSubmit}>Generate CV <i className="fa-solid fa-wand-magic-sparkles"></i></button>
                            )}
                        </div>
                    </div>
                )}

                {/* Step 5: Success */}
                {step === 5 && (
                    <div className="form-step success-step fade-in">
                        <div className="success-icon"><i className="fa-solid fa-circle-check"></i></div>
                        <h3>CV Generated Successfully!</h3>
                        <div className="action-buttons-final">
                            <a href={`http://localhost:5000/api/cv-builder/download/${generatedId}`} className="btn-download" target="_blank" rel="noopener noreferrer">
                                <i className="fa-solid fa-download"></i> Download PDF
                            </a>
                            <a href={`http://localhost:5000/api/cv-builder/preview/${generatedId}`} className="btn-preview" target="_blank" rel="noopener noreferrer">
                                <i className="fa-solid fa-eye"></i> Live Preview
                            </a>
                        </div>
                        <button className="btn-home" onClick={() => navigate('/')}>Back to Home</button>
                    </div>
                )}
            </div>
        </div>
    );
};

export default CvBuilder;