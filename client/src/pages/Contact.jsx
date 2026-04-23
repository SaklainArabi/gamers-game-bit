import Navbar from '../components/Navbar'

const navLinks = [
  { to: '/', label: 'Home' },
  { to: '/about', label: 'About' },
  { to: '/contact', label: 'Contact Us' },
  { to: '/help', label: 'Help' }
]

function Contact() {
  return (
    <>
      <Navbar links={navLinks} />

      <section className="hero" style={{ padding: '60px 0' }}>
        <div className="container">
          <h1><i className="fas fa-envelope"></i> Contact Us</h1>
          <p>We'd love to hear from you</p>
        </div>
      </section>

      <section className="features">
        <div className="container">
          <div style={{ display: 'flex', gap: '2rem', flexWrap: 'wrap', justifyContent: 'center' }}>
            <div style={{ flex: 1, minWidth: '300px', maxWidth: '500px' }}>
              <div style={{ background: 'white', padding: '2rem', borderRadius: '8px', boxShadow: '0 5px 15px rgba(0,0,0,0.05)', marginBottom: '1.5rem' }}>
                <h3 style={{ color: 'var(--primary)', marginBottom: '1rem' }}><i className="fas fa-map-marker-alt"></i> Address</h3>
                <p style={{ color: 'var(--gray)' }}>857 Nazmul Villa, Pachtola Bazar, Post Office road, Middle badda, Dhaka -1212<br />Dhaka, Bangladesh 1000</p>
              </div>

              <div style={{ background: 'white', padding: '2rem', borderRadius: '8px', boxShadow: '0 5px 15px rgba(0,0,0,0.05)', marginBottom: '1.5rem' }}>
                <h3 style={{ color: 'var(--primary)', marginBottom: '1rem' }}><i className="fas fa-phone"></i> Phone</h3>
                <p style={{ color: 'var(--gray)' }}>+8801966350644</p>
              </div>

              <div style={{ background: 'white', padding: '2rem', borderRadius: '8px', boxShadow: '0 5px 15px rgba(0,0,0,0.05)', marginBottom: '1.5rem' }}>
                <h3 style={{ color: 'var(--primary)', marginBottom: '1rem' }}><i className="fas fa-envelope"></i> Email</h3>
                <p style={{ color: 'var(--gray)' }}>support@gamersgambit.com</p>
              </div>

              <div style={{ background: 'white', padding: '2rem', borderRadius: '8px', boxShadow: '0 5px 15px rgba(0,0,0,0.05)' }}>
                <h3 style={{ color: 'var(--primary)', marginBottom: '1rem' }}><i className="fas fa-clock"></i> Hours</h3>
                <p style={{ color: 'var(--gray)' }}>Monday - Friday: 9AM - 6PM<br />Saturday: 10AM - 4PM<br />Sunday: Closed</p>
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  )
}

export default Contact
