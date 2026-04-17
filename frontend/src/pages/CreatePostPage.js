// frontend/src/pages/CreatePostPage.js
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import API from '../api/axios';  // ← MUST use this API instance, not axios directly

const CreatePostPage = () => {
  const [title, setTitle] = useState('');
  const [body, setBody] = useState('');
  const [image, setImage] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { user } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    
    // Debug: Check if user is logged in
    console.log('Current user:', user);
    console.log('Token exists:', !!localStorage.getItem('token'));
    
    const fd = new FormData();
    fd.append('title', title);
    fd.append('body', body);
    if (image) fd.append('image', image);
    
    try {
      // Using API instance which has the token interceptor
      const { data } = await API.post('/posts', fd);
      console.log('Post created:', data);
      navigate(`/posts/${data._id}`);
    } catch (err) {
      console.error('Error creating post:', err);
      console.error('Error response:', err.response);
      setError(err.response?.data?.message || 'Failed to publish post');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container">
      <div className="page-header">
        <h1>Write a New Post</h1>
        <p>Share your thoughts with the world</p>
      </div>
      
      <div className="form-container" style={{ maxWidth: '800px', margin: '0 auto' }}>
        {error && (
          <div className="notification error" style={{ marginBottom: '1rem' }}>
            {error}
          </div>
        )}
        
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="title">Post Title</label>
            <input
              type="text"
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
              placeholder="Enter an engaging title..."
              style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '2px solid #ddd' }}
            />
          </div>
          
          <div className="form-group">
            <label htmlFor="body">Content</label>
            <textarea
              id="body"
              value={body}
              onChange={(e) => setBody(e.target.value)}
              required
              rows={12}
              placeholder="Write your post content here..."
              style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '2px solid #ddd' }}
            />
          </div>
          
          {user?.role === 'admin' && (
            <div className="form-group">
              <label htmlFor="image">Cover Image (Admin only)</label>
              <input
                type="file"
                id="image"
                accept="image/*"
                onChange={(e) => setImage(e.target.files[0])}
              />
              <small className="form-note">Upload an image to accompany your post (max 5MB)</small>
            </div>
          )}
          
          <div className="form-submit">
            <button type="submit" className="btn" disabled={loading}>
              {loading ? 'Publishing...' : 'Publish Post'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreatePostPage;