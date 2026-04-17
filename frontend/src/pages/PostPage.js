// frontend/src/pages/PostPage.js
import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import API from '../api/axios';

const PostPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  
  const [post, setPost] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState('');
  const [commentLoading, setCommentLoading] = useState(false);
  const [reactions, setReactions] = useState({});
  const [userReaction, setUserReaction] = useState(null);
  const [showShareModal, setShowShareModal] = useState(false);
  const [copied, setCopied] = useState(false);
  const [replyingTo, setReplyingTo] = useState(null);
  const [replyText, setReplyText] = useState('');
  const [deleting, setDeleting] = useState(false);

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
    fetchPost();
    fetchComments();
    fetchReactions();
  }, [id]);

  const fetchPost = async () => {
    try {
      setLoading(true);
      const { data } = await API.get(`/posts/${id}`);
      setPost(data);
    } catch (err) {
      console.error('Error fetching post:', err);
      setError('Post not found or has been removed');
    } finally {
      setLoading(false);
    }
  };

  const fetchComments = async () => {
    try {
      const { data } = await API.get(`/comments/${id}`);
      setComments(data);
    } catch (err) {
      console.error('Error fetching comments:', err);
    }
  };

  const fetchReactions = async () => {
    try {
      const { data } = await API.get(`/posts/${id}/reactions`);
      setReactions(data);
    } catch (err) {
      console.error('Error fetching reactions:', err);
    }
  };

  const handleReaction = async (reactionType) => {
    if (!user) {
      alert('Please login to react to posts');
      return;
    }

    try {
      const { data } = await API.post(`/posts/${id}/react`, { reaction: reactionType });
      setReactions(data);
      setUserReaction(reactionType);
    } catch (err) {
      console.error('Error adding reaction:', err);
      alert('Failed to add reaction');
    }
  };

  const handleAddComment = async (parentCommentId = null) => {
    if (!user) {
      alert('Please login to comment');
      return;
    }

    const commentContent = parentCommentId ? replyText : newComment;
    if (!commentContent.trim()) {
      alert('Please enter a comment');
      return;
    }

    setCommentLoading(true);
    try {
      const payload = { body: commentContent };
      if (parentCommentId) {
        payload.parentComment = parentCommentId;
      }
      
      await API.post(`/comments/${id}`, payload);
      await fetchComments();
      
      if (parentCommentId) {
        setReplyText('');
        setReplyingTo(null);
      } else {
        setNewComment('');
      }
    } catch (err) {
      console.error('Error adding comment:', err);
      alert('Failed to add comment');
    } finally {
      setCommentLoading(false);
    }
  };

  const handleDeleteComment = async (commentId) => {
    if (!window.confirm('Are you sure you want to delete this comment?')) return;

    try {
      await API.delete(`/comments/${commentId}`);
      await fetchComments();
      alert('Comment deleted successfully');
    } catch (err) {
      console.error('Error deleting comment:', err);
      alert('Failed to delete comment');
    }
  };

  const handleDeletePost = async () => {
    if (!window.confirm('⚠️ WARNING: Are you sure you want to delete this post? This action cannot be undone.')) return;

    setDeleting(true);
    try {
      await API.delete(`/posts/${id}`);
      alert('Post deleted successfully');
      navigate('/home');
    } catch (err) {
      console.error('Error deleting post:', err);
      alert('Failed to delete post');
      setDeleting(false);
    }
  };

  const handleShare = () => {
    setShowShareModal(true);
  };

  const copyToClipboard = () => {
    const postUrl = `${window.location.origin}/posts/${id}`;
    navigator.clipboard.writeText(postUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const shareOnFacebook = () => {
    const url = `${window.location.origin}/posts/${id}`;
    window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`, '_blank');
  };

  const shareOnTwitter = () => {
    const url = `${window.location.origin}/posts/${id}`;
    const text = encodeURIComponent(`Check out this post: ${post?.title}`);
    window.open(`https://twitter.com/intent/tweet?text=${text}&url=${encodeURIComponent(url)}`, '_blank');
  };

  const shareOnWhatsApp = () => {
    const url = `${window.location.origin}/posts/${id}`;
    window.open(`https://wa.me/?text=${encodeURIComponent(`${post?.title}\n${url}`)}`, '_blank');
  };

  const getReactionCount = (type) => {
    if (!reactions || !reactions[type]) return 0;
    return reactions[type];
  };

  const getTotalReactions = () => {
    if (!reactions) return 0;
    return Object.values(reactions).reduce((a, b) => a + b, 0);
  };

  // Build comment tree for nested replies
  const buildCommentTree = (commentsList) => {
    const commentMap = {};
    const roots = [];
    
    commentsList.forEach(comment => {
      commentMap[comment._id] = { ...comment, replies: [] };
    });
    
    commentsList.forEach(comment => {
      if (comment.parentComment && commentMap[comment.parentComment]) {
        commentMap[comment.parentComment].replies.push(commentMap[comment._id]);
      } else if (!comment.parentComment) {
        roots.push(commentMap[comment._id]);
      }
    });
    
    // Sort roots by date (newest first)
    roots.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    
    return roots;
  };

  // Render comment with replies
  const renderComment = (comment, depth = 0) => {
    const maxDepth = 3;
    const isCommentOwner = user?._id === comment.author?._id;
    const isAdmin = user?.role === 'admin';
    const canDeleteComment = isCommentOwner || isAdmin;
    
    return (
      <div key={comment._id} style={{
        marginBottom: '1rem',
        marginLeft: depth > 0 ? '2rem' : '0',
        padding: '1rem',
        backgroundColor: depth === 0 ? '#f9f9f9' : '#f5f5f5',
        borderRadius: '12px',
        borderLeft: depth > 0 ? '3px solid var(--secondary)' : 'none',
        transition: 'all 0.3s ease'
      }}>
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '0.5rem',
          flexWrap: 'wrap',
          gap: '0.5rem'
        }}>
          <div>
            <strong style={{ color: 'var(--primary)' }}>
              <i className="fas fa-user-circle" style={{ marginRight: '5px' }}></i>
              {comment.author?.name || 'Anonymous'}
            </strong>
            <span style={{ fontSize: '0.75rem', color: '#999', marginLeft: '0.5rem' }}>
              {new Date(comment.createdAt).toLocaleString()}
            </span>
            {depth > 0 && (
              <span style={{ 
                fontSize: '0.65rem', 
                color: 'var(--secondary)', 
                marginLeft: '0.5rem',
                backgroundColor: 'rgba(255,64,129,0.1)',
                padding: '2px 8px',
                borderRadius: '12px'
              }}>
                Reply
              </span>
            )}
          </div>
          {canDeleteComment && (
            <button
              onClick={() => handleDeleteComment(comment._id)}
              style={{
                background: 'none',
                border: 'none',
                color: '#f44336',
                cursor: 'pointer',
                fontSize: '0.8rem',
                padding: '4px 8px',
                borderRadius: '5px',
                transition: 'all 0.2s ease'
              }}
              onMouseEnter={(e) => e.target.style.backgroundColor = '#ffebee'}
              onMouseLeave={(e) => e.target.style.backgroundColor = 'transparent'}
            >
              <i className="fas fa-trash-alt"></i> Delete
            </button>
          )}
        </div>
        
        <p style={{ 
          margin: '0 0 0.5rem 0', 
          whiteSpace: 'pre-wrap',
          lineHeight: '1.5',
          color: '#333'
        }}>
          {comment.body}
        </p>
        
        {user && depth < maxDepth && (
          <button
            onClick={() => setReplyingTo(replyingTo === comment._id ? null : comment._id)}
            style={{
              background: 'none',
              border: 'none',
              color: 'var(--accent)',
              cursor: 'pointer',
              fontSize: '0.8rem',
              padding: '4px 0',
              marginTop: '0.5rem',
              transition: 'color 0.2s ease'
            }}
            onMouseEnter={(e) => e.target.style.color = 'var(--secondary)'}
            onMouseLeave={(e) => e.target.style.color = 'var(--accent)'}
          >
            <i className="fas fa-reply"></i> {replyingTo === comment._id ? 'Cancel Reply' : 'Reply'}
          </button>
        )}
        
        {replyingTo === comment._id && (
          <div style={{ marginTop: '0.8rem', display: 'flex', gap: '0.5rem', alignItems: 'flex-start' }}>
            <textarea
              value={replyText}
              onChange={(e) => setReplyText(e.target.value)}
              placeholder={`Reply to ${comment.author?.name}...`}
              rows={2}
              style={{
                flex: 1,
                padding: '8px 12px',
                border: '1px solid #ddd',
                borderRadius: '8px',
                fontFamily: 'inherit',
                fontSize: '0.9rem',
                resize: 'vertical'
              }}
            />
            <button
              onClick={() => handleAddComment(comment._id)}
              className="btn"
              style={{ padding: '8px 16px', fontSize: '0.85rem' }}
              disabled={commentLoading}
            >
              {commentLoading ? '...' : 'Post'}
            </button>
          </div>
        )}
        
        {comment.replies && comment.replies.map(reply => renderComment(reply, depth + 1))}
      </div>
    );
  };

  // Check permissions
  const isOwner = user && post?.author?._id === user._id;
  const isAdmin = user?.role === 'admin';
  const canEdit = isOwner || isAdmin;
  const canDelete = isOwner || isAdmin;

  if (loading) {
    return (
      <main className="container">
        <div className="page-header">
          <h1>Loading post...</h1>
        </div>
        <div style={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          minHeight: '300px'
        }}>
          <i className="fas fa-spinner fa-spin" style={{ fontSize: '3rem', color: 'var(--primary)' }}></i>
        </div>
      </main>
    );
  }

  if (error || !post) {
    return (
      <main className="container">
        <div className="page-header">
          <h1>Post Not Found</h1>
          <p>{error || 'The post you\'re looking for doesn\'t exist or has been removed.'}</p>
        </div>
        <div style={{ textAlign: 'center', marginTop: '2rem' }}>
          <Link to="/home" className="btn">
            <i className="fas fa-arrow-left"></i> Back to Home
          </Link>
        </div>
      </main>
    );
  }

  const commentTree = buildCommentTree(comments);

  return (
    <main className="container">
      {/* Post Content */}
      <article className="section">
        {/* Post Image */}
        {post.image && (
          <div style={{ marginBottom: '2rem' }}>
            <img 
              src={`http://localhost:5000/uploads/${post.image}`} 
              alt={post.title}
              style={{
                width: '100%',
                borderRadius: '15px',
                maxHeight: '400px',
                objectFit: 'cover',
                boxShadow: '0 10px 30px rgba(0,0,0,0.1)'
              }}
            />
          </div>
        )}
        
        {/* Post Title */}
        <h1 style={{
          fontSize: '2.5rem',
          color: 'var(--primary)',
          marginBottom: '1rem',
          fontFamily: 'Georgia, serif'
        }}>
          {post.title}
        </h1>
        
        {/* Post Meta Info & Action Buttons */}
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '2rem',
          paddingBottom: '1rem',
          borderBottom: '2px solid #eee',
          flexWrap: 'wrap',
          gap: '1rem'
        }}>
          <div>
            <span style={{ fontSize: '0.9rem', color: '#666' }}>
              <i className="fas fa-user-circle" style={{ marginRight: '5px', color: 'var(--secondary)' }}></i>
              <strong>{post.author?.name || 'Anonymous'}</strong>
            </span>
            <span style={{ marginLeft: '1rem', fontSize: '0.85rem', color: '#999' }}>
              <i className="far fa-calendar-alt" style={{ marginRight: '5px' }}></i>
              {new Date(post.createdAt).toLocaleDateString()}
            </span>
            {post.createdAt !== post.updatedAt && (
              <span style={{ marginLeft: '1rem', fontSize: '0.8rem', color: '#bbb' }}>
                <i className="fas fa-edit"></i> Updated: {new Date(post.updatedAt).toLocaleDateString()}
              </span>
            )}
          </div>
          
          {/* Edit and Delete buttons - Owner/Admin only */}
          {canEdit && (
            <div style={{ display: 'flex', gap: '0.75rem' }}>
              <Link 
                to={`/edit-post/${post._id}`} 
                className="btn" 
                style={{ 
                  backgroundColor: 'var(--accent)', 
                  color: 'white',
                  textDecoration: 'none',
                  padding: '8px 20px'
                }}
              >
                <i className="fas fa-edit"></i> Edit Post
              </Link>
              {canDelete && (
                <button 
                  onClick={handleDeletePost} 
                  className="btn" 
                  style={{ backgroundColor: '#f44336', padding: '8px 20px' }}
                  disabled={deleting}
                >
                  <i className="fas fa-trash-alt"></i> {deleting ? 'Deleting...' : 'Delete'}
                </button>
              )}
            </div>
          )}
        </div>
        
        {/* Post Body */}
        <div style={{
          fontSize: '1.1rem',
          lineHeight: '1.8',
          marginBottom: '2rem',
          whiteSpace: 'pre-wrap',
          color: '#333'
        }}>
          {post.body}
        </div>
        
        {/* Reactions Section */}
        <div style={{
          paddingTop: '1rem',
          borderTop: '1px solid #eee',
          marginBottom: '2rem'
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
                onClick={() => handleReaction(reaction.name)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  padding: '8px 14px',
                  backgroundColor: userReaction === reaction.name ? 'rgba(74,20,140,0.1)' : 'transparent',
                  border: userReaction === reaction.name ? '1px solid var(--primary)' : '1px solid #ddd',
                  borderRadius: '30px',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease'
                }}
                onMouseEnter={(e) => {
                  if (userReaction !== reaction.name) {
                    e.currentTarget.style.backgroundColor = '#f5f5f5';
                  }
                }}
                onMouseLeave={(e) => {
                  if (userReaction !== reaction.name) {
                    e.currentTarget.style.backgroundColor = 'transparent';
                  }
                }}
              >
                <span style={{ fontSize: '1.2rem' }}>{reaction.emoji}</span>
                <span style={{ fontSize: '0.9rem', fontWeight: '500' }}>
                  {getReactionCount(reaction.name)}
                </span>
              </button>
            ))}
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '0.85rem', color: '#666' }}>
              <i className="fas fa-smile"></i> {getTotalReactions()} people reacted
            </span>
            <button
              onClick={handleShare}
              style={{
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                color: 'var(--accent)',
                fontSize: '0.9rem',
                padding: '5px 10px',
                borderRadius: '5px',
                transition: 'all 0.2s ease'
              }}
              onMouseEnter={(e) => e.target.style.backgroundColor = '#f0f0f0'}
              onMouseLeave={(e) => e.target.style.backgroundColor = 'transparent'}
            >
              <i className="fas fa-share-alt"></i> Share
            </button>
          </div>
        </div>
      </article>
      
      {/* Comments Section */}
      <div className="section">
        <h2 style={{
          display: 'flex',
          alignItems: 'center',
          gap: '10px',
          marginBottom: '1.5rem'
        }}>
          <i className="fas fa-comments" style={{ color: 'var(--secondary)' }}></i>
          Comments 
          <span style={{ fontSize: '0.9rem', color: '#666', fontWeight: 'normal' }}>
            ({comments.length})
          </span>
        </h2>
        
        {/* Add Comment Form - Only for logged in users */}
        {user ? (
          <div style={{
            marginBottom: '2rem',
            padding: '1.5rem',
            backgroundColor: '#f9f9f9',
            borderRadius: '12px',
            border: '1px solid #eee'
          }}>
            <textarea
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              placeholder="Write a comment..."
              rows={3}
              style={{
                width: '100%',
                padding: '12px',
                border: '2px solid #e0e0e0',
                borderRadius: '10px',
                fontFamily: 'inherit',
                fontSize: '0.95rem',
                resize: 'vertical',
                marginBottom: '1rem',
                transition: 'border 0.2s ease'
              }}
              onFocus={(e) => e.target.style.borderColor = 'var(--primary)'}
              onBlur={(e) => e.target.style.borderColor = '#e0e0e0'}
            />
            <button
              onClick={() => handleAddComment()}
              className="btn"
              disabled={commentLoading}
            >
              {commentLoading ? (
                <><i className="fas fa-spinner fa-spin"></i> Posting...</>
              ) : (
                <><i className="fas fa-paper-plane"></i> Post Comment</>
              )}
            </button>
          </div>
        ) : (
          <div style={{
            marginBottom: '2rem',
            padding: '1.5rem',
            backgroundColor: '#f9f9f9',
            borderRadius: '12px',
            textAlign: 'center',
            border: '1px solid #eee'
          }}>
            <p>
              <Link to="/login" style={{ color: 'var(--secondary)' }}>Login</Link> to join the conversation
            </p>
          </div>
        )}
        
        {/* Comments List */}
        <div className="comments-list">
          {commentTree.length === 0 ? (
            <div style={{
              textAlign: 'center',
              padding: '3rem',
              backgroundColor: '#f9f9f9',
              borderRadius: '12px',
              color: '#666'
            }}>
              <i className="fas fa-comment-dots" style={{ fontSize: '3rem', marginBottom: '1rem', opacity: 0.5 }}></i>
              <p>No comments yet. Be the first to share your thoughts!</p>
            </div>
          ) : (
            commentTree.map(comment => renderComment(comment))
          )}
        </div>
      </div>
      
      {/* Share Modal */}
      {showShareModal && (
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
            padding: '1.5rem',
            animation: 'modalFadeIn 0.3s ease'
          }}>
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: '1rem'
            }}>
              <h3 style={{ margin: 0, color: 'var(--primary)' }}>
                <i className="fas fa-share-alt"></i> Share this post
              </h3>
              <button
                onClick={() => setShowShareModal(false)}
                style={{
                  background: 'none',
                  border: 'none',
                  fontSize: '1.5rem',
                  cursor: 'pointer',
                  color: '#999'
                }}
              >
                ✕
              </button>
            </div>
            
            <p style={{ marginBottom: '1rem', color: '#666' }}>
              Share "{post.title}" with your friends
            </p>
            
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(2, 1fr)',
              gap: '1rem',
              marginBottom: '1.5rem'
            }}>
              <button
                onClick={shareOnFacebook}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px',
                  padding: '10px',
                  backgroundColor: '#1877f2',
                  color: 'white',
                  border: 'none',
                  borderRadius: '10px',
                  cursor: 'pointer',
                  transition: 'opacity 0.2s ease'
                }}
                onMouseEnter={(e) => e.target.style.opacity = '0.9'}
                onMouseLeave={(e) => e.target.style.opacity = '1'}
              >
                <i className="fab fa-facebook-f"></i> Facebook
              </button>
              
              <button
                onClick={shareOnTwitter}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px',
                  padding: '10px',
                  backgroundColor: '#1da1f2',
                  color: 'white',
                  border: 'none',
                  borderRadius: '10px',
                  cursor: 'pointer',
                  transition: 'opacity 0.2s ease'
                }}
              >
                <i className="fab fa-twitter"></i> Twitter
              </button>
              
              <button
                onClick={shareOnWhatsApp}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px',
                  padding: '10px',
                  backgroundColor: '#25d366',
                  color: 'white',
                  border: 'none',
                  borderRadius: '10px',
                  cursor: 'pointer',
                  transition: 'opacity 0.2s ease'
                }}
              >
                <i className="fab fa-whatsapp"></i> WhatsApp
              </button>
              
              <button
                onClick={copyToClipboard}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px',
                  padding: '10px',
                  backgroundColor: '#666',
                  color: 'white',
                  border: 'none',
                  borderRadius: '10px',
                  cursor: 'pointer',
                  transition: 'opacity 0.2s ease'
                }}
              >
                <i className="fas fa-link"></i> Copy Link
              </button>
            </div>
            
            {copied && (
              <div style={{
                textAlign: 'center',
                padding: '0.5rem',
                backgroundColor: '#4CAF50',
                color: 'white',
                borderRadius: '10px'
              }}>
                <i className="fas fa-check-circle"></i> Link copied to clipboard!
              </div>
            )}
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
        
        @media (max-width: 768px) {
          .section h1 {
            font-size: 1.8rem;
          }
          
          .comments-list {
            margin-top: 1rem;
          }
          
          .comments-list > div {
            margin-left: 0 !important;
          }
        }
      `}</style>
    </main>
  );
};

export default PostPage;