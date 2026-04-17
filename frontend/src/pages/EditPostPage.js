// frontend/src/pages/EditPostPage.js
import { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import API from '../api/axios';

const EditPostPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  
  const [post, setPost] = useState(null);
  const [title, setTitle] = useState('');
  const [body, setBody] = useState('');
  const [image, setImage] = useState(null);
  const [currentImage, setCurrentImage] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [imagePreview, setImagePreview] = useState('');

  const fetchPost = useCallback(async () => {
    try {
      setLoading(true);
      const { data } = await API.get(`/posts/${id}`);
      setPost(data);
      setTitle(data.title);
      setBody(data.body);
      setCurrentImage(data.image || '');
      if (data.image) {
        setImagePreview(`http://localhost:5000/uploads/${data.image}`);
      }
    } catch (err) {
      console.error('Error fetching post:', err);
      setError(err.response?.data?.message || 'Failed to load post');
    } finally {
      setLoading(false);
    }
  }, [id]);

  // Fetch post data on component mount
  useEffect(() => {
    fetchPost();
  }, [id, fetchPost]);

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImage(file);
      // Create preview URL
      const previewUrl = URL.createObjectURL(file);
      setImagePreview(previewUrl);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setSaving(true);

    // Validation
    if (!title.trim()) {
      setError('Please enter a title');
      setSaving(false);
      return;
    }
    if (!body.trim()) {
      setError('Please enter content');
      setSaving(false);
      return;
    }

    const formData = new FormData();
    formData.append('title', title);
    formData.append('body', body);
    if (image) {
      formData.append('image', image);
    }

    try {
      const { data } = await API.put(`/posts/${id}`, formData);
      setSuccess('Post updated successfully!');
      // Update post data
      setPost(data);
      setCurrentImage(data.image || '');
      if (data.image && !image) {
        setImagePreview(`http://localhost:5000/uploads/${data.image}`);
      }
      // Scroll to top to show success message
      window.scrollTo(0, 0);
      // Redirect after 2 seconds
      setTimeout(() => {
        navigate(`/posts/${id}`);
      }, 2000);
    } catch (err) {
      console.error('Error updating post:', err);
      setError(err.response?.data?.message || 'Failed to update post');
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    if (window.confirm('Are you sure you want to cancel? Any unsaved changes will be lost.')) {
      navigate(`/posts/${id}`);
    }
  };

  // Check if user is authorized to edit
  const canEdit = () => {
    if (!user) return false;
    if (user.role === 'admin') return true;
    if (post && post.author?._id === user._id) return true;
    return false;
  };

  if (loading) {
    return (
      <main className="container">
        <div className="page-header">
          <h1>Edit Post</h1>
          <p>Loading post data...</p>
        </div>
        <div style={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          minHeight: '300px'
        }}>
          <div className="loading-spinner">
            <i className="fas fa-spinner fa-spin" style={{ fontSize: '2rem', color: 'var(--primary)' }}></i>
          </div>
        </div>
      </main>
    );
  }

  if (!post) {
    return (
      <main className="container">
        <div className="page-header">
          <h1>Post Not Found</h1>
          <p>The post you're trying to edit doesn't exist.</p>
        </div>
        <div style={{ textAlign: 'center' }}>
          <Link to="/home" className="btn">Back to Home</Link>
        </div>
      </main>
    );
  }

  if (!canEdit()) {
    return (
      <main className="container">
        <div className="page-header">
          <h1>Access Denied</h1>
          <p>You don't have permission to edit this post.</p>
        </div>
        <div style={{ textAlign: 'center' }}>
          <Link to="/home" className="btn">Back to Home</Link>
        </div>
      </main>
    );
  }

  return (
    <main className="container">
      <div className="page-header">
        <h1>Edit Post</h1>
        <p>Make changes to your post and save them</p>
      </div>
      
      <div className="edit-post-container" style={{
        maxWidth: '900px',
        margin: '0 auto'
      }}>
        {/* Success Message */}
        {success && (
          <div className="notification success" style={{
            backgroundColor: '#4CAF50',
            color: 'white',
            padding: '15px',
            borderRadius: '10px',
            marginBottom: '1.5rem',
            display: 'flex',
            alignItems: 'center',
            gap: '10px'
          }}>
            <i className="fas fa-check-circle" style={{ fontSize: '1.2rem' }}></i>
            <span>{success}</span>
          </div>
        )}
        
        {/* Error Message */}
        {error && (
          <div className="notification error" style={{
            backgroundColor: '#f44336',
            color: 'white',
            padding: '15px',
            borderRadius: '10px',
            marginBottom: '1.5rem',
            display: 'flex',
            alignItems: 'center',
            gap: '10px'
          }}>
            <i className="fas fa-exclamation-circle" style={{ fontSize: '1.2rem' }}></i>
            <span>{error}</span>
          </div>
        )}
        
        {/* Edit Form */}
        <form onSubmit={handleSubmit} style={{
          backgroundColor: 'white',
          borderRadius: '20px',
          padding: '2rem',
          boxShadow: '0 10px 30px rgba(0,0,0,0.1)'
        }}>
          {/* Post Info Banner */}
          <div style={{
            backgroundColor: '#f5f5f5',
            padding: '1rem',
            borderRadius: '10px',
            marginBottom: '1.5rem',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: '10px'
          }}>
            <div>
              <span style={{ color: '#666', fontSize: '0.85rem' }}>
                <i className="fas fa-calendar-alt" style={{ marginRight: '5px' }}></i>
                Created: {new Date(post.createdAt).toLocaleDateString()}
              </span>
            </div>
            <div>
              <span style={{ color: '#666', fontSize: '0.85rem' }}>
                <i className="fas fa-user" style={{ marginRight: '5px' }}></i>
                Author: {post.author?.name}
              </span>
            </div>
            {post.status && (
              <div>
                <span style={{
                  backgroundColor: post.status === 'published' ? '#4CAF50' : '#f44336',
                  color: 'white',
                  padding: '4px 10px',
                  borderRadius: '20px',
                  fontSize: '0.75rem'
                }}>
                  {post.status}
                </span>
              </div>
            )}
          </div>
          
          {/* Title Field */}
          <div className="form-group" style={{ marginBottom: '1.5rem' }}>
            <label style={{
              display: 'block',
              marginBottom: '0.5rem',
              fontWeight: '600',
              color: 'var(--primary)',
              fontSize: '1rem'
            }}>
              <i className="fas fa-heading" style={{ marginRight: '8px', color: 'var(--secondary)' }}></i>
              Post Title *
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
              placeholder="Enter an engaging title..."
              style={{
                width: '100%',
                padding: '14px 16px',
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
          
          {/* Content Field */}
          <div className="form-group" style={{ marginBottom: '1.5rem' }}>
            <label style={{
              display: 'block',
              marginBottom: '0.5rem',
              fontWeight: '600',
              color: 'var(--primary)',
              fontSize: '1rem'
            }}>
              <i className="fas fa-paragraph" style={{ marginRight: '8px', color: 'var(--secondary)' }}></i>
              Content *
            </label>
            <textarea
              value={body}
              onChange={(e) => setBody(e.target.value)}
              required
              rows={12}
              placeholder="Write your post content here..."
              style={{
                width: '100%',
                padding: '14px 16px',
                border: '2px solid #e0e0e0',
                borderRadius: '12px',
                fontSize: '1rem',
                fontFamily: 'inherit',
                resize: 'vertical',
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
          
          {/* Image Section - Admin only or if user has image permission */}
          {(user?.role === 'admin' || currentImage) && (
            <div className="form-group" style={{ marginBottom: '1.5rem' }}>
              <label style={{
                display: 'block',
                marginBottom: '0.5rem',
                fontWeight: '600',
                color: 'var(--primary)',
                fontSize: '1rem'
              }}>
                <i className="fas fa-image" style={{ marginRight: '8px', color: 'var(--secondary)' }}></i>
                {user?.role === 'admin' ? 'Cover Image (Admin Only)' : 'Current Cover Image'}
              </label>
              
              {/* Current Image Preview */}
              {imagePreview && (
                <div style={{
                  marginBottom: '1rem',
                  padding: '1rem',
                  backgroundColor: '#f9f9f9',
                  borderRadius: '12px',
                  textAlign: 'center'
                }}>
                  <p style={{ fontSize: '0.85rem', color: '#666', marginBottom: '0.5rem' }}>
                    <i className="fas fa-eye"></i> Current Image Preview:
                  </p>
                  <img
                    src={imagePreview}
                    alt="Current post cover"
                    style={{
                      maxWidth: '100%',
                      maxHeight: '250px',
                      borderRadius: '10px',
                      objectFit: 'cover',
                      boxShadow: '0 5px 15px rgba(0,0,0,0.1)'
                    }}
                  />
                  {currentImage && !image && (
                    <p style={{ fontSize: '0.75rem', color: '#888', marginTop: '0.5rem' }}>
                      Current file: {currentImage}
                    </p>
                  )}
                </div>
              )}
              
              {/* Image Upload - Admin only */}
              {user?.role === 'admin' && (
                <div>
                  <input
                    type="file"
                    id="image"
                    accept="image/*"
                    onChange={handleImageChange}
                    style={{
                      width: '100%',
                      padding: '10px',
                      border: '2px dashed #e0e0e0',
                      borderRadius: '10px',
                      cursor: 'pointer',
                      backgroundColor: '#fafafa'
                    }}
                  />
                  {image && (
                    <p style={{
                      fontSize: '0.85rem',
                      color: 'var(--accent)',
                      marginTop: '0.5rem'
                    }}>
                      <i className="fas fa-check-circle"></i> New image selected: {image.name}
                    </p>
                  )}
                  <small className="form-note" style={{
                    display: 'block',
                    marginTop: '0.5rem',
                    color: '#666',
                    fontSize: '0.8rem'
                  }}>
                    Upload a new cover image (max 5MB, JPG/PNG/GIF/WEBP). Leave empty to keep current image.
                  </small>
                </div>
              )}
            </div>
          )}
          
          {/* Action Buttons */}
          <div className="form-actions" style={{
            display: 'flex',
            gap: '1rem',
            marginTop: '2rem',
            flexWrap: 'wrap'
          }}>
            <button
              type="submit"
              className="btn"
              disabled={saving}
              style={{
                flex: 1,
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
                cursor: saving ? 'not-allowed' : 'pointer',
                opacity: saving ? 0.7 : 1
              }}
            >
              {saving ? (
                <><i className="fas fa-spinner fa-spin"></i> Saving Changes...</>
              ) : (
                <><i className="fas fa-save"></i> Save Changes</>
              )}
            </button>
            
            <button
              type="button"
              onClick={handleCancel}
              style={{
                flex: 1,
                padding: '14px',
                fontSize: '1rem',
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
              <i className="fas fa-times"></i> Cancel
            </button>
          </div>
        </form>
        
        {/* Delete Section - For authors and admins */}
        <div style={{
          marginTop: '2rem',
          padding: '1.5rem',
          backgroundColor: '#fff5f5',
          borderRadius: '15px',
          border: '1px solid #ffcdd2',
          textAlign: 'center'
        }}>
          <h3 style={{ color: '#f44336', marginBottom: '0.5rem' }}>
            <i className="fas fa-exclamation-triangle"></i> Danger Zone
          </h3>
          <p style={{ color: '#666', fontSize: '0.9rem', marginBottom: '1rem' }}>
            Once you delete a post, there is no going back. Please be certain.
          </p>
          <button
            onClick={async () => {
              if (window.confirm('Are you ABSOLUTELY sure you want to delete this post? This action cannot be undone.')) {
                try {
                  await API.delete(`/posts/${id}`);
                  navigate('/home');
                } catch (err) {
                  setError(err.response?.data?.message || 'Failed to delete post');
                }
              }
            }}
            style={{
              padding: '12px 24px',
              backgroundColor: '#f44336',
              color: 'white',
              border: 'none',
              borderRadius: '40px',
              cursor: 'pointer',
              fontSize: '0.9rem',
              transition: 'all 0.3s ease'
            }}
            onMouseEnter={(e) => e.target.style.backgroundColor = '#d32f2f'}
            onMouseLeave={(e) => e.target.style.backgroundColor = '#f44336'}
          >
            <i className="fas fa-trash-alt"></i> Delete Post Permanently
          </button>
        </div>
      </div>
      
      <style>{`
        .edit-post-container {
          animation: fadeIn 0.5s ease;
        }
        
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        @media (max-width: 768px) {
          .edit-post-container form {
            padding: 1.5rem;
          }
          
          .form-actions {
            flex-direction: column;
          }
        }
      `}</style>
    </main>
  );
};

export default EditPostPage;