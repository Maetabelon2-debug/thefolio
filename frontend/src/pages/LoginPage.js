// frontend/src/pages/LoginPage.js
import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import API from '../api/axios';

const LoginPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [resetEmail, setResetEmail] = useState('');
  const [resetMessage, setResetMessage] = useState('');
  const [resetError, setResetError] = useState('');
  const [resetLoading, setResetLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    
    if (!email.trim()) {
      setError('Please enter your email address');
      setLoading(false);
      return;
    }
    
    if (!password.trim()) {
      setError('Please enter your password');
      setLoading(false);
      return;
    }
    
    try {
      const user = await login(email, password);
      // Redirect to home page after successful login
      navigate('/home');
    } catch (err) {
      console.error('Login error:', err);
      setError(err.response?.data?.message || 'Login failed. Please check your credentials and try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleForgotPassword = async (e) => {
    e.preventDefault();
    setResetMessage('');
    setResetError('');
    setResetLoading(true);
    
    if (!resetEmail.trim()) {
      setResetError('Please enter your email address');
      setResetLoading(false);
      return;
    }

    try {
      const response = await API.post('/auth/forgot-password', { email: resetEmail });
      setResetMessage(response.data.message || 'Password reset link has been sent to your email.');
      setTimeout(() => {
        setShowForgotPassword(false);
        setResetEmail('');
        setResetMessage('');
      }, 3000);
    } catch (err) {
      setResetError(err.response?.data?.message || 'Failed to send reset link. Please try again.');
    } finally {
      setResetLoading(false);
    }
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  return (
    <main className="container">
      <div className="page-header">
        <h1>Login to VocalVibes</h1>
        <p>Welcome back! Sign in to continue sharing your stories.</p>
      </div>
      
      <div className="login-centered" style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        minHeight: 'calc(100vh - 350px)'
      }}>
        <div className="login-form" style={{
          maxWidth: '450px',
          width: '100%',
          margin: '0 auto',
          backgroundColor: 'white',
          borderRadius: '20px',
          overflow: 'hidden',
          boxShadow: '0 20px 40px rgba(0,0,0,0.1)',
          transition: 'transform 0.3s ease, box-shadow 0.3s ease'
        }}>
          {/* Decorative Top Bar */}
          <div style={{
            height: '5px',
            background: 'linear-gradient(90deg, var(--primary), var(--secondary), var(--accent))'
          }}></div>
          
          <div style={{ padding: '2rem' }}>
            {/* Logo/Icon Section */}
            <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
              <div style={{
                width: '70px',
                height: '70px',
                background: 'linear-gradient(135deg, var(--primary), var(--secondary))',
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 1rem auto',
                boxShadow: '0 10px 20px rgba(74,20,140,0.2)'
              }}>
                <i className="fas fa-microphone-alt" style={{ fontSize: '2rem', color: 'white' }}></i>
              </div>
              <h2 style={{ color: 'var(--primary)', marginBottom: '0.25rem' }}>Welcome Back</h2>
              <p style={{ color: '#888', fontSize: '0.85rem' }}>Sign in to access your account</p>
            </div>
            
            {/* Error Message */}
            {error && (
              <div className="notification error" style={{
                backgroundColor: '#f44336',
                color: 'white',
                padding: '12px',
                borderRadius: '10px',
                marginBottom: '1.5rem',
                display: 'flex',
                alignItems: 'center',
                gap: '10px',
                fontSize: '0.9rem'
              }}>
                <i className="fas fa-exclamation-circle" style={{ fontSize: '1.1rem' }}></i>
                <span>{error}</span>
              </div>
            )}
            
            {/* Login Form */}
            <form onSubmit={handleSubmit}>
              <div className="form-group" style={{ marginBottom: '1.5rem' }}>
                <label style={{
                  display: 'block',
                  marginBottom: '0.5rem',
                  fontWeight: '600',
                  color: 'var(--primary)',
                  fontSize: '0.9rem'
                }}>
                  <i className="fas fa-envelope" style={{ marginRight: '8px', color: 'var(--secondary)' }}></i>
                  Email Address
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  placeholder="your@email.com"
                  autoComplete="email"
                  style={{
                    width: '100%',
                    padding: '12px 15px',
                    border: '2px solid #e0e0e0',
                    borderRadius: '12px',
                    fontSize: '1rem',
                    transition: 'all 0.3s ease',
                    backgroundColor: '#fafafa'
                  }}
                  onFocus={(e) => {
                    e.target.style.borderColor = 'var(--primary)';
                    e.target.style.backgroundColor = 'white';
                    e.target.style.boxShadow = '0 0 0 3px rgba(74,20,140,0.1)';
                  }}
                  onBlur={(e) => {
                    e.target.style.borderColor = '#e0e0e0';
                    e.target.style.backgroundColor = '#fafafa';
                    e.target.style.boxShadow = 'none';
                  }}
                />
              </div>
              
              <div className="form-group" style={{ marginBottom: '1rem' }}>
                <label style={{
                  display: 'block',
                  marginBottom: '0.5rem',
                  fontWeight: '600',
                  color: 'var(--primary)',
                  fontSize: '0.9rem'
                }}>
                  <i className="fas fa-lock" style={{ marginRight: '8px', color: 'var(--secondary)' }}></i>
                  Password
                </label>
                <div style={{ position: 'relative' }}>
                  <input
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    placeholder="Enter your password"
                    autoComplete="current-password"
                    style={{
                      width: '100%',
                      padding: '12px 45px 12px 15px',
                      border: '2px solid #e0e0e0',
                      borderRadius: '12px',
                      fontSize: '1rem',
                      transition: 'all 0.3s ease',
                      backgroundColor: '#fafafa'
                    }}
                    onFocus={(e) => {
                      e.target.style.borderColor = 'var(--primary)';
                      e.target.style.backgroundColor = 'white';
                      e.target.style.boxShadow = '0 0 0 3px rgba(74,20,140,0.1)';
                    }}
                    onBlur={(e) => {
                      e.target.style.borderColor = '#e0e0e0';
                      e.target.style.backgroundColor = '#fafafa';
                      e.target.style.boxShadow = 'none';
                    }}
                  />
                  <button
                    type="button"
                    onClick={togglePasswordVisibility}
                    style={{
                      position: 'absolute',
                      right: '12px',
                      top: '50%',
                      transform: 'translateY(-50%)',
                      background: 'none',
                      border: 'none',
                      cursor: 'pointer',
                      color: '#999',
                      fontSize: '1.1rem',
                      padding: '5px',
                      transition: 'color 0.3s ease'
                    }}
                    onMouseEnter={(e) => e.target.style.color = 'var(--primary)'}
                    onMouseLeave={(e) => e.target.style.color = '#999'}
                  >
                    <i className={`fas fa-${showPassword ? 'eye-slash' : 'eye'}`}></i>
                  </button>
                </div>
              </div>
              
              <div style={{ textAlign: 'right', marginBottom: '1.5rem' }}>
                <button
                  type="button"
                  onClick={() => setShowForgotPassword(true)}
                  style={{
                    background: 'none',
                    border: 'none',
                    color: 'var(--accent)',
                    cursor: 'pointer',
                    fontSize: '0.85rem',
                    transition: 'color 0.3s ease'
                  }}
                  onMouseEnter={(e) => e.target.style.color = 'var(--secondary)'}
                  onMouseLeave={(e) => e.target.style.color = 'var(--accent)'}
                >
                  Forgot Password?
                </button>
              </div>
              
              <button
                type="submit"
                className="btn"
                disabled={loading}
                style={{
                  width: '100%',
                  padding: '14px',
                  fontSize: '1rem',
                  borderRadius: '40px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '10px',
                  background: 'linear-gradient(135deg, var(--primary), var(--secondary))',
                  color: 'white',
                  border: 'none',
                  cursor: loading ? 'not-allowed' : 'pointer',
                  opacity: loading ? 0.7 : 1,
                  transition: 'all 0.3s ease'
                }}
                onMouseEnter={(e) => {
                  if (!loading) {
                    e.target.style.transform = 'translateY(-2px)';
                    e.target.style.boxShadow = '0 10px 20px rgba(74,20,140,0.3)';
                  }
                }}
                onMouseLeave={(e) => {
                  e.target.style.transform = 'translateY(0)';
                  e.target.style.boxShadow = 'none';
                }}
              >
                {loading ? (
                  <><i className="fas fa-spinner fa-spin"></i> Logging in...</>
                ) : (
                  <><i className="fas fa-sign-in-alt"></i> Login</>
                )}
              </button>
            </form>
            
            {/* Register Link */}
            <div className="form-note" style={{
              textAlign: 'center',
              marginTop: '1.5rem',
              paddingTop: '1.5rem',
              borderTop: '1px solid #eee'
            }}>
              <p style={{ color: '#666', fontSize: '0.9rem' }}>
                Don't have an account?{' '}
                <Link to="/register" style={{
                  color: 'var(--secondary)',
                  textDecoration: 'none',
                  fontWeight: '600',
                  transition: 'color 0.3s ease'
                }}
                onMouseEnter={(e) => e.target.style.color = 'var(--primary)'}
                onMouseLeave={(e) => e.target.style.color = 'var(--secondary)'}>
                  Create an account
                </Link>
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Forgot Password Modal */}
      {showForgotPassword && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0,0,0,0.5)',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          zIndex: 1000,
          backdropFilter: 'blur(3px)'
        }}>
          <div style={{
            backgroundColor: 'white',
            borderRadius: '20px',
            maxWidth: '450px',
            width: '90%',
            padding: '2rem',
            position: 'relative',
            animation: 'modalFadeIn 0.3s ease'
          }}>
            <button
              onClick={() => {
                setShowForgotPassword(false);
                setResetMessage('');
                setResetError('');
                setResetEmail('');
              }}
              style={{
                position: 'absolute',
                top: '15px',
                right: '15px',
                background: 'none',
                border: 'none',
                fontSize: '1.5rem',
                cursor: 'pointer',
                color: '#999',
                transition: 'color 0.3s ease'
              }}
              onMouseEnter={(e) => e.target.style.color = '#f44336'}
              onMouseLeave={(e) => e.target.style.color = '#999'}
            >
              ✕
            </button>
            
            <div style={{ textAlign: 'center', marginBottom: '1.5rem' }}>
              <div style={{
                width: '60px',
                height: '60px',
                background: 'linear-gradient(135deg, var(--primary), var(--secondary))',
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 1rem auto'
              }}>
                <i className="fas fa-key" style={{ fontSize: '1.5rem', color: 'white' }}></i>
              </div>
              <h2 style={{ color: 'var(--primary)', marginBottom: '0.5rem' }}>Reset Password</h2>
              <p style={{ color: '#666', fontSize: '0.9rem' }}>
                Enter your email address and we'll send you a link to reset your password.
              </p>
            </div>
            
            {resetMessage && (
              <div style={{
                backgroundColor: '#4CAF50',
                color: 'white',
                padding: '12px',
                borderRadius: '10px',
                marginBottom: '1rem',
                textAlign: 'center',
                fontSize: '0.9rem'
              }}>
                <i className="fas fa-check-circle" style={{ marginRight: '8px' }}></i>
                {resetMessage}
              </div>
            )}
            
            {resetError && (
              <div style={{
                backgroundColor: '#f44336',
                color: 'white',
                padding: '12px',
                borderRadius: '10px',
                marginBottom: '1rem',
                textAlign: 'center',
                fontSize: '0.9rem'
              }}>
                <i className="fas fa-exclamation-circle" style={{ marginRight: '8px' }}></i>
                {resetError}
              </div>
            )}
            
            <form onSubmit={handleForgotPassword}>
              <div className="form-group" style={{ marginBottom: '1.5rem' }}>
                <label style={{
                  display: 'block',
                  marginBottom: '0.5rem',
                  fontWeight: '600',
                  color: 'var(--primary)'
                }}>
                  Email Address
                </label>
                <input
                  type="email"
                  value={resetEmail}
                  onChange={(e) => setResetEmail(e.target.value)}
                  required
                  placeholder="your@email.com"
                  style={{
                    width: '100%',
                    padding: '12px',
                    border: '2px solid #e0e0e0',
                    borderRadius: '10px',
                    fontSize: '1rem',
                    transition: 'all 0.3s ease'
                  }}
                  onFocus={(e) => e.target.style.borderColor = 'var(--primary)'}
                  onBlur={(e) => e.target.style.borderColor = '#e0e0e0'}
                />
              </div>
              
              <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem' }}>
                <button
                  type="submit"
                  className="btn"
                  disabled={resetLoading}
                  style={{
                    flex: 1,
                    padding: '12px',
                    borderRadius: '40px',
                    background: 'linear-gradient(135deg, var(--primary), var(--secondary))',
                    color: 'white',
                    border: 'none',
                    cursor: resetLoading ? 'not-allowed' : 'pointer',
                    opacity: resetLoading ? 0.7 : 1
                  }}
                >
                  {resetLoading ? (
                    <><i className="fas fa-spinner fa-spin"></i> Sending...</>
                  ) : (
                    <><i className="fas fa-paper-plane"></i> Send Reset Link</>
                  )}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowForgotPassword(false);
                    setResetMessage('');
                    setResetError('');
                    setResetEmail('');
                  }}
                  style={{
                    flex: 1,
                    padding: '12px',
                    borderRadius: '40px',
                    backgroundColor: '#999',
                    color: 'white',
                    border: 'none',
                    cursor: 'pointer',
                    transition: 'background-color 0.3s ease'
                  }}
                  onMouseEnter={(e) => e.target.style.backgroundColor = '#777'}
                  onMouseLeave={(e) => e.target.style.backgroundColor = '#999'}
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <style>{`
        @keyframes modalFadeIn {
          from {
            opacity: 0;
            transform: scale(0.9);
          }
          to {
            opacity: 1;
            transform: scale(1);
          }
        }
        
        .login-form:hover {
          transform: translateY(-5px);
          box-shadow: 0 25px 50px rgba(0,0,0,0.15);
        }
        
        @media (max-width: 480px) {
          .login-form {
            margin: 0 15px;
          }
          
          .login-form > div {
            padding: 1.5rem;
          }
        }
      `}</style>
    </main>
  );
};

export default LoginPage;