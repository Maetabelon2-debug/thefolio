// frontend/src/pages/AdminPage.js
import { useState, useEffect } from 'react';
import API from '../api/axios';

const AdminPage = () => {
  const [users, setUsers] = useState([]);
  const [posts, setPosts] = useState([]);
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('users');
  const [replyModal, setReplyModal] = useState({ show: false, messageId: null, email: '' });
  const [replyText, setReplyText] = useState('');
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalPosts: 0,
    totalMessages: 0,
    activeUsers: 0
  });

  useEffect(() => {
    fetchAllData();
  }, []);

  const fetchAllData = async () => {
    setLoading(true);
    try {
      // Fetch all data in parallel
      const [usersRes, postsRes, messagesRes] = await Promise.all([
        API.get('/admin/users'),
        API.get('/admin/posts'),
        API.get('/contact/admin/messages').catch(() => ({ data: [] }))
      ]);
      
      setUsers(usersRes.data);
      setPosts(postsRes.data);
      setMessages(messagesRes.data || []);
      
      // Calculate statistics
      const activeUsersCount = usersRes.data.filter(u => u.status === 'active').length;
      setStats({
        totalUsers: usersRes.data.length,
        totalPosts: postsRes.data.length,
        totalMessages: messagesRes.data?.length || 0,
        activeUsers: activeUsersCount
      });
    } catch (err) {
      console.error('Error fetching admin data:', err);
      alert('Failed to load admin data. Please refresh the page.');
    } finally {
      setLoading(false);
    }
  };

  // Toggle user status (active/inactive)
  const toggleUserStatus = async (id) => {
    try {
      const { data } = await API.put(`/admin/users/${id}/status`);
      const updatedUsers = users.map(u => u._id === id ? data.user : u);
      setUsers(updatedUsers);
      
      // Update stats
      const activeUsersCount = updatedUsers.filter(u => u.status === 'active').length;
      setStats(prev => ({ ...prev, activeUsers: activeUsersCount }));
      
      alert(`User is now ${data.user.status}`);
    } catch (err) {
      console.error('Error toggling user status:', err);
      alert('Failed to update user status');
    }
  };

  // Remove a post (mark as removed)
  const removePost = async (id) => {
    if (!window.confirm('Are you sure you want to remove this post? It will be hidden from the public.')) return;
    
    try {
      await API.put(`/admin/posts/${id}/remove`);
      setPosts(posts.map(p => p._id === id ? { ...p, status: 'removed' } : p));
      alert('Post has been removed');
    } catch (err) {
      console.error('Error removing post:', err);
      alert('Failed to remove post');
    }
  };

  // Permanently delete a post
  const deletePost = async (id) => {
    if (!window.confirm('⚠️ WARNING: This will permanently delete the post. This action cannot be undone. Are you sure?')) return;
    
    try {
      await API.delete(`/posts/${id}`);
      const updatedPosts = posts.filter(p => p._id !== id);
      setPosts(updatedPosts);
      setStats(prev => ({ ...prev, totalPosts: updatedPosts.length }));
      alert('Post permanently deleted');
    } catch (err) {
      console.error('Error deleting post:', err);
      alert('Failed to delete post');
    }
  };

  // Mark message as read
  const markMessageAsRead = async (id) => {
    try {
      await API.put(`/contact/admin/messages/${id}/read`);
      setMessages(messages.map(m => m._id === id ? { ...m, status: 'read' } : m));
    } catch (err) {
      console.error('Error marking message as read:', err);
    }
  };

  // Delete a message
  const deleteMessage = async (id) => {
    if (!window.confirm('Delete this message?')) return;
    
    try {
      await API.delete(`/contact/admin/messages/${id}`);
      const updatedMessages = messages.filter(m => m._id !== id);
      setMessages(updatedMessages);
      setStats(prev => ({ ...prev, totalMessages: updatedMessages.length }));
      alert('Message deleted');
    } catch (err) {
      console.error('Error deleting message:', err);
      alert('Failed to delete message');
    }
  };

  // Send reply to message
  const sendReply = async (messageId, email) => {
    if (!replyText.trim()) {
      alert('Please enter a reply message');
      return;
    }
    
    try {
      await API.put(`/contact/admin/messages/${messageId}/reply`, { reply: replyText });
      
      // Update the message in state
      setMessages(messages.map(m => 
        m._id === messageId 
          ? { ...m, status: 'replied', adminReply: replyText, repliedAt: new Date() } 
          : m
      ));
      
      alert(`Reply sent to ${email}`);
      setReplyModal({ show: false, messageId: null, email: '' });
      setReplyText('');
    } catch (err) {
      console.error('Error sending reply:', err);
      alert('Failed to send reply');
    }
  };

  if (loading) {
    return (
      <main className="container">
        <div className="page-header">
          <h1>Admin Dashboard</h1>
          <p>Loading dashboard data...</p>
        </div>
        <div style={{textAlign: 'center', padding: '3rem'}}>
          <div className="loading-spinner">Loading...</div>
        </div>
      </main>
    );
  }

  return (
    <main className="container">
      <div className="page-header">
        <h1>Admin Dashboard</h1>
        <p>Manage users, moderate content, and respond to messages</p>
      </div>

      {/* Statistics Cards */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
        gap: '1.5rem',
        marginBottom: '2rem'
      }}>
        <div className="card" style={{textAlign: 'center', padding: '1.5rem'}}>
          <div style={{fontSize: '2.5rem', color: 'var(--primary)'}}>👥</div>
          <h3>{stats.totalUsers}</h3>
          <p>Total Members</p>
          <small>{stats.activeUsers} Active</small>
        </div>
        
        <div className="card" style={{textAlign: 'center', padding: '1.5rem'}}>
          <div style={{fontSize: '2.5rem', color: 'var(--secondary)'}}>📝</div>
          <h3>{stats.totalPosts}</h3>
          <p>Total Posts</p>
          <small>{posts.filter(p => p.status === 'published').length} Published</small>
        </div>
        
        <div className="card" style={{textAlign: 'center', padding: '1.5rem'}}>
          <div style={{fontSize: '2.5rem', color: 'var(--accent)'}}>✉️</div>
          <h3>{stats.totalMessages}</h3>
          <p>Contact Messages</p>
          <small>{messages.filter(m => m.status === 'unread').length} Unread</small>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="admin-tabs" style={{
        display: 'flex',
        gap: '1rem',
        marginBottom: '2rem',
        borderBottom: '2px solid #eee',
        paddingBottom: '0.5rem',
        flexWrap: 'wrap'
      }}>
        <button
          onClick={() => setActiveTab('users')}
          style={{
            padding: '0.75rem 1.5rem',
            backgroundColor: activeTab === 'users' ? 'var(--primary)' : 'transparent',
            color: activeTab === 'users' ? 'white' : 'var(--dark)',
            border: 'none',
            borderRadius: '5px',
            cursor: 'pointer',
            transition: 'all 0.3s ease',
            fontWeight: '600'
          }}
        >
          👥 Members ({users.length})
        </button>
        
        <button
          onClick={() => setActiveTab('posts')}
          style={{
            padding: '0.75rem 1.5rem',
            backgroundColor: activeTab === 'posts' ? 'var(--primary)' : 'transparent',
            color: activeTab === 'posts' ? 'white' : 'var(--dark)',
            border: 'none',
            borderRadius: '5px',
            cursor: 'pointer',
            transition: 'all 0.3s ease',
            fontWeight: '600'
          }}
        >
          📝 All Posts ({posts.length})
        </button>
        
        <button
          onClick={() => setActiveTab('messages')}
          style={{
            padding: '0.75rem 1.5rem',
            backgroundColor: activeTab === 'messages' ? 'var(--primary)' : 'transparent',
            color: activeTab === 'messages' ? 'white' : 'var(--dark)',
            border: 'none',
            borderRadius: '5px',
            cursor: 'pointer',
            transition: 'all 0.3s ease',
            fontWeight: '600',
            position: 'relative'
          }}
        >
          ✉️ Messages ({messages.length})
          {messages.filter(m => m.status === 'unread').length > 0 && (
            <span style={{
              marginLeft: '8px',
              backgroundColor: 'var(--secondary)',
              color: 'white',
              borderRadius: '50%',
              padding: '2px 6px',
              fontSize: '0.75rem'
            }}>
              {messages.filter(m => m.status === 'unread').length}
            </span>
          )}
        </button>
      </div>

      {/* ===== USERS TAB ===== */}
      {activeTab === 'users' && (
        <div className="table-container" style={{overflowX: 'auto'}}>
          <table style={{
            width: '100%',
            borderCollapse: 'collapse',
            backgroundColor: 'white',
            borderRadius: '10px',
            overflow: 'hidden'
          }}>
            <thead style={{backgroundColor: 'var(--primary)', color: 'white'}}>
              <tr>
                <th style={{padding: '1rem', textAlign: 'left'}}>#</th>
                <th style={{padding: '1rem', textAlign: 'left'}}>Profile</th>
                <th style={{padding: '1rem', textAlign: 'left'}}>Name</th>
                <th style={{padding: '1rem', textAlign: 'left'}}>Email</th>
                <th style={{padding: '1rem', textAlign: 'left'}}>Role</th>
                <th style={{padding: '1rem', textAlign: 'left'}}>Status</th>
                <th style={{padding: '1rem', textAlign: 'left'}}>Joined</th>
                <th style={{padding: '1rem', textAlign: 'left'}}>Action</th>
              </tr>
            </thead>
            <tbody>
              {users.length === 0 ? (
                <tr>
                  <td colSpan="8" style={{textAlign: 'center', padding: '2rem'}}>No members found</td>
                </tr>
              ) : (
                users.map((user, index) => (
                  <tr key={user._id} style={{borderBottom: '1px solid #eee'}}>
                    <td style={{padding: '1rem'}}>{index + 1}</td>
                    <td style={{padding: '1rem'}}>
                      {user.profilePic ? (
                        <img 
                          src={`http://localhost:5000/uploads/${user.profilePic}`} 
                          alt={user.name}
                          style={{width: '40px', height: '40px', borderRadius: '50%', objectFit: 'cover'}}
                        />
                      ) : (
                        <div style={{
                          width: '40px',
                          height: '40px',
                          borderRadius: '50%',
                          backgroundColor: 'var(--primary)',
                          color: 'white',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontSize: '1.2rem'
                        }}>
                          {user.name?.charAt(0).toUpperCase()}
                        </div>
                      )}
                    </td>
                    <td style={{padding: '1rem'}}>{user.name}</td>
                    <td style={{padding: '1rem'}}>{user.email}</td>
                    <td style={{padding: '1rem'}}>
                      <span style={{
                        padding: '4px 8px',
                        borderRadius: '5px',
                        backgroundColor: user.role === 'admin' ? 'var(--primary)' : 'var(--accent)',
                        color: 'white',
                        fontSize: '0.85rem'
                      }}>
                        {user.role}
                      </span>
                    </td>
                    <td style={{padding: '1rem'}}>
                      <span style={{
                        padding: '4px 8px',
                        borderRadius: '5px',
                        backgroundColor: user.status === 'active' ? '#4CAF50' : '#f44336',
                        color: 'white',
                        fontSize: '0.85rem'
                      }}>
                        {user.status}
                      </span>
                    </td>
                    <td style={{padding: '1rem'}}>{new Date(user.createdAt).toLocaleDateString()}</td>
                    <td style={{padding: '1rem'}}>
                      <button
                        onClick={() => toggleUserStatus(user._id)}
                        style={{
                          padding: '0.5rem 1rem',
                          fontSize: '0.85rem',
                          backgroundColor: user.status === 'active' ? '#f44336' : '#4CAF50',
                          color: 'white',
                          border: 'none',
                          borderRadius: '5px',
                          cursor: 'pointer'
                        }}
                      >
                        {user.status === 'active' ? 'Deactivate' : 'Activate'}
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* ===== POSTS TAB ===== */}
      {activeTab === 'posts' && (
        <div className="table-container" style={{overflowX: 'auto'}}>
          <table style={{
            width: '100%',
            borderCollapse: 'collapse',
            backgroundColor: 'white',
            borderRadius: '10px',
            overflow: 'hidden'
          }}>
            <thead style={{backgroundColor: 'var(--primary)', color: 'white'}}>
              <tr>
                <th style={{padding: '1rem', textAlign: 'left'}}>#</th>
                <th style={{padding: '1rem', textAlign: 'left'}}>Image</th>
                <th style={{padding: '1rem', textAlign: 'left'}}>Title</th>
                <th style={{padding: '1rem', textAlign: 'left'}}>Author</th>
                <th style={{padding: '1rem', textAlign: 'left'}}>Status</th>
                <th style={{padding: '1rem', textAlign: 'left'}}>Date</th>
                <th style={{padding: '1rem', textAlign: 'left'}}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {posts.length === 0 ? (
                <tr>
                  <td colSpan="7" style={{textAlign: 'center', padding: '2rem'}}>No posts found</td>
                </tr>
              ) : (
                posts.map((post, index) => (
                  <tr key={post._id} style={{borderBottom: '1px solid #eee'}}>
                    <td style={{padding: '1rem'}}>{index + 1}</td>
                    <td style={{padding: '1rem'}}>
                      {post.image ? (
                        <img 
                          src={`http://localhost:5000/uploads/${post.image}`} 
                          alt={post.title}
                          style={{width: '50px', height: '50px', objectFit: 'cover', borderRadius: '5px'}}
                        />
                      ) : (
                        <div style={{width: '50px', height: '50px', backgroundColor: '#eee', borderRadius: '5px'}}></div>
                      )}
                    </td>
                    <td style={{padding: '1rem'}}>
                      <a 
                        href={`/posts/${post._id}`} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        style={{color: 'var(--primary)', textDecoration: 'none'}}
                      >
                        {post.title}
                      </a>
                    </td>
                    <td style={{padding: '1rem'}}>{post.author?.name || 'Unknown'}</td>
                    <td style={{padding: '1rem'}}>
                      <span style={{
                        padding: '4px 8px',
                        borderRadius: '5px',
                        backgroundColor: post.status === 'published' ? '#4CAF50' : '#f44336',
                        color: 'white',
                        fontSize: '0.85rem'
                      }}>
                        {post.status}
                      </span>
                    </td>
                    <td style={{padding: '1rem'}}>{new Date(post.createdAt).toLocaleDateString()}</td>
                    <td style={{padding: '1rem'}}>
                      <div style={{display: 'flex', gap: '0.5rem', flexWrap: 'wrap'}}>
                        <a 
                          href={`/edit-post/${post._id}`}
                          style={{
                            padding: '0.5rem 1rem',
                            fontSize: '0.85rem',
                            backgroundColor: 'var(--accent)',
                            color: 'white',
                            textDecoration: 'none',
                            borderRadius: '5px',
                            display: 'inline-block'
                          }}
                        >
                          Edit
                        </a>
                        {post.status === 'published' ? (
                          <button
                            onClick={() => removePost(post._id)}
                            style={{
                              padding: '0.5rem 1rem',
                              fontSize: '0.85rem',
                              backgroundColor: '#ff9800',
                              color: 'white',
                              border: 'none',
                              borderRadius: '5px',
                              cursor: 'pointer'
                            }}
                          >
                            Remove
                          </button>
                        ) : (
                          <button
                            onClick={() => deletePost(post._id)}
                            style={{
                              padding: '0.5rem 1rem',
                              fontSize: '0.85rem',
                              backgroundColor: '#f44336',
                              color: 'white',
                              border: 'none',
                              borderRadius: '5px',
                              cursor: 'pointer'
                            }}
                          >
                            Delete Permanently
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* ===== MESSAGES TAB ===== */}
      {activeTab === 'messages' && (
        <div className="messages-container" style={{maxHeight: '600px', overflowY: 'auto'}}>
          {messages.length === 0 ? (
            <div className="card" style={{textAlign: 'center', padding: '3rem'}}>
              <p>No messages yet</p>
            </div>
          ) : (
            messages.map((message) => (
              <div 
                key={message._id} 
                className="card" 
                style={{
                  marginBottom: '1.5rem',
                  borderLeft: message.status === 'unread' ? `4px solid var(--secondary)` : 'none',
                  backgroundColor: message.status === 'unread' ? 'rgba(255, 64, 129, 0.05)' : 'white'
                }}
              >
                <div className="card-content" style={{padding: '1.5rem'}}>
                  <div style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'flex-start',
                    marginBottom: '1rem',
                    flexWrap: 'wrap',
                    gap: '1rem'
                  }}>
                    <div>
                      <h3 style={{marginBottom: '0.5rem', color: 'var(--primary)'}}>{message.subject}</h3>
                      <p><strong>From:</strong> {message.name} ({message.email})</p>
                      <p><strong>Date:</strong> {new Date(message.createdAt).toLocaleString()}</p>
                      {message.userId && <p><strong>User ID:</strong> {message.userId}</p>}
                    </div>
                    <div style={{display: 'flex', gap: '0.5rem', flexWrap: 'wrap'}}>
                      {message.status === 'unread' && (
                        <button
                          onClick={() => markMessageAsRead(message._id)}
                          className="btn"
                          style={{
                            padding: '0.5rem 1rem',
                            fontSize: '0.85rem',
                            backgroundColor: 'var(--accent)',
                            color: 'white',
                            border: 'none',
                            borderRadius: '5px',
                            cursor: 'pointer'
                          }}
                        >
                          Mark as Read
                        </button>
                      )}
                      <button
                        onClick={() => {
                          setReplyModal({ show: true, messageId: message._id, email: message.email });
                          setReplyText('');
                        }}
                        className="btn"
                        style={{
                          padding: '0.5rem 1rem',
                          fontSize: '0.85rem',
                          backgroundColor: '#4CAF50',
                          color: 'white',
                          border: 'none',
                          borderRadius: '5px',
                          cursor: 'pointer'
                        }}
                      >
                        Reply
                      </button>
                      <button
                        onClick={() => deleteMessage(message._id)}
                        className="btn"
                        style={{
                          padding: '0.5rem 1rem',
                          fontSize: '0.85rem',
                          backgroundColor: '#f44336',
                          color: 'white',
                          border: 'none',
                          borderRadius: '5px',
                          cursor: 'pointer'
                        }}
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                  
                  <div style={{
                    marginTop: '1rem',
                    padding: '1rem',
                    backgroundColor: 'rgba(0, 0, 0, 0.03)',
                    borderRadius: '5px'
                  }}>
                    <strong>Message:</strong>
                    <p style={{whiteSpace: 'pre-wrap', marginTop: '0.5rem'}}>{message.message}</p>
                  </div>
                  
                  {message.adminReply && (
                    <div style={{
                      marginTop: '1rem',
                      padding: '1rem',
                      backgroundColor: 'rgba(76, 175, 80, 0.1)',
                      borderRadius: '5px',
                      borderLeft: '3px solid #4CAF50'
                    }}>
                      <strong>📧 Admin Reply:</strong>
                      <p style={{whiteSpace: 'pre-wrap', marginTop: '0.5rem'}}>{message.adminReply}</p>
                      <small>Replied on: {new Date(message.repliedAt).toLocaleString()}</small>
                    </div>
                  )}
                  
                  <div style={{marginTop: '1rem', fontSize: '0.85rem', color: '#666'}}>
                    <strong>Status:</strong>{' '}
                    <span style={{
                      color: message.status === 'unread' ? 'var(--secondary)' : 
                             message.status === 'read' ? '#ff9800' : '#4CAF50'
                    }}>
                      {message.status}
                    </span>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* Reply Modal */}
      {replyModal.show && (
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
            padding: '2rem',
            borderRadius: '10px',
            maxWidth: '500px',
            width: '90%'
          }}>
            <h3 style={{color: 'var(--primary)', marginBottom: '1rem'}}>Reply to {replyModal.email}</h3>
            <textarea
              value={replyText}
              onChange={(e) => setReplyText(e.target.value)}
              placeholder="Type your reply here..."
              rows={5}
              style={{
                width: '100%',
                padding: '0.8rem',
                border: '2px solid #ddd',
                borderRadius: '5px',
                fontFamily: 'inherit',
                fontSize: '1rem'
              }}
            />
            <div style={{display: 'flex', gap: '1rem', marginTop: '1rem'}}>
              <button
                onClick={() => sendReply(replyModal.messageId, replyModal.email)}
                style={{
                  padding: '0.75rem 1.5rem',
                  backgroundColor: '#4CAF50',
                  color: 'white',
                  border: 'none',
                  borderRadius: '5px',
                  cursor: 'pointer',
                  flex: 1
                }}
              >
                Send Reply
              </button>
              <button
                onClick={() => setReplyModal({ show: false, messageId: null, email: '' })}
                style={{
                  padding: '0.75rem 1.5rem',
                  backgroundColor: '#999',
                  color: 'white',
                  border: 'none',
                  borderRadius: '5px',
                  cursor: 'pointer',
                  flex: 1
                }}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      <style>{`
        .admin-tabs button:hover {
          opacity: 0.8;
        }
        
        @media (max-width: 768px) {
          .table-container {
            overflow-x: scroll;
          }
          
          .admin-tabs {
            flex-direction: column;
          }
          
          .admin-tabs button {
            width: 100%;
          }
        }
      `}</style>
    </main>
  );
};

export default AdminPage;