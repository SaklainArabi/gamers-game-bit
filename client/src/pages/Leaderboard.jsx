import { useState, useEffect } from 'react'
import Navbar from '../components/Navbar'

const navLinks = [
  { to: '/', label: 'Home' },
  { to: '/about', label: 'About' },
  { to: '/events', label: 'Events' },
  { to: '/leaderboard', label: 'Leaderboard' },
  { to: '/help', label: 'Help' }
]

function Leaderboard() {
  const [leaderboard, setLeaderboard] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadLeaderboard()
  }, [])

  async function loadLeaderboard() {
    setLoading(true)
    try {
      const res = await fetch('/api/leaderboard')
      const data = await res.json()
      if (data.success) {
        setLeaderboard(data.leaderboard)
      }
    } catch (err) {
      console.error('Error loading leaderboard:', err)
    }
    setLoading(false)
  }

  function getRankStyle(rank) {
    if (rank === 1) return { background: 'linear-gradient(135deg, #ffeaa7, #fdcb6e)', border: '2px solid #f39c12' }
    if (rank === 2) return { background: 'linear-gradient(135deg, #dfe6e9, #b2bec3)', border: '2px solid #95a5a6' }
    if (rank === 3) return { background: 'linear-gradient(135deg, #ffecd2, #fcb69f)', border: '2px solid #e17055' }
    return { background: 'white', border: '1px solid #dfe6e9' }
  }

  function getRankIcon(rank) {
    if (rank === 1) return <span style={{ fontSize: '2rem' }}>🥇</span>
    if (rank === 2) return <span style={{ fontSize: '2rem' }}>🥈</span>
    if (rank === 3) return <span style={{ fontSize: '2rem' }}>🥉</span>
    return <span style={{ fontSize: '1.5rem', fontWeight: 'bold', color: 'var(--primary)' }}>#{rank}</span>
  }

  return (
    <>
      <Navbar links={navLinks} />

      <section className="hero" style={{ padding: '60px 0' }}>
        <div className="container">
          <h1 style={{ marginBottom: '1rem' }}>
            <i className="fas fa-trophy" style={{ marginRight: '0.5rem' }}></i>
            Top Sellers Leaderboard
          </h1>
          <p>The most successful game sellers on Gamers' Gambit</p>
        </div>
      </section>

      <div className="container">
        {loading ? (
          <div style={{ textAlign: 'center', padding: '3rem' }}>
            <i className="fas fa-spinner fa-spin fa-3x" style={{ color: 'var(--primary)' }}></i>
            <p>Loading leaderboard...</p>
          </div>
        ) : leaderboard.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '3rem' }}>
            <i className="fas fa-chart-line fa-3x" style={{ color: 'var(--gray)', marginBottom: '1rem' }}></i>
            <h3>No sellers yet</h3>
            <p>Be the first to sell games and top the leaderboard!</p>
          </div>
        ) : (
          <>
            {/* Top 3 Podium */}
            <div style={{ 
              display: 'flex', 
              justifyContent: 'center', 
              alignItems: 'flex-end', 
              gap: '1rem', 
              marginBottom: '3rem',
              flexWrap: 'wrap'
            }}>
              {/* 2nd Place */}
              {leaderboard[1] && (
                <div style={{ 
                  textAlign: 'center', 
                  padding: '1.5rem', 
                  borderRadius: '12px',
                  ...getRankStyle(2),
                  width: '200px',
                  minHeight: '180px'
                }}>
                  {getRankIcon(2)}
                  <h3 style={{ margin: '0.5rem 0' }}>{leaderboard[1].username}</h3>
                  <p style={{ color: 'var(--success)', fontWeight: 'bold', fontSize: '1.2rem' }}>
                    ${parseFloat(leaderboard[1].total_sales).toFixed(2)}
                  </p>
                  <p style={{ color: 'var(--gray)', fontSize: '0.9rem' }}>
                    {leaderboard[1].games_sold} games sold
                  </p>
                </div>
              )}

              {/* 1st Place */}
              {leaderboard[0] && (
                <div style={{ 
                  textAlign: 'center', 
                  padding: '2rem', 
                  borderRadius: '12px',
                  ...getRankStyle(1),
                  width: '220px',
                  minHeight: '220px',
                  transform: 'scale(1.1)'
                }}>
                  {getRankIcon(1)}
                  <h3 style={{ margin: '0.5rem 0', fontSize: '1.3rem' }}>{leaderboard[0].username}</h3>
                  <p style={{ color: 'var(--success)', fontWeight: 'bold', fontSize: '1.5rem' }}>
                    ${parseFloat(leaderboard[0].total_sales).toFixed(2)}
                  </p>
                  <p style={{ color: 'var(--gray)', fontSize: '0.9rem' }}>
                    {leaderboard[0].games_sold} games sold
                  </p>
                  <p style={{ color: '#f39c12', fontSize: '0.8rem', marginTop: '0.5rem' }}>
                    <i className="fas fa-crown"></i> Top Seller
                  </p>
                </div>
              )}

              {/* 3rd Place */}
              {leaderboard[2] && (
                <div style={{ 
                  textAlign: 'center', 
                  padding: '1.5rem', 
                  borderRadius: '12px',
                  ...getRankStyle(3),
                  width: '200px',
                  minHeight: '160px'
                }}>
                  {getRankIcon(3)}
                  <h3 style={{ margin: '0.5rem 0' }}>{leaderboard[2].username}</h3>
                  <p style={{ color: 'var(--success)', fontWeight: 'bold', fontSize: '1.2rem' }}>
                    ${parseFloat(leaderboard[2].total_sales).toFixed(2)}
                  </p>
                  <p style={{ color: 'var(--gray)', fontSize: '0.9rem' }}>
                    {leaderboard[2].games_sold} games sold
                  </p>
                </div>
              )}
            </div>

            {/* Full Leaderboard Table */}
            {leaderboard.length > 3 && (
              <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                  <thead>
                    <tr style={{ background: 'var(--primary)', color: 'white' }}>
                      <th style={{ padding: '1rem', textAlign: 'center' }}>Rank</th>
                      <th style={{ padding: '1rem', textAlign: 'left' }}>Seller</th>
                      <th style={{ padding: '1rem', textAlign: 'center' }}>Games Sold</th>
                      <th style={{ padding: '1rem', textAlign: 'right' }}>Total Sales</th>
                    </tr>
                  </thead>
                  <tbody>
                    {leaderboard.slice(3).map((seller, index) => (
                      <tr key={seller.user_id} style={{ 
                        borderBottom: '1px solid #eee',
                        background: index % 2 === 0 ? 'white' : '#f9f9f9'
                      }}>
                        <td style={{ padding: '1rem', textAlign: 'center' }}>
                          {getRankIcon(index + 4)}
                        </td>
                        <td style={{ padding: '1rem' }}>
                          <strong>{seller.username}</strong>
                        </td>
                        <td style={{ padding: '1rem', textAlign: 'center' }}>
                          {seller.games_sold}
                        </td>
                        <td style={{ padding: '1rem', textAlign: 'right', color: 'var(--success)', fontWeight: 'bold' }}>
                          ${parseFloat(seller.total_sales).toFixed(2)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            <div style={{ textAlign: 'center', marginTop: '2rem', padding: '1.5rem', background: 'var(--light)', borderRadius: '8px' }}>
              <h3><i className="fas fa-info-circle" style={{ color: 'var(--primary)' }}></i> How to climb the leaderboard</h3>
              <p style={{ color: 'var(--gray)' }}>
                List your games for sale and make more sales to increase your ranking. 
                Top sellers get more visibility and trust from buyers!
              </p>
            </div>
          </>
        )}
      </div>
    </>
  )
}

export default Leaderboard
