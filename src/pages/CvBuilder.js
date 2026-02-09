import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './CvBuilder.css';

const CvBuilder = () => {
    const navigate = useNavigate();
    const [step, setStep] = useState(1);
    const [loading, setLoading] = useState(false);
    const [generatedId, setGeneratedId] = useState(null); // لتخزين رقم الـ CV بعد الحفظ

    // الحالة الأساسية للبيانات (مطابقة لشكل الداتابيز)
    const [formData, setFormData] = useState({
        personalInfo: { fullName: '', email: '', phone: '', address: '', linkedin: '', website: '' },
        summary: '',
        experience: [{ title: '', company: '', startDate: '', endDate: '', role: '' }], // role هو الوصف اللي الـ AI هيحسنه
        education: [{ degree: '', school: '', year: '' }],
        skills: '', // هناخدها كنص ونحولها لمصفوفة
        templateId: 'ats-002', // القيمة الافتراضية
        templateSettings: { color: '#003366', font: 'Arial' }
    });

    // --- دوال التعامل مع الإدخال ---

    // 1. تحديث البيانات البسيطة (Summary)
    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    // 2. تحديث البيانات الشخصية
    const handlePersonalChange = (e) => {
        setFormData({
            ...formData,
            personalInfo: { ...formData.personalInfo, [e.target.name]: e.target.value }
        });
    };

    // 3. تحديث المصفوفات (Experience / Education)
    const handleArrayChange = (index, field, value, section) => {
        const updatedList = [...formData[section]];
        updatedList[index][field] = value;
        setFormData({ ...formData, [section]: updatedList });
    };

    // 4. إضافة عنصر جديد للمصفوفة
    const addItem = (section, item) => {
        setFormData({ ...formData, [section]: [...formData[section], item] });
    };

    // 5. حذف عنصر من المصفوفة
    const removeItem = (index, section) => {
        const updatedList = [...formData[section]];
        updatedList.splice(index, 1);
        setFormData({ ...formData, [section]: updatedList });
    };

    // --- إرسال البيانات للباك اند ---
    const handleSubmit = async () => {
        setLoading(true);
        const userId = localStorage.getItem('userId');

        // تحويل المهارات من نص إلى مصفوفة
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
                setGeneratedId(data.data.id); // حفظنا الـ ID عشان التحميل
                setStep(5); // الانتقال لخطوة التحميل
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

    // --- عرض الخطوات (Render Steps) ---
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
                {/* --- Step 1: Personal Info --- */}
                {step === 1 && (
                    <div className="form-step fade-in">
                        <h3>Personal Information</h3>
                        <div className="form-grid">
                            <input type="text" name="fullName" placeholder="Full Name" value={formData.personalInfo.fullName} onChange={handlePersonalChange} />
                            <input type="email" name="email" placeholder="Email" value={formData.personalInfo.email} onChange={handlePersonalChange} />
                            <input type="text" name="phone" placeholder="Phone Number" value={formData.personalInfo.phone} onChange={handlePersonalChange} />
                            <input type="text" name="address" placeholder="Address (City, Country)" value={formData.personalInfo.address} onChange={handlePersonalChange} />
                            <input type="text" name="linkedin" placeholder="LinkedIn URL" value={formData.personalInfo.linkedin} onChange={handlePersonalChange} />
                            <input type="text" name="website" placeholder="Portfolio / Website" value={formData.personalInfo.website} onChange={handlePersonalChange} />
                        </div>
                        <div className="btn-group">
                            <button className="btn-next" onClick={() => setStep(2)}>Next <i className="fa-solid fa-arrow-right"></i></button>
                        </div>
                    </div>
                )}

                {/* --- Step 2: Experience --- */}
                {step === 2 && (
                    <div className="form-step fade-in">
                        <h3>Experience</h3>
                        <p className="hint-text">Our AI will optimize your job descriptions automatically!</p>
                        
                        {formData.experience.map((exp, index) => (
                            <div key={index} className="array-item">
                                <div className="item-header">
                                    <h4>Job #{index + 1}</h4>
                                    {index > 0 && <button className="btn-remove" onClick={() => removeItem(index, 'experience')}><i className="fa-solid fa-trash"></i></button>}
                                </div>
                                <div className="form-grid">
                                    <input type="text" placeholder="Job Title" value={exp.title} onChange={(e) => handleArrayChange(index, 'title', e.target.value, 'experience')} />
                                    <input type="text" placeholder="Company Name" value={exp.company} onChange={(e) => handleArrayChange(index, 'company', e.target.value, 'experience')} />
                                    <input type="text" placeholder="Start Date" value={exp.startDate} onChange={(e) => handleArrayChange(index, 'startDate', e.target.value, 'experience')} />
                                    <input type="text" placeholder="End Date" value={exp.endDate} onChange={(e) => handleArrayChange(index, 'endDate', e.target.value, 'experience')} />
                                </div>
                                <textarea 
                                    placeholder="Describe your role (Bullet points recommended). The AI will improve this text." 
                                    value={exp.role} 
                                    onChange={(e) => handleArrayChange(index, 'role', e.target.value, 'experience')}
                                    rows="4"
                                ></textarea>
                            </div>
                        ))}
                        <button className="btn-add" onClick={() => addItem('experience', { title: '', company: '', startDate: '', endDate: '', role: '' })}>+ Add Another Job</button>
                        
                        <div className="btn-group">
                            <button className="btn-back" onClick={() => setStep(1)}>Back</button>
                            <button className="btn-next" onClick={() => setStep(3)}>Next</button>
                        </div>
                    </div>
                )}

                {/* --- Step 3: Education & Skills --- */}
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
                                    <input type="text" placeholder="Degree / Major" value={edu.degree} onChange={(e) => handleArrayChange(index, 'degree', e.target.value, 'education')} />
                                    <input type="text" placeholder="School / University" value={edu.school} onChange={(e) => handleArrayChange(index, 'school', e.target.value, 'education')} />
                                    <input type="text" placeholder="Year (e.g., 2020 - 2024)" value={edu.year} onChange={(e) => handleArrayChange(index, 'year', e.target.value, 'education')} />
                                </div>
                            </div>
                        ))}
                        <button className="btn-add" onClick={() => addItem('education', { degree: '', school: '', year: '' })}>+ Add Education</button>

                        <hr className="divider" />
                        
                        <h3>Skills</h3>
                        <p className="hint-text">Separate skills with commas (e.g., React, Node.js, Team Leadership)</p>
                        <textarea 
                            name="skills" 
                            value={formData.skills} 
                            onChange={handleChange} 
                            placeholder="List your skills here..."
                            rows="3"
                        ></textarea>

                        <div className="btn-group">
                            <button className="btn-back" onClick={() => setStep(2)}>Back</button>
                            <button className="btn-next" onClick={() => setStep(4)}>Next</button>
                        </div>
                    </div>
                )}

                {/* --- Step 4: Summary & Finalize --- */}
                {step === 4 && (
                    <div className="form-step fade-in">
                        <h3>Professional Summary</h3>
                        <p className="hint-text">Write a brief summary. Our AI will rewrite it to sound more professional.</p>
                        <textarea 
                            name="summary" 
                            value={formData.summary} 
                            onChange={handleChange} 
                            placeholder="E.g., I am a software engineer with 2 years of experience..."
                            rows="5"
                        ></textarea>

                        <div className="template-selector">
                            <h4>Select Template</h4>
                            {/* يمكن جلب هذه القائمة من الباك اند لاحقاً getTemplates */}
                            <div className="templates-grid">
                                <div 
                                    // 👇 التعديل هنا (للشكل): هل هو المختار؟
                                    className={`template-card ${formData.templateId === 'ats-002' ? 'selected' : ''}`}
                                    // 👇 التعديل هنا (للوجيك): لما يضغط يختار ats-002
                                    onClick={() => setFormData({...formData, templateId: 'ats-002'})}
                                >
                                    <i className="fa-solid fa-file-lines"></i>
                                    <span>Modern ATS</span>
                                </div>
                                <div className="template-card disabled">
                                    <i className="fa-solid fa-lock"></i>
                                    <span>Creative (Coming Soon)</span>
                                </div>
                            </div>
                        </div>

                        <div className="btn-group">
                            <button className="btn-back" onClick={() => setStep(3)}>Back</button>
                            {loading ? (
                                <button className="btn-submit" disabled><i className="fa-solid fa-spinner fa-spin"></i> Processing with AI...</button>
                            ) : (
                                <button className="btn-submit" onClick={handleSubmit}>Generate CV <i className="fa-solid fa-wand-magic-sparkles"></i></button>
                            )}
                        </div>
                    </div>
                )}

                {/* --- Step 5: Success & Download --- */}
                {step === 5 && (
                    <div className="form-step success-step fade-in">
                        <div className="success-icon"><i className="fa-solid fa-circle-check"></i></div>
                        <h3>CV Generated Successfully!</h3>
                        <p>Your CV has been optimized by AI and is ready.</p>
                        
                        <div className="action-buttons-final">
                            {/* زرار التحميل */}
                            <a href={`http://localhost:5000/api/cv-builder/download/${generatedId}`} className="btn-download" target="_blank" rel="noopener noreferrer">
                                <i className="fa-solid fa-download"></i> Download PDF
                            </a>

                            {/* زرار المعاينة في تاب جديد */}
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