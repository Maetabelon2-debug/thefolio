// frontend/src/pages/ContactPage.js
import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import API from '../api/axios';

const ContactPage = () => {
  const { user } = useAuth();
  const [form, setForm] = useState({
    name: user?.name || '',
    email: user?.email || '',
    subject: '',
    message: ''
  });
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');
  const [charCount, setCharCount] = useState(0);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm({ ...form, [name]: value });
    if (name === 'message') {
      setCharCount(value.length);
    }
    if (success) setSuccess('');
    if (error) setError('');
  };

  const validateForm = () => {
    if (!form.name.trim()) {
      setError('Please enter your name');
      return false;
    }
    if (form.name.trim().length < 2) {
      setError('Full name must be at least 2 characters long');
      return false;
    }
    if (!form.email.trim()) {
      setError('Please enter your email');
      return false;
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(form.email)) {
      setError('Please enter a valid email address');
      return false;
    }
    if (!form.subject.trim()) {
      setError('Please enter a subject');
      return false;
    }
    if (!form.message.trim()) {
      setError('Please enter your message');
      return false;
    }
    if (form.message.trim().length < 10) {
      setError('Message must be at least 10 characters long');
      return false;
    }
    if (form.message.trim().length > 500) {
      setError('Message cannot exceed 500 characters');
      return false;
    }
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    setLoading(true);
    setSuccess('');
    setError('');
    
    try {
      const response = await API.post('/contact', {
        name: form.name,
        email: form.email,
        subject: form.subject,
        message: form.message,
        userId: user?._id || null
      });
      
      setSuccess(response.data.message || 'Message sent successfully! The admin will respond within 24-48 hours.');
      
      setForm({
        name: user?.name || '',
        email: user?.email || '',
        subject: '',
        message: ''
      });
      setCharCount(0);
      
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to send message. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="container">
      {/* Page Header */}
      <div className="page-header">
        <h1>Contact & Resources</h1>
        <p>Connect with me and explore valuable singing resources, tools, and learning materials</p>
      </div>
      
      {/* Contact Form Section */}
      <section className="section">
        <h2>Get In Touch</h2>
        <div className="form-container" style={{ backgroundColor: 'white', padding: '2rem', borderRadius: '10px', boxShadow: '0 5px 15px rgba(0, 0, 0, 0.1)', marginTop: '1rem' }}>
          {success && (
            <div className="notification success" style={{ marginBottom: '1rem' }}>
              {success}
            </div>
          )}
          {error && (
            <div className="notification error" style={{ marginBottom: '1rem' }}>
              {error}
            </div>
          )}
          
          <form onSubmit={handleSubmit} className="contact-form">
            <div className="form-group">
              <label htmlFor="name">Full Name *</label>
              <input
                type="text"
                id="name"
                name="name"
                value={form.name}
                onChange={handleChange}
                required
                placeholder="Enter your full name (min. 2 characters)"
                disabled={!!user}
              />
            </div>
            
            <div className="form-group">
              <label htmlFor="email">Email Address *</label>
              <input
                type="email"
                id="email"
                name="email"
                value={form.email}
                onChange={handleChange}
                required
                placeholder="student@example.com"
                disabled={!!user}
              />
            </div>
            
            <div className="form-group">
              <label htmlFor="subject">Subject *</label>
              <input
                type="text"
                id="subject"
                name="subject"
                value={form.subject}
                onChange={handleChange}
                required
                placeholder="What is this regarding?"
              />
            </div>
            
            <div className="form-group">
              <label htmlFor="message">Your Message *</label>
              <textarea
                id="message"
                name="message"
                value={form.message}
                onChange={handleChange}
                rows={5}
                required
                placeholder="Share your thoughts, questions, or singing topics you'd like to discuss... (min. 10 characters)"
              />
              <div className="character-count">
                <span id="charCount">{charCount}</span> / 500 characters
              </div>
            </div>
            
            <button type="submit" className="btn" disabled={loading}>
              {loading ? 'Sending...' : 'Send Message'}
            </button>
            <p className="form-note">Your message will be sent to the admin and you'll receive a response via email.</p>
          </form>
        </div>
      </section>

      {/* Essential Singing Resources Table */}
      <section className="section">
        <h2>Essential Singing Resources</h2>
        <div className="table-container">
          <table className="resources-table">
            <thead>
              <tr>
                <th>Resource Name</th>
                <th>Description</th>
               </tr>
            </thead>
            <tbody>
              <tr>
                <td>Vocal Warm-Up Exercises</td>
                <td>Daily 15-minute routine to prepare your voice for singing, including lip trills, sirens, and scale patterns. Essential for vocal health and performance readiness.</td>
              </tr>
              <tr>
                <td>Breath Support Techniques</td>
                <td>Methods for diaphragmatic breathing and breath control to improve vocal stamina, tone quality, and dynamic range. Foundation of good singing technique.</td>
              </tr>
              <tr>
                <td>Sight-Reading Practice</td>
                <td>Progressive exercises to improve music reading skills for vocalists. Includes rhythm training, pitch recognition, and score analysis techniques.</td>
              </tr>
              <tr>
                <td>Performance Anxiety Management</td>
                <td>Strategies to overcome stage fright and perform with confidence. Includes mental preparation, physical relaxation techniques, and focus exercises.</td>
              </tr>
              <tr>
                <td>Vocal Health Guide</td>
                <td>Comprehensive tips for maintaining vocal health, including hydration, rest, avoiding strain, and recognizing warning signs of vocal problems.</td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>

      {/* External Singing Resources */}
      <section className="section">
        <h2>External Singing Resources</h2>
        <div className="external-links">
          <div className="link-card">
            <h3><i className="fas fa-external-link-alt"></i> National Association of Teachers of Singing</h3>
            <p>Professional organization with resources for finding qualified voice teachers and vocal pedagogy research. Offers conferences, publications, and educational materials for singers at all levels.</p>
            <a href="https://www.nats.org" target="_blank" rel="noopener noreferrer" className="btn">Visit NATS</a>
          </div>
          
          <div className="link-card">
            <h3><i className="fas fa-external-link-alt"></i> The Voice Foundation</h3>
            <p>Scientific and educational organization dedicated to voice medicine, research, and education. Provides valuable information on vocal health, disorders, and evidence-based practice for vocalists.</p>
            <a href="https://www.voicefoundation.org" target="_blank" rel="noopener noreferrer" className="btn">Visit Site</a>
          </div>
          
          <div className="link-card">
            <h3><i className="fas fa-external-link-alt"></i> Music Theory.net</h3>
            <p>Free resource for learning music theory fundamentals essential for all singers. Interactive lessons cover notation, scales, chords, and ear training in an accessible format.</p>
            <a href="https://www.musictheory.net" target="_blank" rel="noopener noreferrer" className="btn">Learn Theory</a>
          </div>
        </div>
      </section>

      {/* Find Local Singing Communities - Map Section with Actual Image */}
      <section className="section">
        <h2>Find Local Singing Communities</h2>
        <div className="map-container">
          <div className="map-placeholder" style={{
            position: 'relative',
            borderRadius: '10px',
            overflow: 'hidden',
            boxShadow: '0 5px 15px rgba(0, 0, 0, 0.1)'
          }}>
            {/* Actual Map Image */}
            <img 
              src="https://images.unsplash.com/photo-1524661135-423995f22d0b?w=1200&h=400&fit=crop"
              alt="Map showing singing communities and music venues location"
              style={{
                width: '100%',
                height: '300px',
                objectFit: 'cover',
                display: 'block'
              }}
            />
            <div className="map-overlay" style={{
              position: 'absolute',
              bottom: 0,
              left: 0,
              right: 0,
              background: 'linear-gradient(transparent, rgba(74,20,140,0.95))',
              color: 'white',
              padding: '1.5rem'
            }}>
              <h3 style={{ color: 'white', marginBottom: '0.5rem' }}>
                <i className="fas fa-map-marker-alt" style={{ marginRight: '8px' }}></i>
                Singing Communities Near You
              </h3>
              <p style={{ margin: 0 }}>This map shows locations of community choirs, vocal workshops, and singing groups in major metropolitan areas. Check local community centers, colleges, and places of worship for vocal opportunities in your area.</p>
            </div>
          </div>
        </div>
      </section>

      <style>{`
        .resources-table {
          width: 100%;
          border-collapse: collapse;
          background-color: white;
          box-shadow: 0 5px 15px rgba(0, 0, 0, 0.1);
          border-radius: 10px;
          overflow: hidden;
        }

        .resources-table thead {
          background-color: var(--primary);
          color: white;
        }

        .resources-table th,
        .resources-table td {
          padding: 1rem;
          text-align: left;
          border-bottom: 1px solid #eee;
        }

        .resources-table tbody tr:hover {
          background-color: rgba(0, 188, 212, 0.1);
        }

        .resources-table th {
          font-family: var(--heading-font);
          font-weight: 600;
        }

        .external-links {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
          gap: 1.5rem;
          margin-top: 1rem;
        }

        .link-card {
          background-color: white;
          padding: 1.5rem;
          border-radius: 10px;
          box-shadow: 0 5px 15px rgba(0, 0, 0, 0.1);
          transition: transform 0.3s ease;
        }

        .link-card:hover {
          transform: translateY(-5px);
        }

        .link-card h3 {
          color: var(--primary);
          margin-bottom: 1rem;
          display: flex;
          align-items: center;
          gap: 10px;
        }

        .link-card h3 i {
          color: var(--secondary);
        }

        .link-card .btn {
          margin-top: 1rem;
          display: inline-block;
        }

        .character-count {
          text-align: right;
          font-size: 0.85rem;
          color: #666;
          margin-top: 0.3rem;
        }

        .character-count span {
          font-weight: 600;
        }

        /* Dark mode adjustments */
        .dark-mode .resources-table {
          background-color: #2d2d2d;
          color: #e0e0e0;
        }

        .dark-mode .resources-table thead {
          background-color: #1e1e1e;
        }

        .dark-mode .resources-table tbody tr:hover {
          background-color: rgba(0, 188, 212, 0.2);
        }

        .dark-mode .link-card {
          background-color: #2d2d2d;
          color: #e0e0e0;
        }

        @media (max-width: 768px) {
          .table-container {
            overflow-x: auto;
          }
          
          .external-links {
            grid-template-columns: 1fr;
          }
          
          .map-overlay {
            padding: 1rem;
          }
          
          .map-overlay h3 {
            font-size: 1rem;
          }
          
          .map-overlay p {
            font-size: 0.85rem;
          }
        }
      `}</style>
    </main>
  );
};

export default ContactPage;