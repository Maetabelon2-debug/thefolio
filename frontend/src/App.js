// frontend/src/App.js
import { Routes, Route, useLocation } from 'react-router-dom';
import { useAuth } from './context/AuthContext';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import ProtectedRoute from './components/ProtectedRoute';
import SplashPage from './pages/SplashPage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import HomePage from './pages/HomePage';
import AboutPage from './pages/AboutPage';
import PostPage from './pages/PostPage';
import ProfilePage from './pages/ProfilePage';
import CreatePostPage from './pages/CreatePostPage';
import AdminPage from './pages/AdminPage';
import ContactPage from './pages/ContactPage';
import EditPostPage from './pages/EditPostPage';

function App() {
  const { user, loading } = useAuth();
  const location = useLocation();
  
  // Check if current route is splash page
  const isSplashPage = location.pathname === '/';

  console.log('App - User:', user);
  console.log('App - Loading:', loading);
  console.log('App - Path:', location.pathname);

  if (loading) {
    return (
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
      }}>
        <div style={{
          width: '50px',
          height: '50px',
          border: '3px solid white',
          borderTop: '3px solid transparent',
          borderRadius: '50%',
          animation: 'spin 1s linear infinite'
        }}></div>
      </div>
    );
  }

  return (
    <>
      {/* Only show Navbar if NOT on splash page */}
      {!isSplashPage && <Navbar />}
      
      <Routes>
        {/* Splash Page - First page visitors see (No Navbar/Footer) */}
        <Route path="/" element={<SplashPage />} />
        
        {/* Public routes - accessible to everyone */}
        <Route path="/home" element={<HomePage />} />
        <Route path="/about" element={<AboutPage />} />
        <Route path="/contact" element={<ContactPage />} />
        <Route path="/posts/:id" element={<PostPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        
        {/* Protected routes - require login */}
        <Route path="/profile" element={
          <ProtectedRoute>
            <ProfilePage />
          </ProtectedRoute>
        } />
        <Route path="/create-post" element={
          <ProtectedRoute>
            <CreatePostPage />
          </ProtectedRoute>
        } />
        <Route path="/edit-post/:id" element={
          <ProtectedRoute>
            <EditPostPage />
          </ProtectedRoute>
        } />
        
        {/* Admin only route */}
        <Route path="/admin" element={
          <ProtectedRoute role="admin">
            <AdminPage />
          </ProtectedRoute>
        } />
      </Routes>
      
      {/* Only show Footer if NOT on splash page */}
      {!isSplashPage && <Footer />}
    </>
  );
}

export default App;