import { useState, useEffect } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import Navbar from '../components/Navbar'

const navLinks = [
  { to: '/', label: 'Home' },
  { to: '/about', label: 'About' },
  { to: '/events', label: 'Events' },
  { to: '/leaderboard', label: 'Leaderboard' },
  { to: '/help', label: 'Help' }
]

function GameDetails() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [game, setGame] = useState(null)
  const [reviews, setReviews] = useState([])
  const [currentUser, setCurrentUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const [showReviewForm, setShowReviewForm] = useState(false)
  const [reviewRating, setReviewRating] = useState(5)
  const [reviewText, setReviewText] = useState('')
  const [compareList, setCompareList] = useState([])

  useEffect(() => {
    checkAuth()
    loadGame()
    const savedCompare = localStorage.getItem('compareList')
    if (savedCompare) setCompareList(JSON.parse(savedCompare))
  }, [id])

  async function checkAuth() {
    const res = await fetch('/api/check-session')
    const data = await res.json()
    if (data.success) {
      setCurrentUser(data.user)
    }
  }

  async function loadGame() {
    setLoading(true)
    try {
      const res = await fetch(`/api/listing/${id}`)
      const data = await res.json()
      if (data.success) {
        setGame(data.listing)
        setReviews(data.reviews || [])
      } else {
        alert('Game not found')
        navigate('/')
      }
    } catch (err) {
      console.error('Error loading game:', err)
    }
    setLoading(false)
  }

  async function buyGame() {
    if (!currentUser) {
      alert('Please login to buy games')
      navigate('/login')
      return
    }

    if (!confirm(`Buy "${game.game_name}" for $${game.price}?`)) return

    try {
      const res = await fetch('/api/listing/buy', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ listingId: game.listing_id })
      })
      const data = await res.json()
      if (data.success) {
        alert(`Purchase successful! Your game key: ${data.gameKey}${data.discount > 0 ? `\n\nYou saved ${data.discount}% with your subscription!` : ''}`)
        navigate('/user-dashboard')
      } else {
        alert(data.message)
      }
    } catch (err) {
      alert('Error processing purchase')
    }
  }

  async function addToWishlist() {
    if (!currentUser) {
      alert('Please login to add to wishlist')
      navigate('/login')
      return
    }

    try {
      const res = await fetch('/api/wishlist/add', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ gameName: game.game_name, listingId: game.listing_id })
      })
      const data = await res.json()
      if (data.success) {
        alert('Added to wishlist!')
      } else {
        alert(data.message)
      }
    } catch (err) {
      alert('Error adding to wishlist')
    }
  }

  async function submitReview(e) {
    e.preventDefault()
    
    try {
      const res = await fetch(`/api/listing/${id}/review`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ rating: reviewRating, reviewText })
      })
      const data = await res.json()
      if (data.success) {
        alert('Review submitted!')
        setShowReviewForm(false)
        setReviewText('')
        loadGame()
      } else {
        alert(data.message)
      }
    } catch (err) {
      alert('Error submitting review')
    }
  }

  function addToCompare() {
    if (compareList.includes(game.listing_id)) {
      const updated = compareList.filter(id => id !== game.listing_id)
      setCompareList(updated)
      localStorage.setItem('compareList', JSON.stringify(updated))
    } else {
      if (compareList.length >= 4) {
        alert('You can compare up to 4 games')
        return
      }
      const updated = [...compareList, game.listing_id]
      setCompareList(updated)
      localStorage.setItem('compareList', JSON.stringify(updated))
    }
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

  if (loading) {
    return (
      <>
        <Navbar links={navLinks} />
        <div className="container" style={{ textAlign: 'center', padding: '5rem' }}>
          <i className="fas fa-spinner fa-spin fa-3x" style={{ color: 'var(--primary)' }}></i>
          <p>Loading game details...</p>
        </div>
      </>
    )
  }

  if (!game) {
    return (
      <>
        <Navbar links={navLinks} />
        <div className="container" style={{ textAlign: 'center', padding: '5rem' }}>
          <h2>Game not found</h2>
          <Link to="/" className="btn btn-primary">Back to Home</Link>
        </div>
      </>
    )
  }

  // Handle screenshots - might be string, array, or null
  let screenshots = []
  if (game.screenshots) {
    if (typeof game.screenshots === 'string') {
      try {
        screenshots = JSON.parse(game.screenshots)
      } catch (e) {
        screenshots = []
      }
    } else if (Array.isArray(game.screenshots)) {
      screenshots = game.screenshots
    }
  }

  return (
    <>
      <Navbar links={navLinks} />

      <div className="container">
        <button onClick={() => navigate(-1)} className="btn btn-secondary" style={{ marginBottom: '1rem' }}>
          <i className="fas fa-arrow-left"></i> Back
        </button>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))', gap: '2rem' }}>
          {/* Left Column - Media */}
          <div>
            {/* Trailer */}
            {game.trailer_url && (
              <div style={{ marginBottom: '1.5rem' }}>
                <h3><i className="fas fa-play-circle" style={{ color: 'var(--primary)' }}></i> Trailer / Demo</h3>
                <div style={{ position: 'relative', paddingBottom: '56.25%', height: 0, overflow: 'hidden', borderRadius: '8px' }}>
                  <iframe
                    src={game.trailer_url.replace('watch?v=', 'embed/')}
                    style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%' }}
                    frameBorder="0"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                  ></iframe>
                </div>
              </div>
            )}

            {/* Screenshots */}
            {screenshots.length > 0 && (
              <div>
                <h3><i className="fas fa-images" style={{ color: 'var(--primary)' }}></i> Screenshots</h3>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '0.5rem' }}>
                  {screenshots.map((url, index) => (
                    <img 
                      key={index}
                      src={url}
                      alt={`Screenshot ${index + 1}`}
                      style={{ width: '100%', borderRadius: '8px', cursor: 'pointer' }}
                      onClick={() => window.open(url, '_blank')}
                    />
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Right Column - Info */}
          <div>
            <div className="card" style={{ padding: '2rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div>
                  <h1 style={{ marginBottom: '0.5rem' }}>{game.game_name}</h1>
                  {game.category_name && (
                    <span style={{ 
                      background: 'var(--primary)', 
                      color: 'white', 
                      padding: '0.25rem 0.75rem', 
                      borderRadius: '20px', 
                      fontSize: '0.85rem' 
                    }}>
                      {game.category_name}
                    </span>
                  )}
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontSize: '2rem', fontWeight: 'bold', color: 'var(--success)' }}>
                    ${parseFloat(game.price).toFixed(2)}
                  </div>
                  {game.rating_avg > 0 && (
                    <div>
                      {renderStars(Math.round(game.rating_avg))}
                      <span style={{ marginLeft: '0.5rem', color: 'var(--gray)' }}>
                        ({game.rating_count} reviews)
                      </span>
                    </div>
                  )}
                </div>
              </div>

              <p style={{ margin: '1.5rem 0', fontSize: '1.1rem', lineHeight: '1.8' }}>
                {game.description}
              </p>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '1rem', marginBottom: '1.5rem' }}>
                <div style={{ background: 'var(--light)', padding: '1rem', borderRadius: '8px' }}>
                  <div style={{ color: 'var(--gray)', fontSize: '0.85rem' }}>Seller</div>
                  <div style={{ fontWeight: 'bold' }}>{game.seller_name}</div>
                </div>
                <div style={{ background: 'var(--light)', padding: '1rem', borderRadius: '8px' }}>
                  <div style={{ color: 'var(--gray)', fontSize: '0.85rem' }}>Views</div>
                  <div style={{ fontWeight: 'bold' }}><i className="fas fa-eye"></i> {game.view_count}</div>
                </div>
              </div>

              {/* Stock Status Display */}
              <div style={{ 
                background: game.stock_quantity > 0 ? 'rgba(46, 204, 113, 0.1)' : 'rgba(231, 76, 60, 0.1)', 
                padding: '1rem', 
                borderRadius: '8px', 
                marginBottom: '1rem',
                textAlign: 'center'
              }}>
                {game.stock_quantity > 0 ? (
                  <span style={{ color: 'var(--success)', fontWeight: 'bold' }}>
                    <i className="fas fa-check-circle"></i> In Stock ({game.stock_quantity} {game.stock_quantity === 1 ? 'copy' : 'copies'} available)
                  </span>
                ) : (
                  <span style={{ color: 'var(--danger)', fontWeight: 'bold' }}>
                    <i className="fas fa-times-circle"></i> Out of Stock
                  </span>
                )}
              </div>

              <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
                {game.stock_quantity > 0 ? (
                  <button onClick={buyGame} className="btn btn-primary" style={{ flex: 1 }}>
                    <i className="fas fa-shopping-cart"></i> Buy Now
                  </button>
                ) : (
                  <button disabled className="btn btn-secondary" style={{ flex: 1, opacity: 0.6, cursor: 'not-allowed' }}>
                    <i className="fas fa-times-circle"></i> Out of Stock
                  </button>
                )}
                <button onClick={addToWishlist} className="btn btn-secondary">
                  <i className="fas fa-heart"></i>
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Reviews Section */}
        <div className="card" style={{ marginTop: '2rem', padding: '2rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
            <h2><i className="fas fa-star" style={{ color: '#f39c12' }}></i> Reviews & Feedback</h2>
            {currentUser && currentUser.type === 'user' && (
              <button onClick={() => setShowReviewForm(!showReviewForm)} className="btn btn-primary">
                <i className="fas fa-pen"></i> Write Review
              </button>
            )}
          </div>

          {showReviewForm && (
            <form onSubmit={submitReview} style={{ background: 'var(--light)', padding: '1.5rem', borderRadius: '8px', marginBottom: '1.5rem' }}>
              <div className="form-group">
                <label>Rating</label>
                <div style={{ display: 'flex', gap: '0.5rem' }}>
                  {[1, 2, 3, 4, 5].map(star => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setReviewRating(star)}
                      style={{
                        background: 'none',
                        border: 'none',
                        cursor: 'pointer',
                        fontSize: '1.5rem',
                        color: star <= reviewRating ? '#f39c12' : '#ddd'
                      }}
                    >
                      <i className="fas fa-star"></i>
                    </button>
                  ))}
                </div>
              </div>
              <div className="form-group">
                <label>Your Review</label>
                <textarea
                  value={reviewText}
                  onChange={(e) => setReviewText(e.target.value)}
                  rows="4"
                  placeholder="Share your experience with this game..."
                  required
                />
              </div>
              <button type="submit" className="btn btn-primary">Submit Review</button>
              <button type="button" onClick={() => setShowReviewForm(false)} className="btn btn-secondary" style={{ marginLeft: '0.5rem' }}>Cancel</button>
            </form>
          )}

          {reviews.length === 0 ? (
            <p style={{ textAlign: 'center', color: 'var(--gray)', padding: '2rem' }}>
              No reviews yet. Be the first to review this game!
            </p>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {reviews.map(review => (
                <div key={review.review_id} style={{ 
                  padding: '1rem', 
                  background: 'var(--light)', 
                  borderRadius: '8px',
                  borderLeft: '4px solid var(--primary)'
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                    <strong><i className="fas fa-user"></i> {review.username}</strong>
                    <span>{renderStars(review.rating)}</span>
                  </div>
                  <p style={{ margin: 0 }}>{review.review_text}</p>
                  <small style={{ color: 'var(--gray)' }}>
                    {new Date(review.created_at).toLocaleDateString()}
                  </small>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </>
  )
}

export default GameDetails
