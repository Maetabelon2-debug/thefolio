// frontend/src/pages/SplashPage.js
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

const SplashPage = () => {
  const [fadeOut, setFadeOut] = useState(false);
  const [dotCount, setDotCount] = useState(0);
  const navigate = useNavigate();

  // Animate dots
  useEffect(() => {
    const dotInterval = setInterval(() => {
      setDotCount((prev) => (prev + 1) % 4);
    }, 300);

    // Redirect to home page after 3 seconds
    const redirectTimer = setTimeout(() => {
      setFadeOut(true);
      
      // Redirect after fade out animation
      setTimeout(() => {
        navigate('/home');
      }, 500);
    }, 3000);

    return () => {
      clearInterval(dotInterval);
      clearTimeout(redirectTimer);
    };
  }, [navigate]);

  const getDotsText = () => {
    return '.'.repeat(dotCount);
  };

  return (
    <div style={{
      margin: 0,
      padding: 0,
      boxSizing: 'border-box',
      fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif",
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      height: '100vh',
      width: '100vw',
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      overflow: 'hidden',
      position: 'fixed',
      top: 0,
      left: 0,
      zIndex: 9999
    }}>
      <style>
        {`
          @keyframes float {
            0%, 100% { transform: translateY(0); }
            50% { transform: translateY(-20px); }
          }
          
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
          
          @keyframes fadeOut {
            to { opacity: 0; visibility: hidden; }
          }
          
          .fade-out {
            animation: fadeOut 0.5s ease-out forwards;
          }
        `}
      </style>
      
      <div style={{ 
        textAlign: 'center', 
        color: 'white', 
        animation: fadeOut ? 'fadeOut 0.5s ease-out forwards' : 'none' 
      }}>
        <div style={{ animation: 'float 3s ease-in-out infinite', marginBottom: '30px' }}>
          <i className="fas fa-microphone-alt" style={{ fontSize: '120px', color: 'white' }}></i>
        </div>
        <h1 style={{ fontSize: '42px', marginBottom: '20px', textShadow: '2px 2px 4px rgba(0,0,0,0.3)' }}>VocalVibes</h1>
        <div style={{
          width: '80px',
          height: '80px',
          border: '8px solid rgba(255,255,255,0.3)',
          borderTop: '8px solid white',
          borderRadius: '50%',
          margin: '30px auto',
          animation: 'spin 1s linear infinite'
        }}></div>
        <div style={{ fontSize: '20px', marginTop: '20px', color: 'rgba(255,255,255,0.9)' }}>
          Loading<span style={{ display: 'inline-block', width: '30px', textAlign: 'left' }}>{getDotsText()}</span>
        </div>
      </div>
    </div>
  );
};

export default SplashPage;