import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import Navbar from '../components/Navbar'

const navLinks = [
  { to: '/', label: 'Home' },
  { to: '/register', label: 'Sign Up' },
  { to: '/admin-login', label: 'Admin' }
]

function Login() {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const navigate = useNavigate()

  async function handleSubmit(e) {
    e.preventDefault()
    try {
      const res = await fetch('/api/user/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password })
      })
      const data = await res.json()
      if (data.success) {
        alert('Login successful!')
        navigate('/user-dashboard')
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
          <h2><i className="fas fa-sign-in-alt"></i> User Login</h2>
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label><i className="fas fa-user"></i> Username:</label>
              <input type="text" value={username} onChange={e => setUsername(e.target.value)} required />
            </div>
            <div className="form-group">
              <label><i className="fas fa-lock"></i> Password:</label>
              <input type="password" value={password} onChange={e => setPassword(e.target.value)} required />
            </div>
            <button type="submit" className="btn btn-primary" style={{ width: '100%' }}>Login</button>
          </form>
          <p className="form-footer">Don't have an account? <Link to="/register">Sign up here</Link></p>
        </div>
      </div>
    </>
  )
}

export default Login
