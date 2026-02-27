import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom'; // ?? 1. ??????? ?????? ???? ????? ??? ???????

const Contact = () => {
    const [showMessage, setShowMessage] = useState(false);
    const navigate = useNavigate(); // ?? 2. ????? ??????

    const handleSubmit = (e) => {
        e.preventDefault();
        setShowMessage(true); // ????? ???????

        // ??? 4 ?????: ????? ??????? ?????? ????? ?????????
        setTimeout(() => {
            setShowMessage(false);
            navigate('/'); // ?? 3. ????? ?????? ?????? ????????
        }, 4000);
    };

    return (
        <div style={{ backgroundColor: '#F0F7F5', minHeight: '80vh', padding: '60px 20px', fontFamily: "'Segoe UI', sans-serif", position: 'relative' }}>

            {/* ??????? ???? ????? ?? ??? */}
            {showMessage && (
                <div style={{
                    position: 'fixed',
                    top: '30px',
                    left: '50%',
                    transform: 'translateX(-50%)',
                    backgroundColor: '#2F5D54',
                    color: 'white',
                    padding: '15px 25px',
                    borderRadius: '8px',
                    boxShadow: '0 5px 15px rgba(0,0,0,0.2)',
                    zIndex: 1000,
                    display: 'flex',
                    alignItems: 'center',
                    gap: '10px',
                    fontSize: '1.1rem',
                    fontWeight: '500',
                    animation: 'fadeInDown 0.4s ease-out'
                }}>
                    <i className="fa-solid fa-circle-check" style={{ color: '#A7F3D0', fontSize: '1.3rem' }}></i>
                    Thank you! We have received your message and will contact you soon.
                </div>
            )}

            <style>
                {`
          @keyframes fadeInDown {
            from { opacity: 0; transform: translate(-50%, -20px); }
            to { opacity: 1; transform: translate(-50%, 0); }
          }
        `}
            </style>

            <div style={{ maxWidth: '1000px', margin: '0 auto', backgroundColor: 'white', borderRadius: '15px', overflow: 'hidden', display: 'flex', flexWrap: 'wrap', boxShadow: '0 10px 30px rgba(47, 93, 84, 0.1)' }}>

                {/* ??????? ??????? (????) */}
                <div style={{ flex: '1 1 350px', backgroundColor: '#2F5D54', color: 'white', padding: '50px' }}>
                    <h2 style={{ fontSize: '2rem', marginTop: 0, marginBottom: '20px' }}>Get in Touch</h2>
                    <p style={{ color: '#dbece8', lineHeight: '1.6', marginBottom: '40px' }}>
                        Have a question about our AI tools? Want to report a bug? Or just want to say hi? Drop us a message!
                    </p>

                    <div style={{ marginBottom: '20px', display: 'flex', alignItems: 'center' }}>
                        <i className="fa-solid fa-envelope" style={{ fontSize: '20px', marginRight: '15px', color: '#58A492' }}></i>
                        <span>support@careernode.com</span>
                    </div>
                    <div style={{ marginBottom: '20px', display: 'flex', alignItems: 'center' }}>
                        <i className="fa-solid fa-location-dot" style={{ fontSize: '20px', marginRight: '15px', color: '#58A492' }}></i>
                        <span>Cairo, Egypt</span>
                    </div>
                </div>

                {/* ????? ??????? (????) */}
                <form onSubmit={handleSubmit} style={{ flex: '1 1 450px', padding: '50px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
                    <h3 style={{ color: '#2c3e50', marginTop: 0, marginBottom: '5px', fontSize: '1.5rem' }}>Send us a Message</h3>

                    <input type="text" placeholder="Your Name" required style={{ padding: '15px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '1rem', outline: 'none' }} />
                    <input type="email" placeholder="Your Email" required style={{ padding: '15px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '1rem', outline: 'none' }} />
                    <textarea placeholder="How can we help you?" required rows="5" style={{ padding: '15px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '1rem', outline: 'none', resize: 'vertical' }}></textarea>

                    <button type="submit" style={{ backgroundColor: '#58A492', color: 'white', border: 'none', padding: '15px', borderRadius: '8px', fontSize: '1rem', fontWeight: 'bold', cursor: 'pointer', transition: '0.3s', marginTop: '10px' }}
                        onMouseEnter={(e) => e.target.style.backgroundColor = '#2F5D54'}
                        onMouseLeave={(e) => e.target.style.backgroundColor = '#58A492'}>
                        Send Message <i className="fa-solid fa-paper-plane" style={{ marginLeft: '5px' }}></i>
                    </button>
                </form>

            </div>
        </div>
    );
};

export default Contact;