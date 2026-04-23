import { useState, useEffect } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import Navbar from '../components/Navbar'

const navLinks = [
  { to: '/', label: 'Home' },
  { to: '/about', label: 'About' },
  { to: '/events', label: 'Events' },
  { to: '/leaderboard', label: 'Leaderboard' },
  { to: '/help', label: 'Help' }
]

function GameComparison() {
  const navigate = useNavigate()
  const [games, setGames] = useState([])
  const [loading, setLoading] = useState(true)
  const [allListings, setAllListings] = useState([])
  const [showAddModal, setShowAddModal] = useState(false)

  useEffect(() => {
    loadComparisonGames()
    loadAllListings()
  }, [])

  async function loadComparisonGames() {
    setLoading(true)
    const savedList = localStorage.getItem('compareList')
    if (!savedList) {
      setLoading(false)
      return
    }

    const ids = JSON.parse(savedList)
    if (ids.length === 0) {
      setLoading(false)
      return
    }

    try {
      const res = await fetch('/api/compare?ids=' + ids.join(','))
      const data = await res.json()
      if (data.success) {
        setGames(data.games)
      }
    } catch (err) {
      console.error('Error loading comparison:', err)
    }
    setLoading(false)
  }

  async function loadAllListings() {
    try {
      const res = await fetch('/api/listings')
      const data = await res.json()
      if (data.success) {
        setAllListings(data.listings.filter(l => l.status === 'AVAILABLE' || l.status === 'OUT_OF_STOCK'))
      }
    } catch (err) {
      console.error('Error loading listings:', err)
    }
  }

  function addGame(listingId) {
    const savedList = localStorage.getItem('compareList')
    let ids = savedList ? JSON.parse(savedList) : []

    if (ids.includes(listingId)) {
      alert('Game already in comparison')
      return
    }
    if (ids.length >= 4) {
      alert('Maximum 4 games can be compared')
      return
    }

    ids.push(listingId)
    localStorage.setItem('compareList', JSON.stringify(ids))
    setShowAddModal(false)
    loadComparisonGames()
  }

  function removeGame(listingId) {
    const savedList = localStorage.getItem('compareList')
    if (!savedList) return

    let ids = JSON.parse(savedList).filter(id => id !== listingId)
    localStorage.setItem('compareList', JSON.stringify(ids))
    setGames(games.filter(g => g.listing_id !== listingId))
  }

  function clearAll() {
    localStorage.removeItem('compareList')
    setGames([])
  }

  function renderStars(rating) {
    return (
      <span style={{ color: '#f39c12' }}>
        {[1, 2, 3, 4, 5].map(star => (
          <i key={star} className={`fa${star <= rating ? 's' : 'r'} fa-star`}></i>
        ))}
      </span>
    )
  }

  function getLowestPrice() {
    if (games.length === 0) return null
    return Math.min(...games.map(g => parseFloat(g.price)))
  }

  function getHighestRated() {
    if (games.length === 0) return null
    return Math.max(...games.map(g => g.rating_avg || 0))
  }

  if (loading) {
    return (
      <>
        <Navbar links={navLinks} />
        <div className="container" style={{ textAlign: 'center', padding: '5rem' }}>
          <i className="fas fa-spinner fa-spin fa-3x" style={{ color: 'var(--primary)' }}></i>
          <p>Loading comparison...</p>
        </div>
      </>
    )
  }

  const lowestPrice = getLowestPrice()
  const highestRated = getHighestRated()

  return (
    <>
      <Navbar links={navLinks} />

      <div className="container">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem', flexWrap: 'wrap', gap: '1rem' }}>
          <h1><i className="fas fa-balance-scale" style={{ color: 'var(--primary)' }}></i> Compare Games</h1>
          <div style={{ display: 'flex', gap: '0.5rem' }}>
            {games.length < 4 && (
              <button onClick={() => setShowAddModal(true)} className="btn btn-primary">
                <i className="fas fa-plus"></i> Add Game
              </button>
            )}
            {games.length > 0 && (
              <button onClick={clearAll} className="btn btn-secondary">
                <i className="fas fa-trash"></i> Clear All
              </button>
            )}
          </div>
        </div>

        {games.length === 0 ? (
          <div className="card" style={{ padding: '4rem', textAlign: 'center' }}>
            <i className="fas fa-balance-scale fa-4x" style={{ color: 'var(--gray)', marginBottom: '1rem' }}></i>
            <h2>No games to compare</h2>
            <p style={{ color: 'var(--gray)', marginBottom: '1.5rem' }}>
              Add games to your comparison list to see them side by side.
              You can add up to 4 games.
            </p>
            <button onClick={() => setShowAddModal(true)} className="btn btn-primary">
              <i className="fas fa-plus"></i> Add Your First Game
            </button>
          </div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', background: 'var(--dark)', borderRadius: '8px', overflow: 'hidden' }}>
              <thead>
                <tr>
                  <th style={{ padding: '1rem', background: 'var(--primary)', color: 'white', textAlign: 'left', minWidth: '150px' }}>
                    Feature
                  </th>
                  {games.map(game => (
                    <th key={game.listing_id} style={{ padding: '1rem', background: 'var(--primary)', color: 'white', textAlign: 'center', minWidth: '200px' }}>
                      <button 
                        onClick={() => removeGame(game.listing_id)}
                        style={{ 
                          background: 'rgba(255,255,255,0.2)', 
                          border: 'none', 
                          color: 'white', 
                          borderRadius: '50%',
                          width: '24px',
                          height: '24px',
                          cursor: 'pointer',
                          float: 'right'
                        }}
                        title="Remove from comparison"
                      >
                        <i className="fas fa-times"></i>
                      </button>
                      <Link to={`/game/${game.listing_id}`} style={{ color: 'white' }}>
                        {game.game_name}
                      </Link>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {/* Price Row */}
                <tr>
                  <td style={{ padding: '1rem', borderBottom: '1px solid var(--light)', fontWeight: 'bold' }}>
                    <i className="fas fa-tag" style={{ color: 'var(--success)', marginRight: '0.5rem' }}></i> Price
                  </td>
                  {games.map(game => {
                    const price = parseFloat(game.price)
                    const isLowest = price === lowestPrice
                    return (
                      <td key={game.listing_id} style={{ 
                        padding: '1rem', 
                        borderBottom: '1px solid var(--light)', 
                        textAlign: 'center',
                        background: isLowest ? 'rgba(46, 204, 113, 0.1)' : 'transparent'
                      }}>
                        <span style={{ 
                          fontSize: '1.25rem', 
                          fontWeight: 'bold',
                          color: isLowest ? 'var(--success)' : 'inherit'
                        }}>
                          ${price.toFixed(2)}
                        </span>
                        {isLowest && games.length > 1 && (
                          <span style={{ 
                            display: 'block', 
                            fontSize: '0.75rem', 
                            color: 'var(--success)',
                            marginTop: '0.25rem'
                          }}>
                            <i className="fas fa-check"></i> Best Price
                          </span>
                        )}
                      </td>
                    )
                  })}
                </tr>

                {/* Rating Row */}
                <tr>
                  <td style={{ padding: '1rem', borderBottom: '1px solid var(--light)', fontWeight: 'bold' }}>
                    <i className="fas fa-star" style={{ color: '#f39c12', marginRight: '0.5rem' }}></i> Rating
                  </td>
                  {games.map(game => {
                    const rating = game.rating_avg || 0
                    const isHighest = rating === highestRated && rating > 0
                    return (
                      <td key={game.listing_id} style={{ 
                        padding: '1rem', 
                        borderBottom: '1px solid var(--light)', 
                        textAlign: 'center',
                        background: isHighest ? 'rgba(243, 156, 18, 0.1)' : 'transparent'
                      }}>
                        {rating > 0 ? (
                          <>
                            {renderStars(Math.round(rating))}
                            <span style={{ display: 'block', marginTop: '0.25rem' }}>
                              {rating.toFixed(1)} ({game.rating_count || 0} reviews)
                            </span>
                            {isHighest && games.length > 1 && (
                              <span style={{ 
                                display: 'block', 
                                fontSize: '0.75rem', 
                                color: '#f39c12',
                                marginTop: '0.25rem'
                              }}>
                                <i className="fas fa-trophy"></i> Top Rated
                              </span>
                            )}
                          </>
                        ) : (
                          <span style={{ color: 'var(--gray)' }}>No ratings yet</span>
                        )}
                      </td>
                    )
                  })}
                </tr>

                {/* Category Row */}
                <tr>
                  <td style={{ padding: '1rem', borderBottom: '1px solid var(--light)', fontWeight: 'bold' }}>
                    <i className="fas fa-folder" style={{ color: 'var(--primary)', marginRight: '0.5rem' }}></i> Category
                  </td>
                  {games.map(game => (
                    <td key={game.listing_id} style={{ padding: '1rem', borderBottom: '1px solid var(--light)', textAlign: 'center' }}>
                      {game.category_name ? (
                        <span style={{ 
                          background: 'var(--primary)', 
                          color: 'white', 
                          padding: '0.25rem 0.75rem', 
                          borderRadius: '20px',
                          fontSize: '0.85rem'
                        }}>
                          {game.category_name}
                        </span>
                      ) : (
                        <span style={{ color: 'var(--gray)' }}>Uncategorized</span>
                      )}
                    </td>
                  ))}
                </tr>

                {/* Seller Row */}
                <tr>
                  <td style={{ padding: '1rem', borderBottom: '1px solid var(--light)', fontWeight: 'bold' }}>
                    <i className="fas fa-user" style={{ color: 'var(--secondary)', marginRight: '0.5rem' }}></i> Seller
                  </td>
                  {games.map(game => (
                    <td key={game.listing_id} style={{ padding: '1rem', borderBottom: '1px solid var(--light)', textAlign: 'center' }}>
                      {game.seller_name}
                    </td>
                  ))}
                </tr>

                {/* Views Row */}
                <tr>
                  <td style={{ padding: '1rem', borderBottom: '1px solid var(--light)', fontWeight: 'bold' }}>
                    <i className="fas fa-eye" style={{ color: 'var(--info)', marginRight: '0.5rem' }}></i> Views
                  </td>
                  {games.map(game => (
                    <td key={game.listing_id} style={{ padding: '1rem', borderBottom: '1px solid var(--light)', textAlign: 'center' }}>
                      {game.view_count || 0}
                    </td>
                  ))}
                </tr>

                {/* Trailer Row */}
                <tr>
                  <td style={{ padding: '1rem', borderBottom: '1px solid var(--light)', fontWeight: 'bold' }}>
                    <i className="fas fa-video" style={{ color: 'var(--danger)', marginRight: '0.5rem' }}></i> Trailer
                  </td>
                  {games.map(game => (
                    <td key={game.listing_id} style={{ padding: '1rem', borderBottom: '1px solid var(--light)', textAlign: 'center' }}>
                      {game.trailer_url ? (
                        <a href={game.trailer_url} target="_blank" rel="noopener noreferrer" className="btn btn-secondary" style={{ padding: '0.5rem 1rem' }}>
                          <i className="fas fa-play"></i> Watch
                        </a>
                      ) : (
                        <span style={{ color: 'var(--gray)' }}>Not available</span>
                      )}
                    </td>
                  ))}
                </tr>

                {/* Description Row */}
                <tr>
                  <td style={{ padding: '1rem', fontWeight: 'bold', verticalAlign: 'top' }}>
                    <i className="fas fa-info-circle" style={{ color: 'var(--primary)', marginRight: '0.5rem' }}></i> Description
                  </td>
                  {games.map(game => (
                    <td key={game.listing_id} style={{ padding: '1rem', textAlign: 'center', verticalAlign: 'top' }}>
                      <p style={{ margin: 0, fontSize: '0.9rem', lineHeight: '1.6' }}>
                        {game.description ? (
                          game.description.length > 150 
                            ? game.description.substring(0, 150) + '...' 
                            : game.description
                        ) : (
                          <span style={{ color: 'var(--gray)' }}>No description</span>
                        )}
                      </p>
                    </td>
                  ))}
                </tr>

                {/* Action Row */}
                <tr>
                  <td style={{ padding: '1rem', fontWeight: 'bold' }}>
                    <i className="fas fa-shopping-cart" style={{ color: 'var(--success)', marginRight: '0.5rem' }}></i> Action
                  </td>
                  {games.map(game => (
                    <td key={game.listing_id} style={{ padding: '1rem', textAlign: 'center' }}>
                      <Link 
                        to={`/game/${game.listing_id}`} 
                        className="btn btn-primary" 
                        style={{ display: 'block', marginBottom: '0.5rem' }}
                      >
                        <i className="fas fa-eye"></i> View Details
                      </Link>
                    </td>
                  ))}
                </tr>
              </tbody>
            </table>
          </div>
        )}

        <div style={{ textAlign: 'center', marginTop: '2rem' }}>
          <Link to="/" className="btn btn-secondary">
            <i className="fas fa-arrow-left"></i> Back to Home
          </Link>
        </div>
      </div>

      {/* Add Game Modal */}
      {showAddModal && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(0,0,0,0.8)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000
        }}>
          <div className="card" style={{ 
            padding: '2rem', 
            maxWidth: '600px', 
            width: '90%', 
            maxHeight: '80vh',
            overflow: 'auto'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
              <h2><i className="fas fa-plus-circle" style={{ color: 'var(--primary)' }}></i> Add Game to Compare</h2>
              <button 
                onClick={() => setShowAddModal(false)}
                style={{ background: 'none', border: 'none', fontSize: '1.5rem', cursor: 'pointer', color: 'var(--gray)' }}
              >
                <i className="fas fa-times"></i>
              </button>
            </div>

            {allListings.length === 0 ? (
              <p style={{ textAlign: 'center', color: 'var(--gray)' }}>No games available</p>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                {allListings.map(listing => {
                  const savedList = localStorage.getItem('compareList')
                  const ids = savedList ? JSON.parse(savedList) : []
                  const isInList = ids.includes(listing.listing_id)

                  return (
                    <div 
                      key={listing.listing_id}
                      style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        padding: '1rem',
                        background: isInList ? 'var(--light)' : 'transparent',
                        borderRadius: '8px',
                        border: '1px solid var(--light)'
                      }}
                    >
                      <div>
                        <strong>{listing.game_name}</strong>
                        <span style={{ marginLeft: '0.5rem', color: 'var(--success)' }}>
                          ${parseFloat(listing.price).toFixed(2)}
                        </span>
                      </div>
                      <button
                        onClick={() => addGame(listing.listing_id)}
                        className="btn btn-primary"
                        style={{ padding: '0.5rem 1rem' }}
                        disabled={isInList}
                      >
                        {isInList ? (
                          <><i className="fas fa-check"></i> Added</>
                        ) : (
                          <><i className="fas fa-plus"></i> Add</>
                        )}
                      </button>
                    </div>
                  )
                })}
              </div>
            )}
          </div>
        </div>
      )}
    </>
  )
}

export default GameComparison
