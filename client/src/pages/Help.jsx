import { useState, useEffect, useRef } from 'react'
import { Link } from 'react-router-dom'
import Navbar from '../components/Navbar'

const navLinks = [
  { to: '/', label: 'Home' },
  { to: '/about', label: 'About' },
  { to: '/events', label: 'Events' },
  { to: '/leaderboard', label: 'Leaderboard' }
]

const faqs = [
  { q: 'How do I buy a game?', a: 'Browse the marketplace, find a game you like, and click "Buy". Make sure you have enough balance in your account.' },
  { q: 'How do I sell a game?', a: 'Go to your dashboard, click "Sell Game", fill in the details including your game key, and submit. An admin will review and approve your listing.' },
  { q: 'How do subscriptions work?', a: 'Subscribe to get discounts on all purchases. Basic gives 10% off, Pro gives 20% off, and Elite gives 30% off.' },
  { q: 'How do I add balance?', a: 'Request a balance addition from your dashboard. An admin will review and approve your request.' },
  { q: 'What is the referral program?', a: 'Share your referral code with friends. When they sign up using your code, you get $100 and they get $200 bonus!' }
]

function Help() {
  const [currentUser, setCurrentUser] = useState(null)
  const [questions, setQuestions] = useState([])
  const [questionText, setQuestionText] = useState('')
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('faq')
  const askSectionRef = useRef(null)

  useEffect(() => {
    checkAuth()
  }, [])

  async function checkAuth() {
    try {
      const res = await fetch('/api/check-session')
      const data = await res.json()
      if (data.success) setCurrentUser(data.user)
    } catch (_) {}
    loadQuestions()
    setLoading(false)
  }

  async function loadQuestions() {
    try {
      const res = await fetch('/api/help/questions')
      const data = await res.json()
      setQuestions(data.questions || [])
    } catch (_) {
      setQuestions([])
    }
  }

  async function handleSubmitQuestion(e) {
    e.preventDefault()
    try {
      const res = await fetch('/api/help/ask', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ question: questionText })
      })
      const data = await res.json()
      if (data.success) {
        alert('Question submitted successfully! An admin will answer soon.')
        setQuestionText('')
        loadQuestions()
      } else {
        alert(data.message || 'Error submitting question')
      }
    } catch (_) {
      alert('Error submitting question')
    }
  }

  function scrollToAskQuestion() {
    setActiveTab('ask')
    setTimeout(() => {
      if (askSectionRef.current) {
        askSectionRef.current.scrollIntoView({ behavior: 'smooth' })
      }
    }, 100)
  }

  if (loading) return null

  return (
    <>
      <Navbar links={navLinks} />

      <section className="hero" style={{ padding: '60px 0' }}>
        <div className="container">
          <h1><i className="fas fa-question-circle"></i> Help Center</h1>
          <p>Find answers, ask questions, or chat with our support team</p>
        </div>
      </section>

      <section className="features">
        <div className="container">
          {/* Tab Navigation */}
          <div style={{ display: 'flex', justifyContent: 'center', gap: '1rem', marginBottom: '2rem', flexWrap: 'wrap' }}>
            <button 
              onClick={() => setActiveTab('faq')}
              className={`btn ${activeTab === 'faq' ? 'btn-primary' : 'btn-secondary'}`}
            >
              <i className="fas fa-book"></i> FAQs
            </button>
            <button 
              onClick={() => setActiveTab('questions')}
              className={`btn ${activeTab === 'questions' ? 'btn-primary' : 'btn-secondary'}`}
            >
              <i className="fas fa-comments"></i> Q&A Forum
            </button>
            {currentUser && (
              <button 
                onClick={() => setActiveTab('ask')}
                className={`btn ${activeTab === 'ask' ? 'btn-primary' : 'btn-secondary'}`}
              >
                <i className="fas fa-question"></i> Ask Question
              </button>
            )}
          </div>

          {/* FAQ Section */}
          {activeTab === 'faq' && (
            <div style={{ maxWidth: '800px', margin: '0 auto' }}>
              <h2 style={{ marginBottom: '1.5rem' }}><i className="fas fa-book" style={{ color: 'var(--primary)' }}></i> Frequently Asked Questions</h2>
              {faqs.map((faq, index) => (
                <div key={index} style={{ 
                  background: 'white', 
                  padding: '1.5rem', 
                  borderRadius: '8px', 
                  marginBottom: '1rem',
                  boxShadow: '0 2px 10px rgba(0,0,0,0.05)'
                }}>
                  <h3 style={{ color: 'var(--primary)', marginBottom: '0.5rem' }}>
                    <i className="fas fa-chevron-right"></i> {faq.q}
                  </h3>
                  <p style={{ color: 'var(--gray)', margin: 0 }}>{faq.a}</p>
                </div>
              ))}

              <div style={{ textAlign: 'center', marginTop: '2rem' }}>
                <p style={{ color: 'var(--gray)', marginBottom: '1rem' }}>Can't find what you're looking for?</p>
                {currentUser ? (
                  <button onClick={() => setActiveTab('ask')} className="btn btn-primary">
                    <i className="fas fa-question"></i> Ask a Question
                  </button>
                ) : (
                  <Link to="/login" className="btn btn-primary">
                    <i className="fas fa-sign-in-alt"></i> Login to Ask
                  </Link>
                )}
              </div>
            </div>
          )}

          {/* Questions Section */}
          {activeTab === 'questions' && (
            <div style={{ maxWidth: '800px', margin: '0 auto' }}>
              <h2 style={{ marginBottom: '1.5rem' }}><i className="fas fa-list" style={{ color: 'var(--primary)' }}></i> Community Questions</h2>

              {questions.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '3rem', background: 'white', borderRadius: '8px' }}>
                  <i className="fas fa-inbox fa-3x" style={{ color: 'var(--gray)', marginBottom: '1rem' }}></i>
                  <p style={{ color: 'var(--gray)' }}>No questions yet. Be the first to ask!</p>
                </div>
              ) : (
                questions.map(q => (
                  <div key={q.question_id} style={{ background: 'white', padding: '1.5rem', borderRadius: '8px', marginBottom: '1rem', boxShadow: '0 5px 15px rgba(0,0,0,0.05)' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start' }}>
                      <div>
                        <p style={{ color: 'var(--primary)', fontWeight: 'bold', marginBottom: '0.5rem' }}>
                          <i className="fas fa-user"></i> {q.username}
                        </p>
                        <p style={{ color: 'var(--dark)', fontSize: '1.1rem' }}>{q.question}</p>
                      </div>
                      <small style={{ color: 'var(--gray)', whiteSpace: 'nowrap' }}>{new Date(q.created_at).toLocaleDateString()}</small>
                    </div>

                    {q.answer ? (
                      <div style={{ background: 'var(--light)', padding: '1rem', borderRadius: '8px', marginTop: '1rem', borderLeft: '4px solid var(--success)' }}>
                        <p style={{ color: 'var(--success)', fontWeight: 'bold', marginBottom: '0.5rem' }}>
                          <i className="fas fa-check-circle"></i> Admin Answer:
                        </p>
                        <p style={{ color: 'var(--dark)' }}>{q.answer}</p>
                        {q.answered_at && <small style={{ color: 'var(--gray)' }}>Answered on {new Date(q.answered_at).toLocaleString()}</small>}
                      </div>
                    ) : (
                      <div style={{ background: '#fff3cd', padding: '1rem', borderRadius: '8px', marginTop: '1rem', borderLeft: '4px solid #f39c12' }}>
                        <p style={{ color: '#856404' }}><i className="fas fa-clock"></i> Waiting for admin response...</p>
                      </div>
                    )}
                  </div>
                ))
              )}
            </div>
          )}

          {/* Ask Question Section */}
          {activeTab === 'ask' && currentUser && (
            <div ref={askSectionRef} style={{ maxWidth: '700px', margin: '0 auto' }}>
              <div className="form-container" style={{ margin: 0, maxWidth: '100%' }}>
                <h2><i className="fas fa-question"></i> Ask a Question</h2>
                <p style={{ color: 'var(--gray)', marginBottom: '1.5rem' }}>
                  Your question will be visible to the community and answered by an admin.
                </p>
                <form onSubmit={handleSubmitQuestion}>
                  <div className="form-group">
                    <label>Your Question</label>
                    <textarea
                      rows="4"
                      required
                      placeholder="Type your question here... Be specific for better answers!"
                      value={questionText}
                      onChange={e => setQuestionText(e.target.value)}
                    />
                  </div>
                  <button type="submit" className="btn btn-primary" style={{ width: '100%' }}>
                    <i className="fas fa-paper-plane"></i> Submit Question
                  </button>
                </form>
              </div>
            </div>
          )}

          {!currentUser && activeTab === 'ask' && (
            <div style={{ textAlign: 'center', padding: '3rem' }}>
              <p style={{ color: 'var(--gray)', marginBottom: '1rem' }}>Please login to ask questions</p>
              <Link to="/login" className="btn btn-primary"><i className="fas fa-sign-in-alt"></i> Login</Link>
              {' '}
              <Link to="/register" className="btn btn-secondary"><i className="fas fa-user-plus"></i> Register</Link>
            </div>
          )}
        </div>
      </section>

      {/* Floating Ask Question Button */}
      {currentUser && (
        <button
          onClick={scrollToAskQuestion}
          style={{
            position: 'fixed',
            bottom: '2rem',
            right: '2rem',
            width: '60px',
            height: '60px',
            borderRadius: '50%',
            background: 'var(--primary)',
            color: 'white',
            border: 'none',
            cursor: 'pointer',
            fontSize: '1.5rem',
            boxShadow: '0 4px 15px rgba(0,0,0,0.3)',
            zIndex: 1000,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}
          title="Ask a Question"
        >
          <i className="fas fa-question"></i>
        </button>
      )}
    </>
  )
}

export default Help
