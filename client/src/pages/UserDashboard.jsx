import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import Navbar from '../components/Navbar'

function UserDashboard() {
  const navigate = useNavigate()
  const [currentUser, setCurrentUser] = useState(null)
  const [balance, setBalance] = useState('0.00')
  const [activeTab, setActiveTab] = useState('marketplace')

  // User Profile Data
  const [subscription, setSubscription] = useState(null)
  const [referralCode, setReferralCode] = useState('')
  const [totalSales, setTotalSales] = useState(0)

  // Marketplace / Listings
  const [listings, setListings] = useState([])
  const [categories, setCategories] = useState([])
  const [selectedCategory, setSelectedCategory] = useState('')
  const [searchQuery, setSearchQuery] = useState('')

  // My Listings
  const [myListings, setMyListings] = useState([])
  // My Purchases
  const [purchases, setPurchases] = useState([])
  // Balance Requests
  const [balanceRequests, setBalanceRequests] = useState([])
  // Notifications
  const [notifications, setNotifications] = useState([])
  // Wishlist
  const [wishlist, setWishlist] = useState([])
  // Community
  const [threads, setThreads] = useState([])
  const [currentThread, setCurrentThread] = useState(null)
  const [comments, setComments] = useState([])
  const [showCreateThread, setShowCreateThread] = useState(false)
  const [threadTitle, setThreadTitle] = useState('')
  const [threadContent, setThreadContent] = useState('')
  const [commentText, setCommentText] = useState('')
  // Create Listing
  const [gameName, setGameName] = useState('')
  const [description, setDescription] = useState('')
  const [price, setPrice] = useState('')
  const [gameKey, setGameKey] = useState('')
  const [categoryId, setCategoryId] = useState('')
  const [trailerUrl, setTrailerUrl] = useState('')
  const [stockQuantity, setStockQuantity] = useState('1')
  // Restock
  const [restockListingId, setRestockListingId] = useState(null)
  const [restockQuantity, setRestockQuantity] = useState('1')
  const [restockGameKey, setRestockGameKey] = useState('')
  // Review
  const [showReviewForm, setShowReviewForm] = useState(null)
  const [reviewRating, setReviewRating] = useState(5)
  const [reviewText, setReviewText] = useState('')

  useEffect(() => { checkAuth() }, [])

  async function checkAuth() {
    const res = await fetch('/api/check-session')
    const data = await res.json()
    if (!data.success || data.user.type !== 'user') {
      navigate('/login')
      return
    }
    setCurrentUser(data.user)
    loadUserProfile()
    loadMarketplace()
    loadCategories()
    loadNotifications()
  }

  async function loadUserProfile() {
    const res = await fetch('/api/user/profile')
    const data = await res.json()
    if (data.success) {
      setBalance(data.user.balance)
      setReferralCode(data.user.referral_code || '')
      setTotalSales(data.user.total_sales || 0)
    }
    // Load subscription
    const subRes = await fetch('/api/subscription')
    const subData = await subRes.json()
    if (subData.success && subData.subscription) {
      setSubscription(subData.subscription)
    }
  }

  async function loadCategories() {
    const res = await fetch('/api/categories')
    const data = await res.json()
    if (data.success) setCategories(data.categories)
  }

  async function loadMarketplace() {
    let url = '/api/listings'
    if (searchQuery) {
      url = `/api/search?q=${encodeURIComponent(searchQuery)}`
    }
    const res = await fetch(url)
    const data = await res.json()
    if (searchQuery && data.success) {
      setListings(data.results)
    } else {
      setListings(data.listings || [])
    }
  }

  async function loadNotifications() {
    const res = await fetch('/api/user/notifications')
    const data = await res.json()
    setNotifications(data.notifications || [])
  }

  async function loadWishlist() {
    const res = await fetch('/api/user/wishlist')
    const data = await res.json()
    setWishlist(data.wishlist || [])
  }

  async function loadMyListings() {
    const res = await fetch('/api/user/my-listings')
    const data = await res.json()
    setMyListings(data.listings || [])
  }

  async function loadMyPurchases() {
    const res = await fetch('/api/user/purchases')
    const data = await res.json()
    setPurchases(data.purchases || [])
  }

  async function loadBalanceRequests() {
    const res = await fetch('/api/user/balance-requests')
    const data = await res.json()
    setBalanceRequests(data.requests || [])
  }

  async function loadCommunity() {
    setCurrentThread(null)
    const res = await fetch('/api/community/threads')
    const data = await res.json()
    setThreads(data.threads || [])
  }

  async function viewThread(threadId) {
    const res = await fetch(`/api/community/thread/${threadId}`)
    const data = await res.json()
    if (!data.success) { alert('Thread not found'); return }
    setCurrentThread(data.thread)
    setComments(data.comments || [])
  }

  async function buyGame(listingId, gameName) {
    if (!confirm(`Are you sure you want to buy "${gameName}"?`)) return
    const res = await fetch('/api/listing/buy', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ listingId })
    })
    const data = await res.json()
    if (data.success) {
      let msg = `Purchase successful! Your game key: ${data.gameKey}`
      if (data.discount > 0) {
        msg += `\n\nYou saved ${data.discount}% with your subscription!`
      }
      alert(msg)
      loadMarketplace()
      loadUserProfile()
    } else {
      alert(data.message)
    }
  }

  async function addToWishlist(listingId, gameName) {
    const res = await fetch('/api/wishlist/add', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ listingId, gameName })
    })
    const data = await res.json()
    if (data.success) {
      alert('Added to wishlist!')
    } else {
      alert(data.message)
    }
  }

  async function removeFromWishlist(wishlistId) {
    const res = await fetch(`/api/wishlist/${wishlistId}`, { method: 'DELETE' })
    const data = await res.json()
    if (data.success) {
      loadWishlist()
    }
  }

  async function handleCreateListing(e) {
    e.preventDefault()
    const res = await fetch('/api/listing/create', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ 
        gameName, 
        description, 
        price: parseFloat(price), 
        gameKey, 
        categoryId: categoryId || null, 
        trailerUrl: trailerUrl || null,
        stockQuantity: parseInt(stockQuantity) || 1
      })
    })
    const data = await res.json()
    if (data.success) {
      alert('Listing created! Waiting for admin approval.')
      setGameName(''); setDescription(''); setPrice(''); setGameKey('')
      setCategoryId(''); setTrailerUrl(''); setStockQuantity('1')
      switchTab('myListings')
    } else {
      alert(data.message)
    }
  }

  async function handleRestock(e) {
    e.preventDefault()
    if (!restockQuantity || parseInt(restockQuantity) < 1) {
      alert('Quantity must be at least 1')
      return
    }
    const res = await fetch('/api/user/restock', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ 
        listingId: restockListingId, 
        quantity: parseInt(restockQuantity),
        gameKey: restockGameKey || undefined
      })
    })
    const data = await res.json()
    alert(data.message)
    if (data.success) {
      setRestockListingId(null)
      setRestockQuantity('1')
      setRestockGameKey('')
      loadMyListings()
    }
  }

  async function handleCreateThread(e) {
    e.preventDefault()
    const res = await fetch('/api/community/thread/create', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ title: threadTitle, content: threadContent })
    })
    const data = await res.json()
    if (data.success) {
      alert('Thread created successfully!')
      setShowCreateThread(false)
      setThreadTitle(''); setThreadContent('')
      loadCommunity()
    } else {
      alert(data.message)
    }
  }

  async function handleAddComment(e) {
    e.preventDefault()
    const res = await fetch('/api/community/comment/create', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ threadId: currentThread.thread_id, commentText })
    })
    const data = await res.json()
    if (data.success) {
      setCommentText('')
      viewThread(currentThread.thread_id)
    } else {
      alert(data.message)
    }
  }

  async function upvoteThread(threadId) {
    const res = await fetch(`/api/community/thread/${threadId}/upvote`, { method: 'POST' })
    const data = await res.json()
    if (data.success) {
      loadCommunity()
    }
  }

  async function upvoteComment(commentId) {
    const res = await fetch(`/api/community/comment/${commentId}/upvote`, { method: 'POST' })
    const data = await res.json()
    if (data.success && currentThread) {
      viewThread(currentThread.thread_id)
    }
  }

  async function markNotificationRead(notifId) {
    await fetch(`/api/user/notification/${notifId}/read`, { method: 'PUT' })
    loadNotifications()
  }

  async function submitReview(purchaseId, listingId) {
    const res = await fetch(`/api/listing/${listingId}/review`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ rating: reviewRating, reviewText })
    })
    const data = await res.json()
    if (data.success) {
      alert('Review submitted!')
      setShowReviewForm(null)
      setReviewRating(5)
      setReviewText('')
    } else {
      alert(data.message)
    }
  }

  function showRequestBalance() {
    const amount = prompt('Enter amount to request:')
    if (amount && !isNaN(amount) && parseFloat(amount) > 0) {
      requestBalance(parseFloat(amount))
    } else if (amount !== null) {
      alert('Please enter a valid amount greater than 0')
    }
  }

  async function requestBalance(amount) {
    const res = await fetch('/api/user/request-balance', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ amount })
    })
    const data = await res.json()
    if (data.success) {
      alert('Balance request submitted! Waiting for admin approval.')
      loadUserProfile()
    } else {
      alert(data.message || 'Error submitting request')
    }
  }

  function copyReferralCode() {
    navigator.clipboard.writeText(referralCode)
    alert('Referral code copied!')
  }

  async function logout() {
    await fetch('/api/logout', { method: 'POST' })
    navigate('/')
  }

  async function deleteAccount() {
    const confirmText = prompt('This will permanently delete your account and all associated data. Type "DELETE" to confirm:')
    if (confirmText !== 'DELETE') {
      alert('Account deletion cancelled.')
      return
    }
    const res = await fetch('/api/user/account', { method: 'DELETE' })
    const data = await res.json()
    if (data.success) {
      alert('Your account has been deleted.')
      navigate('/')
    } else {
      alert(data.message || 'Failed to delete account')
    }
  }

  function switchTab(tab) {
    setActiveTab(tab)
    if (tab === 'marketplace') loadMarketplace()
    if (tab === 'community') loadCommunity()
    if (tab === 'myListings') loadMyListings()
    if (tab === 'myPurchases') loadMyPurchases()
    if (tab === 'balanceRequests') loadBalanceRequests()
    if (tab === 'notifications') loadNotifications()
    if (tab === 'wishlist') loadWishlist()
  }

  function getFilteredListings() {
    let filtered = listings.filter(l => l.status === 'AVAILABLE' || l.status === 'OUT_OF_STOCK')
    if (selectedCategory) {
      filtered = filtered.filter(l => l.category_id === parseInt(selectedCategory))
    }
    return filtered
  }

  function renderStars(rating, clickable = false, onClick = null) {
    return (
      <span style={{ color: '#f39c12' }}>
        {[1, 2, 3, 4, 5].map(star => (
          <i 
            key={star} 
            className={`fa${star <= rating ? 's' : 'r'} fa-star`}
            style={{ cursor: clickable ? 'pointer' : 'default' }}
            onClick={() => clickable && onClick && onClick(star)}
          ></i>
        ))}
      </span>
    )
  }

  const navLinks = [
    { to: '/', label: 'Home' },
    { to: '/events', label: 'Events' },
    { to: '/leaderboard', label: 'Leaderboard' },
    { to: '/help', label: 'Help' }
  ]

  const unreadNotifs = notifications.filter(n => !n.is_read).length

  if (!currentUser) return null

  return (
    <>
      <Navbar
        links={navLinks}
        showLogout
        onLogout={logout}
        userInfo={`Welcome, ${currentUser.username}!`}
      />

      <div className="container">
        <div className="dashboard">
          <h1>User Dashboard</h1>

          {/* Profile Summary */}
          <div style={{ 
            display: 'grid', 
            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', 
            gap: '1rem', 
            marginBottom: '2rem' 
          }}>
            <div className="balance-section" style={{ margin: 0 }}>
              <h3>Balance: ${balance}</h3>
              <button onClick={showRequestBalance} className="btn btn-small" style={{ background: 'white', color: 'var(--primary)' }}>
                Request Balance
              </button>
            </div>

            {subscription ? (
              <div style={{ 
                background: 'linear-gradient(135deg, #9b59b6, #3498db)', 
                padding: '1rem', 
                borderRadius: '8px', 
                color: 'white',
                textAlign: 'center'
              }}>
                <h4 style={{ margin: '0 0 0.5rem' }}>
                  <i className="fas fa-gem"></i> {subscription.plan_name.toUpperCase()} Member
                </h4>
                <p style={{ margin: 0, fontSize: '0.9rem' }}>
                  Expires: {new Date(subscription.end_date).toLocaleDateString()}
                </p>
              </div>
            ) : (
              <Link to="/subscription" style={{ 
                background: 'var(--light)', 
                padding: '1rem', 
                borderRadius: '8px',
                textAlign: 'center',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'center',
                textDecoration: 'none',
                color: 'inherit'
              }}>
                <i className="fas fa-gem fa-2x" style={{ color: 'var(--primary)', marginBottom: '0.5rem' }}></i>
                <span>Get 20% Off with Subscription</span>
              </Link>
            )}

            {referralCode && (
              <div style={{ 
                background: 'var(--light)', 
                padding: '1rem', 
                borderRadius: '8px',
                textAlign: 'center'
              }}>
                <small style={{ color: 'var(--gray)' }}>Your Referral Code</small>
                <div style={{ fontWeight: 'bold', fontSize: '1.2rem' }}>{referralCode}</div>
                <button onClick={copyReferralCode} className="btn btn-small" style={{ marginTop: '0.5rem' }}>
                  <i className="fas fa-copy"></i> Copy
                </button>
              </div>
            )}

            <div style={{ 
              background: 'var(--light)', 
              padding: '1rem', 
              borderRadius: '8px',
              textAlign: 'center',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'center'
            }}>
              <small style={{ color: 'var(--gray)' }}>Account Settings</small>
              <button 
                onClick={deleteAccount} 
                className="btn btn-small" 
                style={{ marginTop: '0.5rem', background: '#e74c3c', color: 'white' }}
              >
                <i className="fas fa-trash"></i> Delete Account
              </button>
            </div>
          </div>

          <div className="tabs" style={{ flexWrap: 'wrap' }}>
            {[
              { id: 'marketplace', label: 'Marketplace', icon: 'fa-shopping-cart' },
              { id: 'community', label: 'Community', icon: 'fa-comments' },
              { id: 'myListings', label: 'My Listings', icon: 'fa-list' },
              { id: 'myPurchases', label: 'Purchases', icon: 'fa-history' },
              { id: 'wishlist', label: 'Wishlist', icon: 'fa-heart' },
              { id: 'notifications', label: `Notifications${unreadNotifs > 0 ? ` (${unreadNotifs})` : ''}`, icon: 'fa-bell' },
              { id: 'balanceRequests', label: 'Balance', icon: 'fa-wallet' },
              { id: 'createListing', label: 'Sell Game', icon: 'fa-plus' }
            ].map(tab => (
              <button
                key={tab.id}
                className={`tab-btn${activeTab === tab.id ? ' active' : ''}`}
                onClick={() => switchTab(tab.id)}
              >
                <i className={`fas ${tab.icon}`}></i> {tab.label}
              </button>
            ))}
          </div>

          {/* Marketplace */}
          {activeTab === 'marketplace' && (
            <div>
              <div style={{ display: 'flex', gap: '1rem', marginBottom: '1.5rem', flexWrap: 'wrap' }}>
                <input
                  type="text"
                  placeholder="Search games..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && loadMarketplace()}
                  style={{ flex: 1, minWidth: '200px' }}
                />
                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  style={{ padding: '0.75rem' }}
                >
                  <option value="">All Categories</option>
                  {categories.map(cat => (
                    <option key={cat.category_id} value={cat.category_id}>{cat.name}</option>
                  ))}
                </select>
                <button onClick={loadMarketplace} className="btn btn-primary">
                  <i className="fas fa-search"></i>
                </button>
              </div>

              <h2>Available Games</h2>
              {getFilteredListings().length === 0 ? (
                <p style={{ textAlign: 'center', color: 'var(--gray)', padding: '2rem' }}>No games available at the moment.</p>
              ) : (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '1rem' }}>
                  {getFilteredListings().map(l => (
                    <div key={l.listing_id} className="game-card" style={{ display: 'flex', flexDirection: 'column' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                        <h3 style={{ margin: 0 }}>{l.game_name}</h3>
                        <span style={{ 
                          background: 'var(--success)', 
                          color: 'white', 
                          padding: '0.25rem 0.5rem',
                          borderRadius: '4px',
                          fontWeight: 'bold'
                        }}>${l.price}</span>
                      </div>
                      {l.category_name && (
                        <span style={{ 
                          background: 'var(--primary)', 
                          color: 'white', 
                          padding: '0.15rem 0.5rem', 
                          borderRadius: '10px',
                          fontSize: '0.75rem',
                          display: 'inline-block',
                          width: 'fit-content',
                          marginTop: '0.5rem'
                        }}>
                          {l.category_name}
                        </span>
                      )}
                      <p style={{ flex: 1, margin: '0.75rem 0' }}>{l.description}</p>
                      {/* Stock Status */}
                      <div style={{ marginBottom: '0.5rem' }}>
                        {l.stock_quantity > 0 ? (
                          <span style={{ color: 'var(--success)', fontSize: '0.85rem' }}>
                            <i className="fas fa-check-circle"></i> In Stock ({l.stock_quantity} available)
                          </span>
                        ) : (
                          <span style={{ color: 'var(--danger)', fontSize: '0.85rem' }}>
                            <i className="fas fa-times-circle"></i> Out of Stock
                          </span>
                        )}
                      </div>
                      {l.rating_avg > 0 && (
                        <div style={{ marginBottom: '0.5rem' }}>
                          {renderStars(Math.round(l.rating_avg))}
                          <span style={{ marginLeft: '0.5rem', color: 'var(--gray)', fontSize: '0.85rem' }}>
                            ({l.rating_count} reviews)
                          </span>
                        </div>
                      )}
                      <p><small>Seller: {l.seller_name}</small></p>
                      <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                        {l.stock_quantity > 0 ? (
                          <button onClick={() => buyGame(l.listing_id, l.game_name)} className="btn btn-primary" style={{ flex: 1 }}>
                            <i className="fas fa-shopping-cart"></i> Buy
                          </button>
                        ) : (
                          <button disabled className="btn btn-secondary" style={{ flex: 1, opacity: 0.6, cursor: 'not-allowed' }}>
                            <i className="fas fa-times-circle"></i> Out of Stock
                          </button>
                        )}
                        <button onClick={() => addToWishlist(l.listing_id, l.game_name)} className="btn btn-secondary">
                          <i className="fas fa-heart"></i>
                        </button>
                        <Link to={`/game/${l.listing_id}`} className="btn btn-secondary">
                          <i className="fas fa-eye"></i>
                        </Link>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Community */}
          {activeTab === 'community' && (
            <div>
              {!currentThread ? (
                <>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                    <h2>Community Discussions</h2>
                    <button onClick={() => setShowCreateThread(!showCreateThread)} className="btn btn-primary">
                      <i className="fas fa-plus"></i> Create Thread
                    </button>
                  </div>

                  {showCreateThread && (
                    <div style={{ marginBottom: '2rem', background: 'var(--light)', padding: '1.5rem', borderRadius: '8px' }}>
                      <h3>Create New Thread</h3>
                      <form onSubmit={handleCreateThread}>
                        <div className="form-group">
                          <label>Title:</label>
                          <input type="text" value={threadTitle} onChange={e => setThreadTitle(e.target.value)} required />
                        </div>
                        <div className="form-group">
                          <label>Content:</label>
                          <textarea rows="4" value={threadContent} onChange={e => setThreadContent(e.target.value)} required />
                        </div>
                        <button type="submit" className="btn btn-primary">Post Thread</button>{' '}
                        <button type="button" onClick={() => setShowCreateThread(false)} className="btn btn-secondary">Cancel</button>
                      </form>
                    </div>
                  )}

                  {threads.length === 0 ? (
                    <p style={{ textAlign: 'center', color: 'var(--gray)', padding: '2rem' }}>No threads yet. Be the first to start a discussion!</p>
                  ) : (
                    threads.map(t => (
                      <div key={t.thread_id} className="thread-card" style={{ cursor: 'pointer' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                          <div onClick={() => viewThread(t.thread_id)} style={{ flex: 1 }}>
                            <div className="thread-title">{t.title}</div>
                            <div className="thread-meta">
                              <i className="fas fa-user"></i> {t.username} | <i className="fas fa-clock"></i> {new Date(t.created_at).toLocaleString()}
                            </div>
                            <div className="thread-content">{t.content.substring(0, 150)}{t.content.length > 150 ? '...' : ''}</div>
                          </div>
                          <button 
                            onClick={(e) => { e.stopPropagation(); upvoteThread(t.thread_id) }}
                            className="btn btn-small"
                            style={{ minWidth: '70px' }}
                          >
                            <i className="fas fa-arrow-up"></i> {t.upvote_count || 0}
                          </button>
                        </div>
                      </div>
                    ))
                  )}
                </>
              ) : (
                <div>
                  <button onClick={() => setCurrentThread(null)} className="btn btn-secondary" style={{ marginBottom: '1rem' }}>
                    <i className="fas fa-arrow-left"></i> Back to Threads
                  </button>

                  <div style={{ background: 'var(--light)', padding: '2rem', borderRadius: '8px', marginBottom: '2rem' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                      <div>
                        <h2>{currentThread.title}</h2>
                        <div className="thread-meta" style={{ marginBottom: '1rem' }}>
                          <i className="fas fa-user"></i> {currentThread.username} | <i className="fas fa-clock"></i> {new Date(currentThread.created_at).toLocaleString()}
                        </div>
                      </div>
                      <button onClick={() => upvoteThread(currentThread.thread_id)} className="btn btn-primary">
                        <i className="fas fa-arrow-up"></i> {currentThread.upvote_count || 0}
                      </button>
                    </div>
                    <p style={{ color: 'var(--gray)', lineHeight: '1.8' }}>{currentThread.content}</p>
                  </div>

                  <div className="comment-section">
                    <h3>Comments ({comments.length})</h3>
                    {comments.length === 0 ? (
                      <p>No comments yet. Be the first to comment!</p>
                    ) : (
                      comments.map(c => (
                        <div key={c.comment_id} className="comment-card" style={{ display: 'flex', justifyContent: 'space-between' }}>
                          <div>
                            <div className="comment-author"><i className="fas fa-user-circle"></i> {c.username}</div>
                            <div className="comment-text">{c.comment_text}</div>
                            <div className="comment-date">{new Date(c.created_at).toLocaleString()}</div>
                          </div>
                          <button onClick={() => upvoteComment(c.comment_id)} className="btn btn-small">
                            <i className="fas fa-arrow-up"></i> {c.upvote_count || 0}
                          </button>
                        </div>
                      ))
                    )}

                    <div style={{ marginTop: '1.5rem', background: 'var(--light)', padding: '1.5rem', borderRadius: '8px' }}>
                      <h4>Add Comment</h4>
                      <form onSubmit={handleAddComment}>
                        <div className="form-group">
                          <textarea rows="3" required placeholder="Write your comment..." value={commentText} onChange={e => setCommentText(e.target.value)} />
                        </div>
                        <button type="submit" className="btn btn-primary">Post Comment</button>
                      </form>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Notifications */}
          {activeTab === 'notifications' && (
            <div>
              <h2><i className="fas fa-bell" style={{ color: 'var(--primary)' }}></i> Notifications</h2>
              {notifications.length === 0 ? (
                <p style={{ textAlign: 'center', color: 'var(--gray)', padding: '2rem' }}>No notifications yet.</p>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                  {notifications.map(n => (
                    <div 
                      key={n.notification_id} 
                      className="game-card" 
                      style={{ 
                        background: n.is_read ? 'var(--light)' : 'var(--dark)',
                        cursor: 'pointer'
                      }}
                      onClick={() => markNotificationRead(n.notification_id)}
                    >
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                        <div>
                          <h4 style={{ margin: '0 0 0.5rem' }}>
                            {!n.is_read && <span style={{ color: 'var(--primary)' }}>● </span>}
                            {n.title}
                          </h4>
                          <p style={{ margin: 0, color: 'var(--gray)' }}>{n.message}</p>
                        </div>
                        <small style={{ color: 'var(--gray)' }}>
                          {new Date(n.created_at).toLocaleDateString()}
                        </small>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Wishlist */}
          {activeTab === 'wishlist' && (
            <div>
              <h2><i className="fas fa-heart" style={{ color: 'var(--danger)' }}></i> My Wishlist</h2>
              {wishlist.length === 0 ? (
                <p style={{ textAlign: 'center', color: 'var(--gray)', padding: '2rem' }}>Your wishlist is empty. Browse the marketplace to add games!</p>
              ) : (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '1rem' }}>
                  {wishlist.map(w => (
                    <div key={w.wishlist_id} className="game-card">
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                        <h3 style={{ margin: 0 }}>{w.game_name}</h3>
                        <button 
                          onClick={() => removeFromWishlist(w.wishlist_id)} 
                          className="btn btn-small"
                          style={{ background: 'var(--danger)' }}
                        >
                          <i className="fas fa-trash"></i>
                        </button>
                      </div>
                      {w.listing_id && (
                        <>
                          <p style={{ margin: '0.5rem 0' }}>{w.description}</p>
                          <p><strong>${w.price}</strong></p>
                          <div style={{ display: 'flex', gap: '0.5rem' }}>
                            {w.status === 'AVAILABLE' ? (
                              <button onClick={() => buyGame(w.listing_id, w.game_name)} className="btn btn-primary" style={{ flex: 1 }}>
                                <i className="fas fa-shopping-cart"></i> Buy Now
                              </button>
                            ) : w.status === 'OUT_OF_STOCK' ? (
                              <span style={{ color: 'var(--warning)', fontWeight: 'bold' }}>
                                <i className="fas fa-clock"></i> Out of Stock - We'll notify you when available!
                              </span>
                            ) : (
                              <span style={{ color: 'var(--danger)' }}>No longer available</span>
                            )}
                          </div>
                        </>
                      )}
                      <small style={{ color: 'var(--gray)' }}>Added: {new Date(w.created_at).toLocaleDateString()}</small>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* My Listings */}
          {activeTab === 'myListings' && (
            <div>
              <h2>My Listings</h2>

              {/* Restock Form Modal */}
              {restockListingId && (
                <div style={{ 
                  position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, 
                  background: 'rgba(0,0,0,0.5)', display: 'flex', 
                  alignItems: 'center', justifyContent: 'center', zIndex: 1000 
                }}>
                  <div style={{ background: 'white', padding: '2rem', borderRadius: '12px', maxWidth: '400px', width: '90%' }}>
                    <h3><i className="fas fa-boxes"></i> Restock Your Game</h3>
                    <form onSubmit={handleRestock}>
                      <div className="form-group">
                        <label>Quantity to Add</label>
                        <input 
                          type="number" 
                          min="1" 
                          value={restockQuantity} 
                          onChange={e => setRestockQuantity(e.target.value)} 
                          required 
                        />
                      </div>
                      <div className="form-group">
                        <label>New Game Key (optional)</label>
                        <input 
                          type="text" 
                          value={restockGameKey} 
                          onChange={e => setRestockGameKey(e.target.value)} 
                          placeholder="Leave empty to keep existing key"
                        />
                      </div>
                      <div style={{ display: 'flex', gap: '1rem' }}>
                        <button type="submit" className="btn btn-success">
                          <i className="fas fa-check"></i> Restock
                        </button>
                        <button type="button" onClick={() => setRestockListingId(null)} className="btn btn-secondary">
                          Cancel
                        </button>
                      </div>
                    </form>
                  </div>
                </div>
              )}

              {myListings.length === 0 ? (
                <p style={{ textAlign: 'center', color: 'var(--gray)', padding: '2rem' }}>You have no listings yet.</p>
              ) : (
                myListings.map(l => (
                  <div key={l.listing_id} className="game-card">
                    <h3>{l.game_name}</h3>
                    <p>{l.description}</p>
                    <p><strong>Price: ${l.price}</strong></p>
                    <p>Stock: <strong>{l.stock_quantity}</strong> {l.stock_quantity === 1 ? 'copy' : 'copies'}</p>
                    <p>Status: <span className={`status-${l.status.toLowerCase()}`}>{l.status}</span></p>
                    <p>Admin Approved: {l.admin_approved ? '✅ Yes' : '⏳ Pending'}</p>
                    {l.admin_approved && (
                      <button 
                        onClick={() => setRestockListingId(l.listing_id)} 
                        className="btn btn-primary" 
                        style={{ marginTop: '0.5rem' }}
                      >
                        <i className="fas fa-boxes"></i> Restock
                      </button>
                    )}
                  </div>
                ))
              )}
            </div>
          )}

          {/* My Purchases */}
          {activeTab === 'myPurchases' && (
            <div>
              <h2>Purchase History</h2>
              {purchases.length === 0 ? (
                <p style={{ textAlign: 'center', color: 'var(--gray)', padding: '2rem' }}>You have no purchases yet.</p>
              ) : (
                purchases.map(p => (
                  <div key={p.purchase_id} className="game-card">
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                      <div>
                        <h3>{p.game_name}</h3>
                        <p>{p.description}</p>
                        <p><strong>Paid: ${p.purchase_price}</strong></p>
                        <p><strong>Game Key: </strong><code style={{ background: 'var(--dark)', padding: '0.25rem 0.5rem', borderRadius: '4px' }}>{p.game_key}</code></p>
                        <p><small>Purchased: {new Date(p.purchase_date).toLocaleString()}</small></p>
                      </div>
                    </div>
                    
                    {showReviewForm === p.purchase_id ? (
                      <div style={{ marginTop: '1rem', background: 'var(--light)', padding: '1rem', borderRadius: '8px' }}>
                        <h4>Write a Review</h4>
                        <div style={{ marginBottom: '1rem' }}>
                          {renderStars(reviewRating, true, setReviewRating)}
                        </div>
                        <textarea 
                          rows="3" 
                          placeholder="Share your experience..." 
                          value={reviewText} 
                          onChange={e => setReviewText(e.target.value)}
                          style={{ width: '100%', marginBottom: '0.5rem' }}
                        />
                        <button onClick={() => submitReview(p.purchase_id, p.listing_id)} className="btn btn-primary">
                          Submit Review
                        </button>
                        <button onClick={() => setShowReviewForm(null)} className="btn btn-secondary" style={{ marginLeft: '0.5rem' }}>
                          Cancel
                        </button>
                      </div>
                    ) : (
                      <button onClick={() => setShowReviewForm(p.purchase_id)} className="btn btn-secondary" style={{ marginTop: '1rem' }}>
                        <i className="fas fa-star"></i> Write Review
                      </button>
                    )}
                  </div>
                ))
              )}
            </div>
          )}

          {/* Balance Requests */}
          {activeTab === 'balanceRequests' && (
            <div>
              <h2>My Balance Requests</h2>
              <p style={{ marginBottom: '1rem', color: 'var(--gray)' }}>Balance requests require admin approval before being added to your account.</p>
              {balanceRequests.length === 0 ? (
                <p style={{ textAlign: 'center', color: 'var(--gray)', padding: '2rem' }}>No balance requests yet.</p>
              ) : (
                balanceRequests.map(r => {
                  const sc = r.status === 'PENDING' ? 'status-pending' : r.status === 'APPROVED' ? 'status-approved' : 'status-rejected'
                  return (
                    <div key={r.request_id} className="game-card">
                      <h3>${parseFloat(r.amount).toFixed(2)}</h3>
                      <p>Status: <span className={sc}>{r.status}</span></p>
                      <p><small>Requested: {new Date(r.created_at).toLocaleString()}</small></p>
                      {r.processed_at && <p><small>Processed: {new Date(r.processed_at).toLocaleString()}</small></p>}
                    </div>
                  )
                })
              )}
            </div>
          )}

          {/* Create Listing */}
          {activeTab === 'createListing' && (
            <div>
              <h2>Create New Listing</h2>
              <form onSubmit={handleCreateListing}>
                <div className="form-group">
                  <label>Game Name:</label>
                  <input type="text" value={gameName} onChange={e => setGameName(e.target.value)} required />
                </div>
                <div className="form-group">
                  <label>Category:</label>
                  <select value={categoryId} onChange={e => setCategoryId(e.target.value)}>
                    <option value="">Select Category</option>
                    {categories.map(cat => (
                      <option key={cat.category_id} value={cat.category_id}>{cat.name}</option>
                    ))}
                  </select>
                </div>
                <div className="form-group">
                  <label>Description:</label>
                  <textarea rows="4" value={description} onChange={e => setDescription(e.target.value)} required />
                </div>
                <div className="form-group">
                  <label>Price ($):</label>
                  <input type="number" step="0.01" min="0" value={price} onChange={e => setPrice(e.target.value)} required />
                </div>
                <div className="form-group">
                  <label>Stock Quantity:</label>
                  <input type="number" min="1" value={stockQuantity} onChange={e => setStockQuantity(e.target.value)} required />
                  <small style={{ color: 'var(--gray)' }}>How many copies do you have to sell?</small>
                </div>
                <div className="form-group">
                  <label>Game Key:</label>
                  <input type="text" value={gameKey} onChange={e => setGameKey(e.target.value)} required />
                  <small style={{ color: 'var(--gray)' }}>This key will be given to buyers</small>
                </div>
                <div className="form-group">
                  <label>Trailer URL (optional, YouTube link):</label>
                  <input type="url" value={trailerUrl} onChange={e => setTrailerUrl(e.target.value)} placeholder="https://youtube.com/watch?v=..." />
                </div>
                <button type="submit" className="btn btn-primary">Create Listing</button>
              </form>
            </div>
          )}
        </div>
      </div>
    </>
  )
}

export default UserDashboard
