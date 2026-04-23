import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import Navbar from '../components/Navbar'

const navLinks = [
  { to: '/', label: 'Home' },
  { to: '/admin-login', label: 'Login' }
]

function AdminRegister() {
  const [username, setUsername] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const navigate = useNavigate()

  async function handleSubmit(e) {
    e.preventDefault()
    try {
      const res = await fetch('/api/admin/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, email, password })
      })
      const data = await res.json()
      if (data.success) {
        alert('Admin registration successful! Please login.')
        navigate('/admin-login')
      } else {
        alert(data.message)
      }
    } catch (err) {
      alert('Error: ' + err.message)
    }
  }

  return (
    <>
      <Navbar links={navLinks} isAdmin />
      <div className="container">
        <div className="form-container">
          <h2><i className="fas fa-user-shield"></i> Admin Registration</h2>
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label>Username:</label>
              <input type="text" value={username} onChange={e => setUsername(e.target.value)} required />
            </div>
            <div className="form-group">
              <label>Email:</label>
              <input type="email" value={email} onChange={e => setEmail(e.target.value)} required />
            </div>
            <div className="form-group">
              <label>Password:</label>
              <input type="password" value={password} onChange={e => setPassword(e.target.value)} required />
            </div>
            <button type="submit" className="btn btn-primary" style={{ width: '100%' }}>Register</button>
          </form>
          <p className="form-footer">Already have an account? <Link to="/admin-login">Login here</Link></p>
        </div>
      </div>
    </>
  )
}

export default AdminRegister
