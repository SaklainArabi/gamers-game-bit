import { Link } from 'react-router-dom'
import Navbar from '../components/Navbar'

const navLinks = [
  { to: '/', label: 'Home' },
  { to: '/about', label: 'About' },
  { to: '/contact', label: 'Contact Us' },
  { to: '/help', label: 'Help' }
]

function About() {
  return (
    <>
      <Navbar links={navLinks} />

      <section className="hero" style={{ padding: '60px 0' }}>
        <div className="container">
          <h1><i className="fas fa-info-circle"></i> About Us</h1>
          <p>Learn more about Gamers' Gambit</p>
        </div>
      </section>

      <section className="features">
        <div className="container">
          <div className="about-content" style={{ maxWidth: '800px', margin: '0 auto' }}>
            <div className="about-section" style={{ background: 'white', padding: '2rem', borderRadius: '8px', marginBottom: '2rem', boxShadow: '0 5px 15px rgba(0,0,0,0.05)' }}>
              <h2 style={{ color: 'var(--primary)', marginBottom: '1rem' }}><i className="fas fa-gamepad"></i> Who We Are</h2>
              <p style={{ color: 'var(--gray)', lineHeight: '1.8' }}>
                Gamers' Gambit is a trusted platform where gamers can buy, sell, and trade video games safely.
                We connect gaming enthusiasts from around the world, providing a secure and easy-to-use marketplace
                for all your gaming needs.
              </p>
            </div>

            <div className="about-section" style={{ background: 'white', padding: '2rem', borderRadius: '8px', marginBottom: '2rem', boxShadow: '0 5px 15px rgba(0,0,0,0.05)' }}>
              <h2 style={{ color: 'var(--primary)', marginBottom: '1rem' }}><i className="fas fa-bullseye"></i> Our Mission</h2>
              <p style={{ color: 'var(--gray)', lineHeight: '1.8' }}>
                Our mission is to create the ultimate gaming community where players can easily find great deals
                on games, sell their unused titles, and connect with fellow gamers. We believe gaming should be
                accessible and affordable for everyone.
              </p>
            </div>

            <div className="about-section" style={{ background: 'white', padding: '2rem', borderRadius: '8px', marginBottom: '2rem', boxShadow: '0 5px 15px rgba(0,0,0,0.05)' }}>
              <h2 style={{ color: 'var(--primary)', marginBottom: '1rem' }}><i className="fas fa-shield-alt"></i> Why Choose Us</h2>
              <ul style={{ color: 'var(--gray)', lineHeight: '2', listStyle: 'none' }}>
                <li><i className="fas fa-check" style={{ color: 'var(--success)', marginRight: '10px' }}></i> Secure transactions with admin verification</li>
                <li><i className="fas fa-check" style={{ color: 'var(--success)', marginRight: '10px' }}></i> Wide variety of games available</li>
                <li><i className="fas fa-check" style={{ color: 'var(--success)', marginRight: '10px' }}></i> Active community discussions</li>
                <li><i className="fas fa-check" style={{ color: 'var(--success)', marginRight: '10px' }}></i> 24/7 customer support</li>
                <li><i className="fas fa-check" style={{ color: 'var(--success)', marginRight: '10px' }}></i> Easy-to-use platform</li>
              </ul>
            </div>

            <div style={{ textAlign: 'center', marginTop: '2rem' }}>
              <Link to="/login" className="btn btn-primary"><i className="fas fa-sign-in-alt"></i> Join Us Today</Link>
              {' '}
              <Link to="/register" className="btn btn-secondary"><i className="fas fa-user-plus"></i> Create Account</Link>
            </div>
          </div>
        </div>
      </section>
    </>
  )
}

export default About
