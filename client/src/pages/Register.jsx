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
  const navigate = useNavigate()

  async function handleSubmit(e) {
    e.preventDefault()
    try {
      const res = await fetch('/api/user/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, email, password })
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

            <button type="submit" className="btn btn-primary" style={{ width: '100%' }}>Register</button>
          </form>
          <p className="form-footer">Already have an account? <Link to="/login">Login here</Link></p>
        </div>
      </div>
    </>
  )
}

export default Register
