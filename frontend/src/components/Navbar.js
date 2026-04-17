// frontend/src/components/Navbar.js
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';  // ← ADD THIS

const Navbar = () => {
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();  // ← ADD THIS
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const profilePicUrl = user?.profilePic 
    ? `http://localhost:5000/uploads/${user.profilePic}` 
    : null;

  return (
    <header className="site-header">
      <div className="container">
        <div className="header-content">
          <Link to="/home" className="logo">
            <i className="fas fa-music logo-icon"></i>
            <span className="logo-text">VocalVibes</span>
          </Link>
          
          <nav className="main-nav">
            <ul>
              <li><NavLink to="/home">Home</NavLink></li>
              <li><NavLink to="/about">About</NavLink></li>
              <li><NavLink to="/contact">Contact</NavLink></li>
              
              {user ? (
                <>
                  <li><NavLink to="/create-post">Write Post</NavLink></li>
                  
                  {user.role === 'admin' && (
                    <li><NavLink to="/admin">Admin</NavLink></li>
                  )}
                  
                  <li>
                    <NavLink to="/profile" className="profile-link" style={{display: 'flex', alignItems: 'center', gap: '8px'}}>
                      {profilePicUrl ? (
                        <img 
                          src={profilePicUrl} 
                          alt={user.name}
                          style={{
                            width: '32px',
                            height: '32px',
                            borderRadius: '50%',
                            objectFit: 'cover',
                            border: '2px solid var(--secondary)'
                          }}
                        />
                      ) : (
                        <i className="fas fa-user" style={{fontSize: '1.2rem'}}></i>
                      )}
                      <span>Profile</span>
                    </NavLink>
                  </li>
                  
                  <li>
                    <button 
                      onClick={handleLogout} 
                      className="btn" 
                      style={{
                        padding: '0.5rem 1rem', 
                        marginLeft: '0.5rem',
                        backgroundColor: '#f44336',
                        color: 'white'
                      }}
                    >
                      <i className="fas fa-sign-out-alt"></i> Logout
                    </button>
                  </li>
                </>
              ) : (
                <>
                  <li><NavLink to="/login">Login</NavLink></li>
                  <li><NavLink to="/register">Register</NavLink></li>
                </>
              )}
              
              {/* 🌙☀️ THEME TOGGLE BUTTON - ADD THIS */}
              <li>
                <button
                  onClick={toggleTheme}
                  className="theme-toggle-btn"
                  style={{
                    background: 'none',
                    border: 'none',
                    cursor: 'pointer',
                    fontSize: '1.3rem',
                    padding: '0.5rem',
                    borderRadius: '50%',
                    width: '40px',
                    height: '40px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    transition: 'all 0.3s ease',
                    color: 'white',
                    backgroundColor: 'rgba(255,255,255,0.1)'
                  }}
                  onMouseEnter={(e) => {
                    e.target.style.backgroundColor = 'rgba(255,255,255,0.3)';
                    e.target.style.transform = 'scale(1.1)';
                  }}
                  onMouseLeave={(e) => {
                    e.target.style.backgroundColor = 'rgba(255,255,255,0.1)';
                    e.target.style.transform = 'scale(1)';
                  }}
                  title={theme === 'light' ? 'Switch to Dark Mode' : 'Switch to Light Mode'}
                >
                  {theme === 'light' ? (
                    <i className="fas fa-moon"></i>
                  ) : (
                    <i className="fas fa-sun"></i>
                  )}
                </button>
              </li>
            </ul>
          </nav>
        </div>
      </div>
    </header>
  );
};

export default Navbar;