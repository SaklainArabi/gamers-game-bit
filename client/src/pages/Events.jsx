import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import Navbar from '../components/Navbar'

const navLinks = [
  { to: '/', label: 'Home' },
  { to: '/about', label: 'About' },
  { to: '/events', label: 'Events' },
  { to: '/leaderboard', label: 'Leaderboard' },
  { to: '/help', label: 'Help' }
]

function Events() {
  const navigate = useNavigate()
  const [events, setEvents] = useState([])
  const [selectedEvent, setSelectedEvent] = useState(null)
  const [currentUser, setCurrentUser] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    checkAuth()
    loadEvents()
  }, [])

  async function checkAuth() {
    const res = await fetch('/api/check-session')
    const data = await res.json()
    if (data.success) {
      setCurrentUser(data.user)
    }
  }

  async function loadEvents() {
    setLoading(true)
    try {
      const res = await fetch('/api/events')
      const data = await res.json()
      if (data.success) {
        setEvents(data.events)
      }
    } catch (err) {
      console.error('Error loading events:', err)
    }
    setLoading(false)
  }

  async function viewEvent(eventId) {
    try {
      const res = await fetch(`/api/event/${eventId}`)
      const data = await res.json()
      if (data.success) {
        setSelectedEvent({ ...data.event, registrations: data.registrations, userRegistered: data.userRegistered })
      }
    } catch (err) {
      console.error('Error loading event:', err)
    }
  }

  async function registerForEvent(eventId) {
    if (!currentUser) {
      alert('Please login to register for events')
      navigate('/login')
      return
    }

    try {
      const res = await fetch(`/api/event/${eventId}/register`, { method: 'POST' })
      const data = await res.json()
      if (data.success) {
        alert('Successfully registered!')
        viewEvent(eventId)
      } else {
        alert(data.message)
      }
    } catch (err) {
      alert('Error registering for event')
    }
  }

  function getStatusBadge(status) {
    const statusStyles = {
      'UPCOMING': { bg: '#3498db', text: 'Upcoming' },
      'ONGOING': { bg: '#27ae60', text: 'Live Now!' },
      'COMPLETED': { bg: '#95a5a6', text: 'Completed' },
      'CANCELLED': { bg: '#e74c3c', text: 'Cancelled' }
    }
    const style = statusStyles[status] || statusStyles['UPCOMING']
    return (
      <span style={{
        background: style.bg,
        color: 'white',
        padding: '0.25rem 0.75rem',
        borderRadius: '20px',
        fontSize: '0.8rem',
        fontWeight: '600'
      }}>
        {style.text}
      </span>
    )
  }

  function getEventTypeBadge(type) {
    const typeStyles = {
      'TOURNAMENT': { bg: '#9b59b6', icon: 'fa-trophy' },
      'SALE': { bg: '#e67e22', icon: 'fa-tag' },
      'GIVEAWAY': { bg: '#2ecc71', icon: 'fa-gift' },
      'MEETUP': { bg: '#3498db', icon: 'fa-users' }
    }
    const style = typeStyles[type] || typeStyles['TOURNAMENT']
    return (
      <span style={{
        background: style.bg,
        color: 'white',
        padding: '0.25rem 0.75rem',
        borderRadius: '20px',
        fontSize: '0.8rem',
        marginLeft: '0.5rem'
      }}>
        <i className={`fas ${style.icon}`}></i> {type}
      </span>
    )
  }

  return (
    <>
      <Navbar links={navLinks} />

      <div className="container">
        <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
          <h1 style={{ fontSize: '2.5rem', marginBottom: '0.5rem' }}>
            <i className="fas fa-calendar-alt" style={{ color: 'var(--primary)', marginRight: '0.5rem' }}></i>
            Events & Tournaments
          </h1>
          <p style={{ color: 'var(--gray)' }}>Join exciting gaming events, tournaments, and giveaways!</p>
        </div>

        {selectedEvent ? (
          <div className="card" style={{ padding: '2rem' }}>
            <button 
              onClick={() => setSelectedEvent(null)} 
              className="btn btn-secondary"
              style={{ marginBottom: '1.5rem' }}
            >
              <i className="fas fa-arrow-left"></i> Back to Events
            </button>

            {selectedEvent.banner_image && (
              <img 
                src={selectedEvent.banner_image} 
                alt={selectedEvent.title}
                style={{ width: '100%', maxHeight: '300px', objectFit: 'cover', borderRadius: '8px', marginBottom: '1.5rem' }}
              />
            )}

            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1rem' }}>
              <h2>{selectedEvent.title}</h2>
              {getStatusBadge(selectedEvent.status)}
              {getEventTypeBadge(selectedEvent.event_type)}
            </div>

            <p style={{ fontSize: '1.1rem', marginBottom: '1.5rem' }}>{selectedEvent.description}</p>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', marginBottom: '1.5rem' }}>
              <div className="stat-card">
                <i className="fas fa-clock" style={{ color: 'var(--primary)' }}></i>
                <strong>Starts:</strong> {new Date(selectedEvent.start_date).toLocaleString()}
              </div>
              <div className="stat-card">
                <i className="fas fa-flag-checkered" style={{ color: 'var(--danger)' }}></i>
                <strong>Ends:</strong> {new Date(selectedEvent.end_date).toLocaleString()}
              </div>
              <div className="stat-card">
                <i className="fas fa-users" style={{ color: 'var(--success)' }}></i>
                <strong>Participants:</strong> {selectedEvent.registrations?.length || 0}
                {selectedEvent.max_participants && ` / ${selectedEvent.max_participants}`}
              </div>
            </div>

            {selectedEvent.prizes && (
              <div style={{ background: 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)', padding: '1.5rem', borderRadius: '8px', marginBottom: '1.5rem' }}>
                <h3><i className="fas fa-trophy" style={{ color: '#f39c12' }}></i> Prizes</h3>
                <p>{selectedEvent.prizes}</p>
              </div>
            )}

            {currentUser && currentUser.type === 'user' && (selectedEvent.status === 'UPCOMING' || selectedEvent.status === 'ONGOING') && (
              <button 
                onClick={() => registerForEvent(selectedEvent.event_id)}
                className="btn btn-primary"
                disabled={selectedEvent.userRegistered}
                style={{ marginBottom: '1.5rem' }}
              >
                {selectedEvent.userRegistered ? (
                  <><i className="fas fa-check"></i> Registered</>
                ) : (
                  <><i className="fas fa-user-plus"></i> Register Now</>
                )}
              </button>
            )}

            {selectedEvent.registrations && selectedEvent.registrations.length > 0 && (
              <div>
                <h3>Participants {selectedEvent.status === 'COMPLETED' && '& Results'}</h3>
                <div style={{ display: 'grid', gap: '0.5rem' }}>
                  {selectedEvent.registrations.map((reg, index) => (
                    <div key={reg.user_id} style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      padding: '0.75rem',
                      background: reg.placement && reg.placement <= 3 ? 
                        reg.placement === 1 ? 'linear-gradient(135deg, #ffeaa7, #fdcb6e)' :
                        reg.placement === 2 ? 'linear-gradient(135deg, #dfe6e9, #b2bec3)' :
                        'linear-gradient(135deg, #ffecd2, #fcb69f)' : 
                        'var(--light)',
                      borderRadius: '8px'
                    }}>
                      <span>
                        {reg.placement && <strong>#{reg.placement}</strong>} {reg.username}
                      </span>
                      <span style={{ color: 'var(--gray)' }}>
                        Joined {new Date(reg.registered_at).toLocaleDateString()}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        ) : (
          <>
            {loading ? (
              <div style={{ textAlign: 'center', padding: '3rem' }}>
                <i className="fas fa-spinner fa-spin fa-3x" style={{ color: 'var(--primary)' }}></i>
                <p>Loading events...</p>
              </div>
            ) : events.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '3rem' }}>
                <i className="fas fa-calendar-times fa-3x" style={{ color: 'var(--gray)', marginBottom: '1rem' }}></i>
                <p>No events scheduled at the moment. Check back soon!</p>
              </div>
            ) : (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))', gap: '1.5rem' }}>
                {events.map(event => (
                  <div key={event.event_id} className="card" style={{ 
                    cursor: 'pointer',
                    transition: 'transform 0.2s, box-shadow 0.2s',
                    overflow: 'hidden'
                  }}
                  onClick={() => viewEvent(event.event_id)}
                  onMouseOver={(e) => { e.currentTarget.style.transform = 'translateY(-5px)'; e.currentTarget.style.boxShadow = '0 10px 30px rgba(0,0,0,0.15)' }}
                  onMouseOut={(e) => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = '' }}
                  >
                    {event.banner_image && (
                      <img 
                        src={event.banner_image} 
                        alt={event.title}
                        style={{ width: '100%', height: '150px', objectFit: 'cover' }}
                      />
                    )}
                    <div style={{ padding: '1.5rem' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.75rem' }}>
                        <h3 style={{ margin: 0 }}>{event.title}</h3>
                        {getStatusBadge(event.status)}
                      </div>
                      
                      <div style={{ marginBottom: '0.75rem' }}>
                        {getEventTypeBadge(event.event_type)}
                      </div>

                      <p style={{ color: 'var(--gray)', marginBottom: '1rem', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                        {event.description}
                      </p>

                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.9rem', color: 'var(--gray)' }}>
                        <span><i className="fas fa-users"></i> {event.participant_count} joined</span>
                        <span><i className="fas fa-clock"></i> {new Date(event.start_date).toLocaleDateString()}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </>
        )}
      </div>
    </>
  )
}

export default Events
