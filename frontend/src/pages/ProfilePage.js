// frontend/src/pages/ProfilePage.js
import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import API from '../api/axios';

const ProfilePage = () => {
  const { user, setUser } = useAuth();
  const [name, setName] = useState(user?.name || '');
  const [bio, setBio] = useState(user?.bio || '');
  const [pic, setPic] = useState(null);
  const [curPw, setCurPw] = useState('');
  const [newPw, setNewPw] = useState('');
  const [msg, setMsg] = useState('');
  const [error, setError] = useState('');
  const [uploading, setUploading] = useState(false);
  const [activeTab, setActiveTab] = useState('profile'); // 'profile' or 'password'

  // Generate profile picture URL
  const picSrc = user?.profilePic 
    ? `http://localhost:5000/uploads/${user.profilePic}` 
    : 'https://via.placeholder.com/150/4a148c/ffffff?text=User';

  const handleProfile = async (e) => {
    e.preventDefault();
    setMsg('');
    setError('');
    setUploading(true);
    
    const fd = new FormData();
    fd.append('name', name);
    fd.append('bio', bio);
    if (pic) fd.append('profilePic', pic);
    
    try {
      const { data } = await API.put('/auth/profile', fd);
      setUser(data);
      setMsg('Profile updated successfully!');
      setPic(null); // Clear the selected file
      
      // Clear message after 3 seconds
      setTimeout(() => setMsg(''), 3000);
    } catch (err) {
      setError(err.response?.data?.message || 'Error updating profile');
      setTimeout(() => setError(''), 3000);
    } finally {
      setUploading(false);
    }
  };

  const handlePassword = async (e) => {
    e.preventDefault();
    setMsg('');
    setError('');
    setUploading(true);
    
    if (newPw.length < 6) {
      setError('New password must be at least 6 characters long');
      setUploading(false);
      return;
    }
    
    try {
      await API.put('/auth/change-password', { 
        currentPassword: curPw, 
        newPassword: newPw 
      });
      setMsg('Password changed successfully!');
      setCurPw('');
      setNewPw('');
      
      // Clear message after 3 seconds
      setTimeout(() => setMsg(''), 3000);
    } catch (err) {
      setError(err.response?.data?.message || 'Error changing password');
      setTimeout(() => setError(''), 3000);
    } finally {
      setUploading(false);
    }
  };

  // If user is not loaded yet
  if (!user) {
    return (
      <main className="container">
        <div className="page-header">
          <h1>My Profile</h1>
          <p>Loading profile information...</p>
        </div>
      </main>
    );
  }

  return (
    <main className="container">
      <div className="page-header">
        <h1>My Profile</h1>
        <p>Manage your account information and preferences</p>
      </div>
      
      <div className="profile-centered" style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        minHeight: 'calc(100vh - 300px)'
      }}>
        <div className="profile-form" style={{
          maxWidth: '600px',
          width: '100%',
          margin: '0 auto',
          backgroundColor: 'white',
          borderRadius: '20px',
          overflow: 'hidden',
          boxShadow: '0 20px 40px rgba(0,0,0,0.1)'
        }}>
          {/* Profile Header with Avatar */}
          <div className="profile-header" style={{
            background: 'linear-gradient(135deg, var(--primary), var(--secondary))',
            padding: '2rem',
            textAlign: 'center',
            color: 'white'
          }}>
            <div className="profile-avatar" style={{
              marginBottom: '1rem',
              position: 'relative',
              display: 'inline-block'
            }}>
              <img 
                src={picSrc} 
                alt={user.name}
                style={{
                  width: '120px',
                  height: '120px',
                  borderRadius: '50%',
                  objectFit: 'cover',
                  border: '4px solid white',
                  boxShadow: '0 5px 15px rgba(0,0,0,0.2)'
                }}
              />
            </div>
            <h2 style={{ margin: '0.5rem 0', color: 'white' }}>{user.name}</h2>
            <p style={{ margin: 0, opacity: 0.9 }}>
              <i className="fas fa-envelope" style={{ marginRight: '8px' }}></i>
              {user.email}
            </p>
            <p style={{ margin: '0.5rem 0 0', opacity: 0.8, fontSize: '0.85rem' }}>
              <span className="role-badge" style={{
                backgroundColor: user.role === 'admin' ? '#ff4081' : '#00bcd4',
                padding: '4px 12px',
                borderRadius: '20px',
                fontSize: '0.8rem',
                display: 'inline-block'
              }}>
                {user.role === 'admin' ? 'Administrator' : 'Member'}
              </span>
            </p>
          </div>
          
          {/* Tab Navigation */}
          <div className="profile-tabs" style={{
            display: 'flex',
            borderBottom: '2px solid #eee',
            backgroundColor: '#f9f9f9'
          }}>
            <button
              onClick={() => setActiveTab('profile')}
              style={{
                flex: 1,
                padding: '1rem',
                backgroundColor: activeTab === 'profile' ? 'white' : 'transparent',
                border: 'none',
                cursor: 'pointer',
                fontSize: '1rem',
                fontWeight: activeTab === 'profile' ? '600' : '400',
                color: activeTab === 'profile' ? 'var(--primary)' : '#666',
                borderBottom: activeTab === 'profile' ? `3px solid var(--primary)` : 'none',
                transition: 'all 0.3s ease'
              }}
            >
              <i className="fas fa-user" style={{ marginRight: '8px' }}></i>
              Edit Profile
            </button>
            <button
              onClick={() => setActiveTab('password')}
              style={{
                flex: 1,
                padding: '1rem',
                backgroundColor: activeTab === 'password' ? 'white' : 'transparent',
                border: 'none',
                cursor: 'pointer',
                fontSize: '1rem',
                fontWeight: activeTab === 'password' ? '600' : '400',
                color: activeTab === 'password' ? 'var(--primary)' : '#666',
                borderBottom: activeTab === 'password' ? `3px solid var(--primary)` : 'none',
                transition: 'all 0.3s ease'
              }}
            >
              <i className="fas fa-lock" style={{ marginRight: '8px' }}></i>
              Change Password
            </button>
          </div>
          
          {/* Notification Messages */}
          {msg && (
            <div className="notification success" style={{
              backgroundColor: '#4CAF50',
              color: 'white',
              padding: '12px',
              margin: '1rem',
              borderRadius: '8px',
              textAlign: 'center'
            }}>
              <i className="fas fa-check-circle" style={{ marginRight: '8px' }}></i>
              {msg}
            </div>
          )}
          
          {error && (
            <div className="notification error" style={{
              backgroundColor: '#f44336',
              color: 'white',
              padding: '12px',
              margin: '1rem',
              borderRadius: '8px',
              textAlign: 'center'
            }}>
              <i className="fas fa-exclamation-circle" style={{ marginRight: '8px' }}></i>
              {error}
            </div>
          )}
          
          {/* Profile Edit Form */}
          {activeTab === 'profile' && (
            <form onSubmit={handleProfile} style={{ padding: '2rem' }}>
              <div className="form-group" style={{ marginBottom: '1.5rem' }}>
                <label style={{
                  display: 'block',
                  marginBottom: '0.5rem',
                  fontWeight: '600',
                  color: 'var(--primary)'
                }}>
                  <i className="fas fa-user" style={{ marginRight: '8px' }}></i>
                  Display Name
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Your display name"
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
              
              <div className="form-group" style={{ marginBottom: '1.5rem' }}>
                <label style={{
                  display: 'block',
                  marginBottom: '0.5rem',
                  fontWeight: '600',
                  color: 'var(--primary)'
                }}>
                  <i className="fas fa-info-circle" style={{ marginRight: '8px' }}></i>
                  Bio
                </label>
                <textarea
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  placeholder="Tell us about yourself..."
                  rows={4}
                  style={{
                    width: '100%',
                    padding: '12px',
                    border: '2px solid #e0e0e0',
                    borderRadius: '10px',
                    fontSize: '1rem',
                    fontFamily: 'inherit',
                    resize: 'vertical',
                    transition: 'all 0.3s ease'
                  }}
                  onFocus={(e) => e.target.style.borderColor = 'var(--primary)'}
                  onBlur={(e) => e.target.style.borderColor = '#e0e0e0'}
                />
              </div>
              
              <div className="form-group" style={{ marginBottom: '1.5rem' }}>
                <label style={{
                  display: 'block',
                  marginBottom: '0.5rem',
                  fontWeight: '600',
                  color: 'var(--primary)'
                }}>
                  <i className="fas fa-image" style={{ marginRight: '8px' }}></i>
                  Profile Picture
                </label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => setPic(e.target.files[0])}
                  style={{
                    width: '100%',
                    padding: '10px',
                    border: '2px dashed #e0e0e0',
                    borderRadius: '10px',
                    cursor: 'pointer'
                  }}
                />
                {pic && (
                  <p style={{
                    fontSize: '0.85rem',
                    color: 'var(--accent)',
                    marginTop: '0.5rem'
                  }}>
                    <i className="fas fa-check"></i> Selected: {pic.name}
                  </p>
                )}
                <small className="form-note" style={{
                  display: 'block',
                  marginTop: '0.5rem',
                  color: '#666',
                  fontSize: '0.8rem'
                }}>
                  Upload a new profile picture (max 5MB, JPG/PNG/GIF)
                </small>
              </div>
              
              <div className="form-submit" style={{ textAlign: 'center' }}>
                <button 
                  type="submit" 
                  className="btn" 
                  disabled={uploading}
                  style={{
                    padding: '12px 30px',
                    fontSize: '1rem',
                    borderRadius: '40px',
                    minWidth: '150px'
                  }}
                >
                  {uploading ? (
                    <><i className="fas fa-spinner fa-spin"></i> Saving...</>
                  ) : (
                    <><i className="fas fa-save"></i> Save Profile</>
                  )}
                </button>
              </div>
            </form>
          )}
          
          {/* Password Change Form */}
          {activeTab === 'password' && (
            <form onSubmit={handlePassword} style={{ padding: '2rem' }}>
              <div className="form-group" style={{ marginBottom: '1.5rem' }}>
                <label style={{
                  display: 'block',
                  marginBottom: '0.5rem',
                  fontWeight: '600',
                  color: 'var(--primary)'
                }}>
                  <i className="fas fa-lock" style={{ marginRight: '8px' }}></i>
                  Current Password
                </label>
                <input
                  type="password"
                  value={curPw}
                  onChange={(e) => setCurPw(e.target.value)}
                  required
                  placeholder="Enter your current password"
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
              
              <div className="form-group" style={{ marginBottom: '1.5rem' }}>
                <label style={{
                  display: 'block',
                  marginBottom: '0.5rem',
                  fontWeight: '600',
                  color: 'var(--primary)'
                }}>
                  <i className="fas fa-key" style={{ marginRight: '8px' }}></i>
                  New Password
                </label>
                <input
                  type="password"
                  value={newPw}
                  onChange={(e) => setNewPw(e.target.value)}
                  required
                  minLength={6}
                  placeholder="Minimum 6 characters"
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
                <small className="form-note" style={{
                  display: 'block',
                  marginTop: '0.5rem',
                  color: '#666',
                  fontSize: '0.8rem'
                }}>
                  Password must be at least 6 characters long
                </small>
              </div>
              
              <div className="form-submit" style={{ textAlign: 'center' }}>
                <button 
                  type="submit" 
                  className="btn" 
                  disabled={uploading}
                  style={{
                    padding: '12px 30px',
                    fontSize: '1rem',
                    borderRadius: '40px',
                    minWidth: '150px'
                  }}
                >
                  {uploading ? (
                    <><i className="fas fa-spinner fa-spin"></i> Changing...</>
                  ) : (
                    <><i className="fas fa-sync-alt"></i> Change Password</>
                  )}
                </button>
              </div>
            </form>
          )}
          
          {/* Account Info Footer */}
          <div className="profile-footer" style={{
            padding: '1rem 2rem',
            backgroundColor: '#f9f9f9',
            borderTop: '1px solid #eee',
            textAlign: 'center',
            fontSize: '0.8rem',
            color: '#666'
          }}>
            <p>
              <i className="fas fa-calendar-alt" style={{ marginRight: '5px' }}></i>
              Member since {new Date(user.createdAt).toLocaleDateString()}
            </p>
          </div>
        </div>
      </div>
      
      <style>{`
        .profile-form {
          transition: transform 0.3s ease, box-shadow 0.3s ease;
        }
        
        .profile-form:hover {
          transform: translateY(-5px);
          box-shadow: 0 25px 50px rgba(0,0,0,0.15);
        }
        
        .profile-tabs button:hover {
          background-color: rgba(74,20,140,0.05);
        }
        
        input:focus, textarea:focus {
          outline: none;
        }
        
        @media (max-width: 768px) {
          .profile-form {
            margin: 0 15px;
          }
          
          .profile-header {
            padding: 1.5rem;
          }
          
          .profile-avatar img {
            width: 80px;
            height: 80px;
          }
          
          .profile-tabs button {
            font-size: 0.85rem;
          }
        }
      `}</style>
    </main>
  );
};

export default ProfilePage;