import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import Navbar from '../components/Navbar'

const navLinks = [
  { to: '/', label: 'Home' },
  { to: '/login', label: 'Login' },
  { to: '/admin-login', label: 'Admin' }
]

function Register() {
  const [username, setUsername] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [referralCode, setReferralCode] = useState('')
  const [hasReferral, setHasReferral] = useState(false)
  const navigate = useNavigate()

  async function handleSubmit(e) {
    e.preventDefault()
    try {
      const res = await fetch('/api/user/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          username, 
          email, 
          password,
          referralCode: hasReferral ? referralCode : null
        })
      })
      const data = await res.json()
      if (data.success) {
        alert(data.message + ' Please login.')
        navigate('/login')
      } else {
        alert(data.message)
      }
    } catch (err) {
      alert('Error: ' + err.message)
    }
  }

  return (
    <>
      <Navbar links={navLinks} />
      <div className="container">
        <div className="form-container">
          <h2><i className="fas fa-user-plus"></i> User Registration</h2>
          
          {/* Referral Bonus Banner */}
          <div style={{ 
            background: 'linear-gradient(135deg, var(--success), #27ae60)', 
            padding: '1rem', 
            borderRadius: '8px', 
            marginBottom: '1.5rem',
            textAlign: 'center',
            color: 'white'
          }}>
            <i className="fas fa-gift" style={{ fontSize: '1.5rem', marginBottom: '0.5rem' }}></i>
            <p style={{ margin: 0, fontWeight: 'bold' }}>
              Have a referral code? Get $200 welcome bonus!
            </p>
          </div>

          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label><i className="fas fa-user"></i> Username:</label>
              <input type="text" value={username} onChange={e => setUsername(e.target.value)} required />
            </div>
            <div className="form-group">
              <label><i className="fas fa-envelope"></i> Email:</label>
              <input type="email" value={email} onChange={e => setEmail(e.target.value)} required />
            </div>
            <div className="form-group">
              <label><i className="fas fa-lock"></i> Password:</label>
              <input type="password" value={password} onChange={e => setPassword(e.target.value)} required />
            </div>
            
            {/* Referral Code Section */}
            <div className="form-group">
              <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <input 
                  type="checkbox" 
                  checked={hasReferral} 
                  onChange={e => setHasReferral(e.target.checked)}
                  style={{ width: 'auto' }}
                />
                <span><i className="fas fa-ticket-alt"></i> I have a referral code</span>
              </label>
            </div>
            
            {hasReferral && (
              <div className="form-group">
                <label><i className="fas fa-gift"></i> Referral Code:</label>
                <input 
                  type="text" 
                  value={referralCode} 
                  onChange={e => setReferralCode(e.target.value.toUpperCase())} 
                  placeholder="Enter referral code"
                  style={{ textTransform: 'uppercase' }}
                />
                <small style={{ color: 'var(--success)' }}>
                  <i className="fas fa-check-circle"></i> You'll get $200 bonus, and your friend gets $100!
                </small>
              </div>
            )}

            <button type="submit" className="btn btn-primary" style={{ width: '100%' }}>Register</button>
          </form>
          <p className="form-footer">Already have an account? <Link to="/login">Login here</Link></p>
        </div>
      </div>
    </>
  )
}

export default Register
