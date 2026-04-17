// frontend/src/pages/AboutPage.js
import { useState, useEffect } from 'react';

const AboutPage = () => {
  const [activeTimeline, setActiveTimeline] = useState(null);

  const timelineData = [
    {
      period: "Early Childhood (Ages 5-10)",
      description: "First exposure to music through school choir and family sing-alongs. Learned basic pitch matching and rhythm through children's songs and simple melodies."
    },
    {
      period: "Middle School (Ages 11-13)",
      description: "Joined school musical productions. Began formal voice lessons focusing on proper breathing techniques and vocal health. Performed my first solo at a school concert."
    },
    {
      period: "High School (Ages 14-18)",
      description: "Performed in competitive vocal ensembles. Explored different genres including classical, jazz, and contemporary. Started songwriting and experimenting with vocal arrangement."
    },
    {
      period: "College Years (Ages 19-22)",
      description: "Studied music theory and vocal pedagogy. Performed in campus a cappella groups and solo recitals. Started teaching beginner singers and discovered a passion for vocal education."
    },
    {
      period: "Present Day (Age 23+)",
      description: "Continued vocal coaching, focusing on advanced techniques. Started teaching beginner singers and sharing knowledge online. Currently working on developing a unique vocal style that blends traditional techniques with contemporary expression."
    }
  ];

  useEffect(() => {
    // Animation for timeline items
    const observerOptions = {
      threshold: 0.2,
      rootMargin: '0px 0px -50px 0px'
    };

    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.style.opacity = '1';
          entry.target.style.transform = 'translateX(0)';
        }
      });
    }, observerOptions);

    const timelineItems = document.querySelectorAll('.timeline-item');
    timelineItems.forEach(item => observer.observe(item));

    return () => observer.disconnect();
  }, []);

  return (
    <main>
      {/* Hero Section - Plain Color like HomePage */}
      <div className="hero" style={{
        backgroundColor: 'white',
        padding: '4rem 0',
        marginBottom: '3rem'
      }}>
        <div className="container">
          <div className="hero-content" style={{ 
            textAlign: 'center',
            color: 'var(--primary)',
            marginBottom: '2rem'
           }}>
            <h1 style={{
              fontFamily: 'var(--heading-font)',
              fontSize: '3rem',
              marginBottom: '1.5rem',
              textShadow: '2px 2px 4px rgba(0, 0, 0, 0.3)'
            }}>My Singing Journey</h1>

            <p style={{ color: ' #666', fontSize: '1.2rem', maxWidth: '800px', margin: '0 auto' }}>
              Discover my passion for vocal music, from early beginnings to ongoing development as a singer
            </p>
          </div>
        </div>
      </div>

      <div className="container">
        {/* What I Love About Singing Section */}
        <section className="section">
          <h2>What I Love About Singing</h2>
          <div className="content-grid" style={{
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            gap: '3rem',
            alignItems: 'center'
          }}>
            <div className="content-text">
              <p>Singing is more than just producing musical sounds—it's a form of self-expression that transcends language barriers. For me, the appeal lies in the unique combination of technical skill and emotional vulnerability required to deliver a compelling performance.</p>
              <p>I'm particularly drawn to soul and R&B genres because they allow for vocal improvisation and personal interpretation. The ability to bend notes, play with rhythms, and inject personal emotion into a song makes every performance a unique creation.</p>
              <p>Beyond performance, I appreciate the physiological aspects of singing. Proper technique involves understanding breath support, resonance, and articulation—each element coming together to create beautiful, sustainable vocal production. The voice is an instrument that everyone possesses, yet each person's voice is uniquely their own.</p>
              <p>What continues to fascinate me is how singing engages both the mind and body. It requires mental focus to remember lyrics and melodies, physical control to produce sound, and emotional awareness to convey meaning. This holistic engagement is what makes singing such a rewarding and enriching activity.</p>
            </div>
            <div className="content-image" style={{textAlign: 'center'}}>
              
                <img 
                  src="https://img.freepik.com/premium-photo/singer-lips-retro-microphone-girl-stage-holding-microphone-close-up-sensual-performance-song_636803-588.jpg" width="100" height="500"
                  alt="A person singing passionately into a microphone with stage lights"
                  
                />
              
            </div>
          </div>
        </section>

        {/* My Journey Timeline */}
        <section className="section">
          <h2>My Vocal Development Timeline</h2>
          <div className="timeline-container" style={{
            position: 'relative',
            paddingLeft: '2rem'
          }}>
            {timelineData.map((item, index) => (
              <div 
                key={index}
                className="timeline-item"
                style={{
                  position: 'relative',
                  marginBottom: '2rem',
                  padding: '1.5rem',
                  backgroundColor: 'white',
                  borderRadius: '10px',
                  boxShadow: '0 5px 15px rgba(0,0,0,0.1)',
                  opacity: 0,
                  transform: 'translateX(-20px)',
                  transition: 'all 0.5s ease',
                  transitionDelay: `${index * 0.1}s`,
                  cursor: 'pointer'
                }}
                onClick={() => setActiveTimeline(activeTimeline === index ? null : index)}
              >
                <div style={{
                  position: 'absolute',
                  left: '-2rem',
                  top: '1.5rem',
                  width: '1rem',
                  height: '1rem',
                  backgroundColor: 'var(--secondary)',
                  borderRadius: '50%',
                  border: '3px solid var(--primary)'
                }}></div>
                <h3 style={{color: 'var(--primary)', marginBottom: '0.5rem'}}>
                  <i className="fas fa-music" style={{marginRight: '0.5rem', color: 'var(--secondary)'}}></i>
                  {item.period}
                </h3>
                <p style={{
                  marginBottom: activeTimeline === index ? '1rem' : 0,
                  maxHeight: activeTimeline === index ? '200px' : '0',
                  overflow: 'hidden',
                  transition: 'max-height 0.3s ease'
                }}>
                  {item.description}
                </p>
                {activeTimeline !== index && (
                  <p style={{color: '#666', fontSize: '0.85rem'}}>Click to read more...</p>
                )}
              </div>
            ))}
          </div>
        </section>

        {/* Inspirational Quote */}
        <section className="section">
          <h2>Words That Inspire Me</h2>
          <blockquote className="inspirational-quote" style={{
            backgroundColor: 'white',
            padding: '2.5rem',
            borderRadius: '10px',
            boxShadow: '0 5px 15px rgba(0,0,0,0.1)',
            borderLeft: `5px solid var(--accent)`,
            fontStyle: 'italic',
            fontSize: '1.2rem',
            marginTop: '1rem'
          }}>
            <p style={{marginBottom: '1rem'}}>
              "Singing is about communicating, about sharing emotions. When you sing, you tell a story. 
              The voice is the most personal of all instruments—it comes from within your body and carries 
              your unique identity. It's not just about hitting the right notes; it's about conveying truth 
              and connecting with others on a deeply human level."
            </p>
            <cite style={{
              display: 'block',
              marginTop: '1rem',
              fontStyle: 'normal',
              fontWeight: 'bold',
              color: 'var(--primary)'
            }}>
              — Renée Fleming, Operatic Soprano
            </cite>
          </blockquote>
        </section>

        {/* Vocal Philosophy */}
        <section className="section">
          <h2>My Vocal Philosophy</h2>
          <div className="content-grid reversed" style={{
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            gap: '3rem',
            alignItems: 'center',
            direction: 'rtl'
          }}>
            <div className="content-text" style={{direction: 'ltr'}}>
              <p>I believe that everyone has a unique voice worth developing. While natural talent varies, proper technique and consistent practice can help anyone improve their singing abilities significantly. The voice is an instrument that can be trained, refined, and developed throughout one's lifetime.</p>
              <p>My approach emphasizes vocal health and sustainability. I prioritize exercises that strengthen the voice without strain, focusing on breath support, resonance balance, and vocal fold coordination. Healthy vocal habits ensure longevity in singing and prevent damage to the vocal cords.</p>
              <p>Performance, to me, is about connection—first with the music itself, then with the audience. I work to understand the emotional core of each piece I sing and convey that authentically to listeners. The most memorable performances are those where the singer becomes a vessel for the music's emotional message.</p>
              <p>I also believe in the importance of continuous learning. Even professional singers work with coaches and teachers to refine their technique. The journey of vocal development never truly ends, and that's part of what makes singing such a fulfilling lifelong pursuit.</p>
            </div>
            <div className="content-image" style={{direction: 'ltr', textAlign: 'center'}}>
              <div style={{
                width: '100%',
                height: '300px',
                backgroundColor: '#e0e0e0',
                borderRadius: '10px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                overflow: 'hidden'
              }}>
                <img 
                  src="https://media.licdn.com/dms/image/v2/D4D10AQEXOy-_UMRn8A/image-shrink_800/B4DZzmEVdnG0Ag-/0/1773386423138?e=2147483647&v=beta&t=QqXDCP5kDP8xisuF0qSwN_2RDslm8RBfhhHiDISWW1w" 
                  alt="Singer performing emotionally on stage"
                  style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                />
              </div>
            </div>
          </div>
        </section>

        {/* Fun Facts Section */}
        <section className="section">
          <h2>Fun Facts About My Singing Journey</h2>
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
            gap: '1.5rem',
            marginTop: '2rem'
          }}>
            <div className="benefit-card" style={{
              backgroundColor: 'white',
              padding: '1.5rem',
              borderRadius: '10px',
              textAlign: 'center',
              transition: 'transform 0.3s ease'
            }}>
              <i className="fas fa-microphone" style={{fontSize: '2.5rem', color: 'var(--secondary)'}}></i>
              <h3 style={{marginTop: '1rem'}}>100+</h3>
              <p>Songs Performed Live</p>
            </div>
            <div className="benefit-card" style={{
              backgroundColor: 'white',
              padding: '1.5rem',
              borderRadius: '10px',
              textAlign: 'center',
              transition: 'transform 0.3s ease'
            }}>
              <i className="fas fa-music" style={{fontSize: '2.5rem', color: 'var(--secondary)'}}></i>
              <h3 style={{marginTop: '1rem'}}>5</h3>
              <p>Original Songs Written</p>
            </div>
            <div className="benefit-card" style={{
              backgroundColor: 'white',
              padding: '1.5rem',
              borderRadius: '10px',
              textAlign: 'center',
              transition: 'transform 0.3s ease'
            }}>
              <i className="fas fa-chalkboard-teacher" style={{fontSize: '2.5rem', color: 'var(--secondary)'}}></i>
              <h3 style={{marginTop: '1rem'}}>20+</h3>
              <p>Students Taught</p>
            </div>
            <div className="benefit-card" style={{
              backgroundColor: 'white',
              padding: '1.5rem',
              borderRadius: '10px',
              textAlign: 'center',
              transition: 'transform 0.3s ease'
            }}>
              <i className="fas fa-calendar-alt" style={{fontSize: '2.5rem', color: 'var(--secondary)'}}></i>
              <h3 style={{marginTop: '1rem'}}>15+</h3>
              <p>Years of Singing</p>
            </div>
          </div>
        </section>
      </div>

      <style>{`
        .benefit-card:hover {
          transform: translateY(-10px);
        }
        
        .timeline-item:hover {
          transform: translateX(5px);
          box-shadow: 0 8px 25px rgba(0,0,0,0.15);
        }
        
        @media (max-width: 768px) {
          .content-grid,
          .content-grid.reversed {
            grid-template-columns: 1fr !important;
            direction: ltr !important;
          }
          
          .timeline-container {
            padding-left: 1rem;
          }
        }
      `}</style>
    </main>
  );
};

export default AboutPage;