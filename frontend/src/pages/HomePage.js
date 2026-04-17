// frontend/src/pages/HomePage.js
import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import API from '../api/axios';

const HomePage = () => {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedPost, setSelectedPost] = useState(null);
  const [showCommentModal, setShowCommentModal] = useState(false);
  const [newComment, setNewComment] = useState('');
  const [comments, setComments] = useState({});
  const [showShareModal, setShowShareModal] = useState(false);
  const [sharePost, setSharePost] = useState(null);
  const [copied, setCopied] = useState(false);
  const [reactions, setReactions] = useState({});
  const [editingPost, setEditingPost] = useState(null);
  const [editTitle, setEditTitle] = useState('');
  const [editBody, setEditBody] = useState('');
  const [editImage, setEditImage] = useState(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [replyingTo, setReplyingTo] = useState(null);
  const [replyText, setReplyText] = useState('');
  const { user } = useAuth();
  const navigate = useNavigate();

  // Emoji reactions options
  const emojiReactions = [
    { emoji: '👍', name: 'like', label: 'Like' },
    { emoji: '❤️', name: 'love', label: 'Love' },
    { emoji: '😂', name: 'laugh', label: 'Laugh' },
    { emoji: '😮', name: 'wow', label: 'Wow' },
    { emoji: '😢', name: 'sad', label: 'Sad' },
    { emoji: '😡', name: 'angry', label: 'Angry' }
  ];

  useEffect(() => {
    fetchPosts();
  }, []);

  const fetchPosts = async () => {
    try {
      const { data } = await API.get('/posts');
      setPosts(data);
      data.forEach(post => {
        fetchReactions(post._id);
        fetchComments(post._id);
      });
    } catch (err) {
      console.error('Error fetching posts:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchReactions = async (postId) => {
    try {
      const { data } = await API.get(`/posts/${postId}/reactions`).catch(() => ({ data: {} }));
      setReactions(prev => ({ ...prev, [postId]: data }));
    } catch (err) {
      console.error('Error fetching reactions:', err);
    }
  };

  const fetchComments = async (postId) => {
    try {
      const { data } = await API.get(`/comments/${postId}`);
      setComments(prev => ({ ...prev, [postId]: data }));
    } catch (err) {
      console.error('Error fetching comments:', err);
    }
  };

  const handleReaction = async (postId, reactionType) => {
    if (!user) {
      alert('Please login to react to posts');
      return;
    }

    try {
      const { data } = await API.post(`/posts/${postId}/react`, { reaction: reactionType });
      setReactions(prev => ({ ...prev, [postId]: data }));
    } catch (err) {
      console.error('Error adding reaction:', err);
      alert('Failed to add reaction');
    }
  };

  const handleAddComment = async (postId, parentCommentId = null) => {
    if (!user) {
      alert('Please login to comment');
      return;
    }

    const commentContent = parentCommentId ? replyText : newComment;
    if (!commentContent.trim()) {
      alert('Please enter a comment');
      return;
    }

    try {
      const { data } = await API.post(`/comments/${postId}`, { 
        body: commentContent,
        parentComment: parentCommentId 
      });
      
      // Refresh comments to show the new reply properly
      await fetchComments(postId);
      
      if (parentCommentId) {
        setReplyText('');
        setReplyingTo(null);
        alert('Reply added successfully!');
      } else {
        setNewComment('');
        alert('Comment added successfully!');
      }
    } catch (err) {
      console.error('Error adding comment:', err);
      alert('Failed to add comment');
    }
  };

  const handleDeleteComment = async (commentId, postId) => {
    if (!window.confirm('Delete this comment?')) return;

    try {
      await API.delete(`/comments/${commentId}`);
      await fetchComments(postId);
      alert('Comment deleted');
    } catch (err) {
      console.error('Error deleting comment:', err);
      alert('Failed to delete comment');
    }
  };

  const handleEditPost = async (e) => {
    e.preventDefault();
    if (!editTitle.trim() || !editBody.trim()) {
      alert('Please fill in all fields');
      return;
    }

    try {
      const formData = new FormData();
      formData.append('title', editTitle);
      formData.append('body', editBody);
      if (editImage) {
        formData.append('image', editImage);
      }

      const { data } = await API.put(`/posts/${editingPost._id}`, formData);
      setPosts(posts.map(post => post._id === editingPost._id ? data : post));
      setShowEditModal(false);
      setEditingPost(null);
      setEditTitle('');
      setEditBody('');
      setEditImage(null);
      alert('Post updated successfully!');
    } catch (err) {
      console.error('Error editing post:', err);
      alert('Failed to update post');
    }
  };

  const handleDeletePost = async (postId) => {
    if (!window.confirm('Are you sure you want to delete this post? This action cannot be undone.')) return;

    try {
      await API.delete(`/posts/${postId}`);
      setPosts(posts.filter(post => post._id !== postId));
      alert('Post deleted successfully');
    } catch (err) {
      console.error('Error deleting post:', err);
      alert('Failed to delete post');
    }
  };

  const handleShare = (post) => {
    setSharePost(post);
    setShowShareModal(true);
  };

  const copyToClipboard = () => {
    const postUrl = `${window.location.origin}/posts/${sharePost._id}`;
    navigator.clipboard.writeText(postUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const shareOnFacebook = () => {
    const url = `${window.location.origin}/posts/${sharePost._id}`;
    window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`, '_blank');
  };

  const shareOnTwitter = () => {
    const url = `${window.location.origin}/posts/${sharePost._id}`;
    const text = encodeURIComponent(`Check out this post: ${sharePost.title}`);
    window.open(`https://twitter.com/intent/tweet?text=${text}&url=${encodeURIComponent(url)}`, '_blank');
  };

  const shareOnWhatsApp = () => {
    const url = `${window.location.origin}/posts/${sharePost._id}`;
    window.open(`https://wa.me/?text=${encodeURIComponent(`${sharePost.title}\n${url}`)}`, '_blank');
  };

  const getReactionCount = (reactionsObj, type) => {
    if (!reactionsObj || !reactionsObj[type]) return 0;
    return reactionsObj[type];
  };

  const getTotalReactions = (reactionsObj) => {
    if (!reactionsObj) return 0;
    return Object.values(reactionsObj).reduce((a, b) => a + b, 0);
  };

  const canEditPost = (post) => {
    if (!user) return false;
    return user._id === post.author?._id || user.role === 'admin';
  };

  // Function to render comments with nested replies
  const renderComment = (comment, postId, depth = 0) => {
    const childReplies = comments[postId]?.filter(c => c.parentComment === comment._id) || [];
    
    return (
      <div key={comment._id} style={{
        marginBottom: '1rem',
        marginLeft: depth > 0 ? '2rem' : '0',
        padding: '1rem',
        backgroundColor: depth > 0 ? '#f5f5f5' : '#f9f9f9',
        borderRadius: '8px',
        borderLeft: depth > 0 ? '3px solid var(--secondary)' : 'none'
      }}>
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '0.5rem',
          flexWrap: 'wrap'
        }}>
          <div>
            <strong>{comment.author?.name}</strong>
            <span style={{ fontSize: '0.8rem', color: '#666', marginLeft: '0.5rem' }}>
              {new Date(comment.createdAt).toLocaleDateString()}
            </span>
            {depth > 0 && (
              <span style={{ 
                fontSize: '0.7rem', 
                color: 'var(--secondary)', 
                marginLeft: '0.5rem',
                backgroundColor: 'rgba(255,64,129,0.1)',
                padding: '2px 6px',
                borderRadius: '10px'
              }}>
                Reply
              </span>
            )}
          </div>
          {(user?._id === comment.author?._id || user?.role === 'admin') && (
            <button
              onClick={() => handleDeleteComment(comment._id, postId)}
              style={{
                background: 'none',
                border: 'none',
                color: '#f44336',
                cursor: 'pointer',
                fontSize: '0.85rem'
              }}
            >
              Delete
            </button>
          )}
        </div>
        
        <p style={{ margin: '0 0 0.5rem 0', whiteSpace: 'pre-wrap' }}>{comment.body}</p>
        
        {/* Reply Button - Only show if user is logged in */}
        {user && (
          <button
            onClick={() => setReplyingTo(replyingTo === comment._id ? null : comment._id)}
            style={{
              background: 'none',
              border: 'none',
              color: 'var(--accent)',
              cursor: 'pointer',
              fontSize: '0.8rem',
              padding: '0',
              marginTop: '0.5rem'
            }}
          >
            {replyingTo === comment._id ? 'Cancel Reply' : '↩️ Reply'}
          </button>
        )}
        
        {/* Reply Input Box */}
        {replyingTo === comment._id && (
          <div style={{ marginTop: '0.8rem', display: 'flex', gap: '0.5rem', alignItems: 'flex-start' }}>
            <textarea
              value={replyText}
              onChange={(e) => setReplyText(e.target.value)}
              placeholder={`Reply to ${comment.author?.name}...`}
              rows={2}
              style={{
                flex: 1,
                padding: '0.5rem',
                border: '1px solid #ddd',
                borderRadius: '8px',
                fontFamily: 'inherit',
                fontSize: '0.9rem'
              }}
            />
            <button
              onClick={() => handleAddComment(postId, comment._id)}
              className="btn"
              style={{ padding: '0.5rem 1rem', fontSize: '0.85rem' }}
            >
              Post
            </button>
          </div>
        )}
        
        {/* Render child replies recursively */}
        {childReplies.map(child => renderComment(child, postId, depth + 1))}
      </div>
    );
  };

  return (
    <main>
      {/* Hero Section */}
      <section className="hero">
        <div className="container">
          <div className="hero-content">
            <h1>Discover the Joy of Singing</h1>
            <p className="hero-description">
              Welcome to my personal portfolio dedicated to the art and passion of vocal expression. 
              Explore techniques, resources, and inspiration for singers of all levels.
            </p>
            <Link to="/about" className="btn">Explore My Journey</Link>
          </div>
          <div className="hero-image">
            <img 
              src="https://images.unsplash.com/photo-1546708770-589dab7b22c7?fm=jpg&q=60&w=3000&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8OHx8Y29uY2VydCUyMGZhbnN8ZW58MHx8MHx8fDA=" 
              alt="A person singing passionately into a microphone with stage lights"
              style={{ width: '100%', borderRadius: '10px' }}
            />
          </div>
        </div>
      </section>

      {/* Main Content */}
      <div className="container">
        {/* Key Highlights Section */}
        <section className="section">
          <h2>Why I Love Singing</h2>
          <ul className="highlights-list">
            <li>
              <i className="fas fa-heart"></i> 
              <strong>Emotional Expression:</strong> Singing allows me to convey emotions that words alone cannot express. 
              It's a powerful form of communication that transcends language barriers and connects directly with the human heart.
            </li>
            <li>
              <i className="fas fa-users"></i> 
              <strong>Connection:</strong> Music creates powerful connections between people across cultures, generations, 
              and backgrounds. When people sing together, they form bonds that go beyond ordinary conversation.
            </li>
            <li>
              <i className="fas fa-brain"></i> 
              <strong>Mental Benefits:</strong> Singing reduces stress, improves memory and concentration, and releases 
              endorphins that boost mood. Studies show it can even help with conditions like depression and anxiety.
            </li>
            <li>
              <i className="fas fa-lungs"></i> 
              <strong>Physical Health:</strong> Improves breathing, posture, and even immune system function. Proper 
              singing technique strengthens diaphragm muscles and increases lung capacity.
            </li>
            <li>
              <i className="fas fa-star"></i> 
              <strong>Creative Outlet:</strong> Every performance is an opportunity for artistic creativity and personal 
              interpretation. No two singers perform a song exactly the same way, which makes each rendition unique.
            </li>
          </ul>
        </section>

        {/* Preview Sections - Portfolio Cards */}
        <section className="section">
          <h2>Explore My Singing Portfolio</h2>
          <div className="preview-grid">
            <div className="card">
              <img 
                src="https://img.freepik.com/premium-photo/highresolution-shot-choir-full-performance-capturing-singers-midsong-with-open-mouths-expressive-gestures-against-dramatic-background_1229213-52929.jpg" 
                alt="Singer with expressive gestures"
              />
              <div className="card-content">
                <h3>My Singing Journey</h3>
                <p>Learn about my personal path with vocal music, from childhood choir to solo performances...</p>
                <Link to="/about" className="btn">Read My Story</Link>
              </div>
            </div>
            
            <div className="card">
              <img 
                src="https://images.unsplash.com/photo-1507838153414-b4b713384a76?w=400&h=250&fit=crop" 
                alt="Vocal exercise"
              />
              <div className="card-content">
                <h3>Resources & Tools</h3>
                <p>Discover my curated list of essential resources for singers, from warm-up exercises to performance techniques.</p>
                <Link to="/contact" className="btn">View Resources</Link>
              </div>
            </div>
            
            <div className="card">
              <img 
                src="https://c.files.bbci.co.uk/822a/live/7fe57090-8ac8-11ef-942d-05f36e427c1d.jpg" 
                alt="Singer performing on stage"
              />
              <div className="card-content">
                <h3>Join the Community</h3>
                <p>Sign up for monthly vocal tips, sheet music recommendations, and exclusive performance insights.</p>
                <Link to="/register" className="btn">Register Now</Link>
              </div>
            </div>
          </div>
        </section>

        {/* Latest Posts Section */}
        <section className="section">
          <h2>Latest Posts</h2>
          {loading ? (
            <div style={{ textAlign: 'center', padding: '2rem' }}>
              <p>Loading posts...</p>
            </div>
          ) : posts.length === 0 ? (
            <div className="card" style={{ padding: '2rem', textAlign: 'center' }}>
              <p>No posts yet. Be the first to share something!</p>
              {!user && <p><Link to="/login">Login</Link> to create a post</p>}
            </div>
          ) : (
            <div className="posts-grid" style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))',
              gap: '2rem'
            }}>
              {posts.map(post => (
                <article key={post._id} className="card" style={{
                  display: 'flex',
                  flexDirection: 'column',
                  height: '100%',
                  transition: 'transform 0.3s ease, box-shadow 0.3s ease'
                }}>
                  {post.image && (
                    <img 
                      src={`http://localhost:5000/uploads/${post.image}`} 
                      alt={post.title}
                      style={{
                        width: '100%',
                        height: '200px',
                        objectFit: 'cover',
                        cursor: 'pointer'
                      }}
                      onClick={() => navigate(`/posts/${post._id}`)}
                    />
                  )}
                  <div className="card-content" style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                      <h3 style={{ flex: 1 }}>
                        <Link to={`/posts/${post._id}`} style={{ textDecoration: 'none', color: 'var(--primary)' }}>
                          {post.title}
                        </Link>
                      </h3>
                      {canEditPost(post) && (
                        <div style={{ display: 'flex', gap: '5px' }}>
                          <button
                            onClick={() => {
                              setEditingPost(post);
                              setEditTitle(post.title);
                              setEditBody(post.body);
                              setShowEditModal(true);
                            }}
                            style={{
                              background: 'none',
                              border: 'none',
                              cursor: 'pointer',
                              color: 'var(--accent)',
                              fontSize: '1rem'
                            }}
                            title="Edit Post"
                          >
                            ✏️
                          </button>
                          <button
                            onClick={() => handleDeletePost(post._id)}
                            style={{
                              background: 'none',
                              border: 'none',
                              cursor: 'pointer',
                              color: '#f44336',
                              fontSize: '1rem'
                            }}
                            title="Delete Post"
                          >
                            🗑️
                          </button>
                        </div>
                      )}
                    </div>
                    <p style={{ color: '#666', fontSize: '0.9rem', marginBottom: '0.5rem' }}>
                      By {post.author?.name || 'Anonymous'} • {new Date(post.createdAt).toLocaleDateString()}
                    </p>
                    <p style={{ marginBottom: '1rem' }}>
                      {post.body.substring(0, 120)}...
                    </p>
                    
                    {/* Reactions Section */}
                    <div style={{
                      marginTop: 'auto',
                      borderTop: '1px solid #eee',
                      paddingTop: '1rem'
                    }}>
                      <div style={{
                        display: 'flex',
                        flexWrap: 'wrap',
                        gap: '0.5rem',
                        marginBottom: '0.5rem'
                      }}>
                        {emojiReactions.map(reaction => (
                          <button
                            key={reaction.name}
                            onClick={() => handleReaction(post._id, reaction.name)}
                            style={{
                              display: 'flex',
                              alignItems: 'center',
                              gap: '4px',
                              padding: '4px 8px',
                              backgroundColor: 'transparent',
                              border: '1px solid #ddd',
                              borderRadius: '20px',
                              cursor: 'pointer',
                              transition: 'all 0.2s ease'
                            }}
                          >
                            <span style={{ fontSize: '1.1rem' }}>{reaction.emoji}</span>
                            <span style={{ fontSize: '0.85rem' }}>
                              {getReactionCount(reactions[post._id], reaction.name)}
                            </span>
                          </button>
                        ))}
                      </div>
                      
                      <div style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        flexWrap: 'wrap',
                        gap: '0.5rem',
                        marginBottom: '0.5rem'
                      }}>
                        <span style={{ fontSize: '0.85rem', color: '#666' }}>
                          {getTotalReactions(reactions[post._id])} reactions
                        </span>
                        <span style={{ fontSize: '0.85rem', color: '#666' }}>
                          💬 {comments[post._id]?.length || 0} comments
                        </span>
                      </div>
                      
                      {/* Action Buttons */}
                      <div style={{
                        display: 'flex',
                        gap: '1rem',
                        marginTop: '0.5rem',
                        borderTop: '1px solid #eee',
                        paddingTop: '0.5rem'
                      }}>
                        <button
                          onClick={() => {
                            setSelectedPost(post);
                            setShowCommentModal(true);
                            fetchComments(post._id);
                            setReplyingTo(null);
                            setReplyText('');
                          }}
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '5px',
                            background: 'none',
                            border: 'none',
                            cursor: 'pointer',
                            color: '#666',
                            padding: '5px 10px',
                            borderRadius: '5px',
                            transition: 'all 0.2s ease'
                          }}
                        >
                          💬 <span>Comment</span>
                        </button>
                        
                        <button
                          onClick={() => handleShare(post)}
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '5px',
                            background: 'none',
                            border: 'none',
                            cursor: 'pointer',
                            color: '#666',
                            padding: '5px 10px',
                            borderRadius: '5px'
                          }}
                        >
                          📤 <span>Share</span>
                        </button>
                        
                        <Link
                          to={`/posts/${post._id}`}
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '5px',
                            textDecoration: 'none',
                            color: '#666',
                            padding: '5px 10px',
                            borderRadius: '5px'
                          }}
                        >
                          👁️ <span>Read More</span>
                        </Link>
                      </div>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          )}
        </section>
      </div>

      {/* Edit Post Modal */}
      {showEditModal && editingPost && (
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
          overflowY: 'auto'
        }}>
          <div style={{
            backgroundColor: 'white',
            borderRadius: '10px',
            maxWidth: '600px',
            width: '90%',
            maxHeight: '80vh',
            overflowY: 'auto',
            padding: '2rem'
          }}>
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: '1.5rem'
            }}>
              <h2>Edit Post</h2>
              <button
                onClick={() => setShowEditModal(false)}
                style={{
                  background: 'none',
                  border: 'none',
                  fontSize: '1.5rem',
                  cursor: 'pointer'
                }}
              >
                ✕
              </button>
            </div>
            
            <form onSubmit={handleEditPost}>
              <div className="form-group">
                <label>Title</label>
                <input
                  type="text"
                  value={editTitle}
                  onChange={(e) => setEditTitle(e.target.value)}
                  required
                  className="music-input"
                  style={{ width: '100%', padding: '10px', borderRadius: '5px', border: '1px solid #ddd' }}
                />
              </div>
              
              <div className="form-group">
                <label>Content</label>
                <textarea
                  value={editBody}
                  onChange={(e) => setEditBody(e.target.value)}
                  required
                  rows={8}
                  className="music-input"
                  style={{ width: '100%', padding: '10px', borderRadius: '5px', border: '1px solid #ddd' }}
                />
              </div>
              
              {user?.role === 'admin' && (
                <div className="form-group">
                  <label>Change Image (Optional)</label>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => setEditImage(e.target.files[0])}
                    style={{ width: '100%' }}
                  />
                </div>
              )}
              
              <div className="form-submit" style={{ display: 'flex', gap: '1rem', marginTop: '1rem' }}>
                <button type="submit" className="btn">Save Changes</button>
                <button type="button" onClick={() => setShowEditModal(false)} className="btn" style={{ backgroundColor: '#999' }}>Cancel</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Comment Modal with Reply Functionality */}
      {showCommentModal && selectedPost && (
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
          overflowY: 'auto'
        }}>
          <div style={{
            backgroundColor: 'white',
            borderRadius: '10px',
            maxWidth: '700px',
            width: '90%',
            maxHeight: '80vh',
            overflowY: 'auto',
            margin: '20px'
          }}>
            <div style={{
              padding: '1.5rem',
              borderBottom: '1px solid #eee',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center'
            }}>
              <h3 style={{ margin: 0 }}>Comments on "{selectedPost.title}"</h3>
              <button
                onClick={() => {
                  setShowCommentModal(false);
                  setReplyingTo(null);
                  setReplyText('');
                }}
                style={{
                  background: 'none',
                  border: 'none',
                  fontSize: '1.5rem',
                  cursor: 'pointer'
                }}
              >
                ✕
              </button>
            </div>
            
            <div style={{ padding: '1.5rem' }}>
              {/* Add Comment Form */}
              {user ? (
                <div style={{
                  marginBottom: '2rem',
                  padding: '1rem',
                  backgroundColor: '#f9f9f9',
                  borderRadius: '8px'
                }}>
                  <textarea
                    value={newComment}
                    onChange={(e) => setNewComment(e.target.value)}
                    placeholder="Write a comment..."
                    rows={3}
                    style={{
                      width: '100%',
                      padding: '0.8rem',
                      border: '2px solid #ddd',
                      borderRadius: '5px',
                      fontFamily: 'inherit',
                      marginBottom: '0.5rem'
                    }}
                  />
                  <button
                    onClick={() => handleAddComment(selectedPost._id)}
                    className="btn"
                    style={{ padding: '0.5rem 1rem' }}
                  >
                    Post Comment
                  </button>
                </div>
              ) : (
                <div style={{
                  marginBottom: '2rem',
                  padding: '1rem',
                  backgroundColor: '#f9f9f9',
                  borderRadius: '8px',
                  textAlign: 'center'
                }}>
                  <p><Link to="/login">Login</Link> to join the conversation</p>
                </div>
              )}
              
              {/* Comments List with Reply Functionality */}
              <div className="comments-list">
                {!comments[selectedPost._id] || comments[selectedPost._id].filter(c => !c.parentComment).length === 0 ? (
                  <p style={{ textAlign: 'center', color: '#666' }}>No comments yet. Be the first to comment!</p>
                ) : (
                  comments[selectedPost._id]
                    .filter(comment => !comment.parentComment)
                    .map(comment => renderComment(comment, selectedPost._id))
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Share Modal */}
      {showShareModal && sharePost && (
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
          zIndex: 1000
        }}>
          <div style={{
            backgroundColor: 'white',
            borderRadius: '10px',
            maxWidth: '450px',
            width: '90%',
            padding: '1.5rem'
          }}>
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: '1rem'
            }}>
              <h3 style={{ margin: 0 }}>Share this post</h3>
              <button
                onClick={() => setShowShareModal(false)}
                style={{
                  background: 'none',
                  border: 'none',
                  fontSize: '1.5rem',
                  cursor: 'pointer'
                }}
              >
                ✕
              </button>
            </div>
            
            <p style={{ marginBottom: '1rem', color: '#666' }}>
              Share "{sharePost.title}" with your friends
            </p>
            
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(2, 1fr)',
              gap: '1rem',
              marginBottom: '1.5rem'
            }}>
              <button onClick={shareOnFacebook} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', padding: '10px', backgroundColor: '#1877f2', color: 'white', border: 'none', borderRadius: '5px', cursor: 'pointer' }}>
                <span>📘</span> Facebook
              </button>
              
              <button onClick={shareOnTwitter} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', padding: '10px', backgroundColor: '#1da1f2', color: 'white', border: 'none', borderRadius: '5px', cursor: 'pointer' }}>
                <span>🐦</span> Twitter
              </button>
              
              <button onClick={shareOnWhatsApp} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', padding: '10px', backgroundColor: '#25d366', color: 'white', border: 'none', borderRadius: '5px', cursor: 'pointer' }}>
                <span>💬</span> WhatsApp
              </button>
              
              <button onClick={copyToClipboard} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', padding: '10px', backgroundColor: '#666', color: 'white', border: 'none', borderRadius: '5px', cursor: 'pointer' }}>
                <span>🔗</span> Copy Link
              </button>
            </div>
            
            {copied && (
              <div style={{ textAlign: 'center', padding: '0.5rem', backgroundColor: '#4CAF50', color: 'white', borderRadius: '5px' }}>
                ✓ Link copied to clipboard!
              </div>
            )}
          </div>
        </div>
      )}
    </main>
  );
};

export default HomePage;