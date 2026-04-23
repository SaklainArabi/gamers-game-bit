import { Link } from 'react-router-dom'

function Navbar({ links, showLogout, onLogout, userInfo, isAdmin }) {
  return (
    <nav className="navbar">
      <div className="nav-container">
        <Link to="/" className="logo">
          <i className="fas fa-gamepad"></i> Gamers' Gambit{isAdmin ? ' - Admin' : ''}
        </Link>
        <div className="nav-links">
          {links.map((link, i) => (
            <Link key={i} to={link.to}>{link.label}</Link>
          ))}
          {userInfo && <span style={{ color: 'white', marginLeft: '1rem' }}>{userInfo}</span>}
          {showLogout && (
            <button onClick={onLogout} className="btn btn-small btn-danger">Logout</button>
          )}
        </div>
      </div>
    </nav>
  )
}

export default Navbar
