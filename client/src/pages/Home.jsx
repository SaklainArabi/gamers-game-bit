import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import Navbar from '../components/Navbar'

const navLinks = [
  { to: '/', label: 'Home' },
  { to: '/about', label: 'About' },
  { to: '/events', label: 'Events' }
]

function Home() {
  const navigate = useNavigate()
  const [currentUser, setCurrentUser] = useState(null)
  const [listings, setListings] = useState([])
  const [categories, setCategories] = useState([])
  const [events, setEvents] = useState([])
  const [threads, setThreads] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    checkAuth()
    loadData()
  }, [])

  async function checkAuth() {
    try {
      const res = await fetch('/api/check-session')
      const data = await res.json()
      if (data.success) {
        setCurrentUser(data.user)
      }
    } catch (err) {
      console.error('Auth check failed:', err)
    }
  }

  async function loadData() {
    setLoading(true)
    try {
      const [listingsRes, categoriesRes, eventsRes, threadsRes] = await Promise.all([
        fetch('/api/listings'),
        fetch('/api/categories'),
        fetch('/api/events'),
        fetch('/api/community/threads')
      ])

      const listingsData = await listingsRes.json()
      const categoriesData = await categoriesRes.json()
      const eventsData = await eventsRes.json()
      const threadsData = await threadsRes.json()

      if (listingsData.success) setListings(listingsData.listings)
      if (categoriesData.success) setCategories(categoriesData.categories)
      if (eventsData.success) setEvents(eventsData.events.slice(0, 4))
      if (threadsData.success) setThreads(threadsData.threads.slice(0, 3))
    } catch (err) {
      console.error('Error loading data:', err)
    }
    setLoading(false)
  }

  return (
    <>
      <Navbar links={navLinks} />

      <section className="hero">
        <div className="container">
          <h1>Buy, Sell &amp; Trade Games</h1>
          <p>Join the ultimate gaming marketplace. Browse games, create listings, and connect with the community!</p>

          <div className="hero-buttons">
            {currentUser ? (
              <Link 
                to={currentUser.type === 'admin' ? '/admin-dashboard' : '/user-dashboard'} 
                className="btn btn-primary"
              >
                Go to Dashboard
              </Link>
            ) : (
              <>
                <Link to="/register" className="btn btn-primary">Get Started</Link>
                <Link to="/login" className="btn btn-secondary">Login</Link>
              </>
            )}
          </div>
        </div>
      </section>

      {/* Events Showcase */}
      {events.length > 0 && (
        <section style={{ padding: '3rem 0', background: 'var(--light)' }}>
          <div className="container">
            <h2 style={{ textAlign: 'center', marginBottom: '1.5rem' }}>
              <i className="fas fa-calendar-star" style={{ color: 'var(--primary)' }}></i> Upcoming Events
            </h2>
            <div style={{ 
              display: 'grid', 
              gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', 
              gap: '1.5rem' 
            }}>
              {events.map(event => (
                <div 
                  key={event.event_id} 
                  className="card" 
                  style={{ 
                    padding: '1.5rem',
                    cursor: 'pointer',
                    transition: 'transform 0.2s'
                  }}
                  onClick={() => navigate('/events')}
                  onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-5px)'}
                  onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0)'}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
                    <h3 style={{ margin: 0 }}>{event.title}</h3>
                    <span style={{ 
                      background: event.event_type === 'TOURNAMENT' ? 'var(--danger)' : 
                                  event.event_type === 'GIVEAWAY' ? 'var(--success)' : 'var(--primary)', 
                      color: 'white', 
                      padding: '0.25rem 0.5rem',
                      borderRadius: '4px',
                      fontSize: '0.75rem'
                    }}>
                      {event.event_type}
                    </span>
                  </div>
                  <p style={{ 
                    color: 'var(--gray)', 
                    fontSize: '0.9rem',
                    margin: '0 0 1rem',
                    display: '-webkit-box',
                    WebkitLineClamp: 2,
                    WebkitBoxOrient: 'vertical',
                    overflow: 'hidden'
                  }}>
                    {event.description}
                  </p>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', color: 'var(--gray)', fontSize: '0.85rem' }}>
                    <span>
                      <i className="fas fa-calendar"></i> {new Date(event.start_date).toLocaleDateString()}
                    </span>
                    <span>
                      <i className="fas fa-users"></i> {event.current_participants || 0}/{event.max_participants || '∞'}
                    </span>
                  </div>
                  {event.prize_pool > 0 && (
                    <div style={{ marginTop: '0.75rem', textAlign: 'center' }}>
                      <span style={{ background: 'var(--success)', color: 'white', padding: '0.25rem 0.75rem', borderRadius: '20px', fontWeight: 'bold' }}>
                        <i className="fas fa-trophy"></i> ${event.prize_pool} Prize Pool
                      </span>
                    </div>
                  )}
                </div>
              ))}
            </div>
            <div style={{ textAlign: 'center', marginTop: '1.5rem' }}>
              <Link to="/events" className="btn btn-primary">
                View All Events <i className="fas fa-arrow-right"></i>
              </Link>
            </div>
          </div>
        </section>
      )}

      {/* Community Highlights */}
      {threads.length > 0 && (
        <section style={{ padding: '3rem 0', background: 'var(--light)' }}>
          <div className="container">
            <h2 style={{ textAlign: 'center', marginBottom: '1.5rem' }}>
              <i className="fas fa-comments" style={{ color: 'var(--primary)' }}></i> Trending Discussions
            </h2>
            <div style={{ 
              display: 'grid', 
              gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', 
              gap: '1rem' 
            }}>
              {threads.map(thread => (
                <div key={thread.thread_id} className="card" style={{ padding: '1.25rem' }}>
                  <h4 style={{ margin: '0 0 0.5rem' }}>{thread.title}</h4>
                  <p style={{ 
                    color: 'var(--gray)', 
                    fontSize: '0.9rem',
                    margin: '0 0 0.75rem',
                    display: '-webkit-box',
                    WebkitLineClamp: 2,
                    WebkitBoxOrient: 'vertical',
                    overflow: 'hidden'
                  }}>
                    {thread.content}
                  </p>
                  <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--gray)', fontSize: '0.85rem' }}>
                    <span><i className="fas fa-user"></i> {thread.username}</span>
                    <span><i className="fas fa-arrow-up"></i> {thread.upvote_count || 0} upvotes</span>
                  </div>
                </div>
              ))}
            </div>
            <div style={{ textAlign: 'center', marginTop: '1.5rem' }}>
              <Link to="/login" className="btn btn-secondary">
                Join the Community <i className="fas fa-users"></i>
              </Link>
            </div>
          </div>
        </section>
      )}

      {/* Features Section */}
      <section className="features">
        <div className="container">
          <h2 style={{ textAlign: 'center', marginBottom: '2rem' }}>Why Choose Gamers' Gambit?</h2>
          <div style={{ display: 'flex', justifyContent: 'center', gap: '2rem', flexWrap: 'wrap' }}>
            <div className="feature-card">
              <div style={{ fontSize: '2.5rem', color: 'var(--primary)', marginBottom: '1rem' }}>
                <i className="fas fa-shopping-cart"></i>
              </div>
              <h3>Game Marketplace</h3>
              <p>Browse and purchase games. Find the best deals on new and popular titles.</p>
            </div>

            <div className="feature-card">
              <div style={{ fontSize: '2.5rem', color: 'var(--primary)', marginBottom: '1rem' }}>
                <i className="fas fa-comments"></i>
              </div>
              <h3>Community Forum</h3>
              <p>Join discussions, share tips, and connect with fellow gamers.</p>
            </div>

            <div className="feature-card">
              <div style={{ fontSize: '2.5rem', color: 'var(--primary)', marginBottom: '1rem' }}>
                <i className="fas fa-calendar-alt"></i>
              </div>
              <h3>Gaming Events</h3>
              <p>Join community events, tournaments, and exclusive gaming sessions.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Quick Links */}
      <section style={{ padding: '2rem 0', background: 'var(--dark)', color: 'white' }}>
        <div className="container">
          <div style={{ 
            display: 'flex', 
            justifyContent: 'center', 
            gap: '2rem',
            flexWrap: 'wrap',
            textAlign: 'center'
          }}>
            <Link to="/events" style={{ color: 'white' }}>
              <i className="fas fa-calendar fa-2x"></i>
              <p style={{ marginTop: '0.5rem' }}>Events</p>
            </Link>
            <Link to="/about" style={{ color: 'white' }}>
              <i className="fas fa-info-circle fa-2x"></i>
              <p style={{ marginTop: '0.5rem' }}>About</p>
            </Link>
            <Link to="/contact" style={{ color: 'white' }}>
              <i className="fas fa-envelope fa-2x"></i>
              <p style={{ marginTop: '0.5rem' }}>Contact</p>
            </Link>
          </div>
        </div>
      </section>
    </>
  )
}

export default Home
