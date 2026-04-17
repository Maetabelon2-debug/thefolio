// frontend/src/pages/RegisterPage.js
import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import API from '../api/axios';

const RegisterPage = () => {
  const [form, setForm] = useState({ name: '', email: '', password: '', confirmPassword: '' });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [passwordStrength, setPasswordStrength] = useState(0);
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm({ ...form, [name]: value });
    
    // Check password strength when password field changes
    if (name === 'password') {
      calculatePasswordStrength(value);
    }
  };

  const calculatePasswordStrength = (password) => {
    let strength = 0;
    if (password.length >= 6) strength++;
    if (password.length >= 10) strength++;
    if (/[A-Z]/.test(password)) strength++;
    if (/[0-9]/.test(password)) strength++;
    if (/[^A-Za-z0-9]/.test(password)) strength++;
    setPasswordStrength(strength);
  };

  const getPasswordStrengthText = () => {
    if (passwordStrength === 0) return 'No password';
    if (passwordStrength <= 2) return 'Weak';
    if (passwordStrength <= 3) return 'Fair';
    if (passwordStrength <= 4) return 'Good';
    return 'Strong';
  };

  const getPasswordStrengthColor = () => {
    if (passwordStrength === 0) return '#ccc';
    if (passwordStrength <= 2) return '#f44336';
    if (passwordStrength <= 3) return '#ff9800';
    if (passwordStrength <= 4) return '#2196f3';
    return '#4CAF50';
  };

  const validateForm = () => {
    if (!form.name.trim()) {
      setError('Please enter your full name');
      return false;
    }
    if (form.name.trim().length < 2) {
      setError('Name must be at least 2 characters long');
      return false;
    }
    if (!form.email.trim()) {
      setError('Please enter your email address');
      return false;
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(form.email)) {
      setError('Please enter a valid email address');
      return false;
    }
    if (!form.password) {
      setError('Please enter a password');
      return false;
    }
    if (form.password.length < 6) {
      setError('Password must be at least 6 characters long');
      return false;
    }
    if (form.password !== form.confirmPassword) {
      setError('Passwords do not match');
      return false;
    }
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    
    if (!validateForm()) return;
    
    setLoading(true);
    
    try {
      const response = await API.post('/auth/register', {
        name: form.name.trim(),
        email: form.email.trim().toLowerCase(),
        password: form.password
      });
      
      if (response.data.token) {
        localStorage.setItem('token', response.data.token);
        setSuccess('Registration successful! Redirecting...');
        setTimeout(() => navigate('/home'), 1500);
      } else {
        setError('Registration failed. Please try again.');
      }
    } catch (err) {
      console.error('Registration error:', err);
      setError(err.response?.data?.message || 'Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="container">
      <div className="page-header">
        <h1>Create an Account</h1>
        <p>Join VocalVibes community and start sharing your stories</p>
      </div>
      
      <div className="register-centered" style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        minHeight: 'calc(100vh - 350px)'
      }}>
        <div className="register-form" style={{
          maxWidth: '500px',
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
                <i className="fas fa-user-plus" style={{ fontSize: '2rem', color: 'white' }}></i>
              </div>
              <h2 style={{ color: 'var(--primary)', marginBottom: '0.25rem' }}>Join VocalVibes</h2>
              <p style={{ color: '#888', fontSize: '0.85rem' }}>Create your free account</p>
            </div>
            
            {/* Success Message */}
            {success && (
              <div className="notification success" style={{
                backgroundColor: '#4CAF50',
                color: 'white',
                padding: '12px',
                borderRadius: '10px',
                marginBottom: '1.5rem',
                display: 'flex',
                alignItems: 'center',
                gap: '10px',
                fontSize: '0.9rem'
              }}>
                <i className="fas fa-check-circle" style={{ fontSize: '1.1rem' }}></i>
                <span>{success}</span>
              </div>
            )}
            
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
            
            {/* Registration Form */}
            <form onSubmit={handleSubmit}>
              <div className="form-group" style={{ marginBottom: '1.5rem' }}>
                <label style={{
                  display: 'block',
                  marginBottom: '0.5rem',
                  fontWeight: '600',
                  color: 'var(--primary)',
                  fontSize: '0.9rem'
                }}>
                  <i className="fas fa-user" style={{ marginRight: '8px', color: 'var(--secondary)' }}></i>
                  Full Name
                </label>
                <input
                  type="text"
                  name="name"
                  value={form.name}
                  onChange={handleChange}
                  required
                  placeholder="Enter your full name"
                  autoComplete="name"
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
                  name="email"
                  value={form.email}
                  onChange={handleChange}
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
              
              <div className="form-group" style={{ marginBottom: '1.5rem' }}>
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
                    name="password"
                    value={form.password}
                    onChange={handleChange}
                    required
                    minLength={6}
                    placeholder="Minimum 6 characters"
                    autoComplete="new-password"
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
                    onClick={() => setShowPassword(!showPassword)}
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
                
                {/* Password Strength Indicator */}
                {form.password && (
                  <div style={{ marginTop: '0.5rem' }}>
                    <div style={{
                      display: 'flex',
                      gap: '5px',
                      marginBottom: '0.3rem'
                    }}>
                      {[1, 2, 3, 4, 5].map((level) => (
                        <div
                          key={level}
                          style={{
                            flex: 1,
                            height: '4px',
                            backgroundColor: level <= passwordStrength ? getPasswordStrengthColor() : '#e0e0e0',
                            borderRadius: '2px',
                            transition: 'background-color 0.3s ease'
                          }}
                        ></div>
                      ))}
                    </div>
                    <p style={{
                      fontSize: '0.75rem',
                      color: getPasswordStrengthColor(),
                      margin: 0
                    }}>
                      Password strength: {getPasswordStrengthText()}
                    </p>
                  </div>
                )}
              </div>
              
              <div className="form-group" style={{ marginBottom: '1.5rem' }}>
                <label style={{
                  display: 'block',
                  marginBottom: '0.5rem',
                  fontWeight: '600',
                  color: 'var(--primary)',
                  fontSize: '0.9rem'
                }}>
                  <i className="fas fa-check-circle" style={{ marginRight: '8px', color: 'var(--secondary)' }}></i>
                  Confirm Password
                </label>
                <div style={{ position: 'relative' }}>
                  <input
                    type={showConfirmPassword ? "text" : "password"}
                    name="confirmPassword"
                    value={form.confirmPassword}
                    onChange={handleChange}
                    required
                    placeholder="Confirm your password"
                    autoComplete="new-password"
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
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
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
                    <i className={`fas fa-${showConfirmPassword ? 'eye-slash' : 'eye'}`}></i>
                  </button>
                </div>
                {form.confirmPassword && form.password !== form.confirmPassword && (
                  <p style={{
                    fontSize: '0.75rem',
                    color: '#f44336',
                    marginTop: '0.3rem'
                  }}>
                    <i className="fas fa-times-circle" style={{ marginRight: '5px' }}></i>
                    Passwords do not match
                  </p>
                )}
                {form.confirmPassword && form.password === form.confirmPassword && form.password && (
                  <p style={{
                    fontSize: '0.75rem',
                    color: '#4CAF50',
                    marginTop: '0.3rem'
                  }}>
                    <i className="fas fa-check-circle" style={{ marginRight: '5px' }}></i>
                    Passwords match
                  </p>
                )}
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
                  <><i className="fas fa-spinner fa-spin"></i> Creating Account...</>
                ) : (
                  <><i className="fas fa-user-plus"></i> Create Account</>
                )}
              </button>
            </form>
            
            {/* Login Link */}
            <div className="form-note" style={{
              textAlign: 'center',
              marginTop: '1.5rem',
              paddingTop: '1.5rem',
              borderTop: '1px solid #eee'
            }}>
              <p style={{ color: '#666', fontSize: '0.9rem' }}>
                Already have an account?{' '}
                <Link to="/login" style={{
                  color: 'var(--secondary)',
                  textDecoration: 'none',
                  fontWeight: '600',
                  transition: 'color 0.3s ease'
                }}
                onMouseEnter={(e) => e.target.style.color = 'var(--primary)'}
                onMouseLeave={(e) => e.target.style.color = 'var(--secondary)'}>
                  Sign in here
                </Link>
              </p>
            </div>
          </div>
        </div>
      </div>
      
      {/* Benefits Section */}
      <div className="section" style={{ marginTop: '3rem' }}>
        <h2>Why Join VocalVibes?</h2>
        <div className="benefits-grid" style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
          gap: '1.5rem',
          marginTop: '2rem'
        }}>
          <div className="benefit-card" style={{
            backgroundColor: 'white',
            padding: '1.5rem',
            borderRadius: '15px',
            textAlign: 'center',
            transition: 'transform 0.3s ease',
            boxShadow: '0 5px 15px rgba(0,0,0,0.1)'
          }}>
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
              <i className="fas fa-microphone-alt" style={{ fontSize: '1.5rem', color: 'white' }}></i>
            </div>
            <h3 style={{ color: 'var(--primary)', marginBottom: '0.5rem' }}>Share Your Voice</h3>
            <p style={{ color: '#666', fontSize: '0.9rem' }}>Express your thoughts and ideas with our community through posts and stories.</p>
          </div>
          
          <div className="benefit-card" style={{
            backgroundColor: 'white',
            padding: '1.5rem',
            borderRadius: '15px',
            textAlign: 'center',
            transition: 'transform 0.3s ease',
            boxShadow: '0 5px 15px rgba(0,0,0,0.1)'
          }}>
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
              <i className="fas fa-comments" style={{ fontSize: '1.5rem', color: 'white' }}></i>
            </div>
            <h3 style={{ color: 'var(--primary)', marginBottom: '0.5rem' }}>Engage & Discuss</h3>
            <p style={{ color: '#666', fontSize: '0.9rem' }}>Comment on posts and join meaningful conversations with fellow singers.</p>
          </div>
          
          <div className="benefit-card" style={{
            backgroundColor: 'white',
            padding: '1.5rem',
            borderRadius: '15px',
            textAlign: 'center',
            transition: 'transform 0.3s ease',
            boxShadow: '0 5px 15px rgba(0,0,0,0.1)'
          }}>
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
              <i className="fas fa-trophy" style={{ fontSize: '1.5rem', color: 'white' }}></i>
            </div>
            <h3 style={{ color: 'var(--primary)', marginBottom: '0.5rem' }}>Build Your Portfolio</h3>
            <p style={{ color: '#666', fontSize: '0.9rem' }}>Create a collection of your best work and stories to showcase your talent.</p>
          </div>
        </div>
      </div>
      
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
        
        .register-form:hover {
          transform: translateY(-5px);
          box-shadow: 0 25px 50px rgba(0,0,0,0.15);
        }
        
        .benefit-card:hover {
          transform: translateY(-5px);
        }
        
        @media (max-width: 768px) {
          .benefits-grid {
            grid-template-columns: 1fr;
          }
        }
        
        @media (max-width: 480px) {
          .register-form {
            margin: 0 15px;
          }
          
          .register-form > div {
            padding: 1.5rem;
          }
        }
      `}</style>
    </main>
  );
};

export default RegisterPage;