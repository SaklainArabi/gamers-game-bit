import { useState, useEffect } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import Navbar from '../components/Navbar'

function AdminDashboard() {
  const navigate = useNavigate()
  const [currentAdmin, setCurrentAdmin] = useState(null)
  const [activeTab, setActiveTab] = useState('stats')

  // Stats
  const [stats, setStats] = useState({ users: 0, listings: 0, sales: 0, revenue: 0 })

  // Data states
  const [users, setUsers] = useState([])
  const [adminListings, setAdminListings] = useState([])
  const [balanceRequests, setBalanceRequests] = useState([])
  const [helpQuestions, setHelpQuestions] = useState([])
  const [events, setEvents] = useState([])
  const [ads, setAds] = useState([])
  const [categories, setCategories] = useState([])
  const [answers, setAnswers] = useState({})

  // Restock form
  const [restockListingId, setRestockListingId] = useState(null)
  const [restockQuantity, setRestockQuantity] = useState('1')
  const [restockGameKey, setRestockGameKey] = useState('')

  // Add Game form
  const [gameName, setGameName] = useState('')
  const [gameDescription, setGameDescription] = useState('')
  const [gamePrice, setGamePrice] = useState('')
  const [gameKey, setGameKey] = useState('')
  const [gameCategoryId, setGameCategoryId] = useState('')
  const [gameTrailerUrl, setGameTrailerUrl] = useState('')

  // Event form
  const [eventTitle, setEventTitle] = useState('')
  const [eventDescription, setEventDescription] = useState('')
  const [eventDate, setEventDate] = useState('')
  const [eventMaxParticipants, setEventMaxParticipants] = useState('')
  const [showEventForm, setShowEventForm] = useState(false)

  // Ad form
  const [adTitle, setAdTitle] = useState('')
  const [adDescription, setAdDescription] = useState('')
  const [adImageUrl, setAdImageUrl] = useState('')
  const [adLinkUrl, setAdLinkUrl] = useState('')
  const [adEndDate, setAdEndDate] = useState('')
  const [showAdForm, setShowAdForm] = useState(false)

  // Category form
  const [categoryName, setCategoryName] = useState('')
  const [categoryDescription, setCategoryDescription] = useState('')
  const [showCategoryForm, setShowCategoryForm] = useState(false)

  useEffect(() => { checkAuth() }, [])

  async function checkAuth() {
    const res = await fetch('/api/check-session')
    const data = await res.json()
    if (!data.success || data.user.type !== 'admin') {
      navigate('/admin-login')
      return
    }
    setCurrentAdmin(data.user)
    loadStats()
    loadCategories()
  }

  async function loadStats() {
    try {
      const [usersRes, listingsRes] = await Promise.all([
        fetch('/api/admin/users'),
        fetch('/api/admin/listings')
      ])
      const usersData = await usersRes.json()
      const listingsData = await listingsRes.json()
      
      const totalUsers = usersData.users?.length || 0
      const totalListings = listingsData.listings?.length || 0
      const soldListings = listingsData.listings?.filter(l => l.status === 'SOLD') || []
      const totalRevenue = soldListings.reduce((sum, l) => sum + parseFloat(l.price), 0)
      
      setStats({
        users: totalUsers,
        listings: totalListings,
        sales: soldListings.length,
        revenue: totalRevenue.toFixed(2)
      })
    } catch (err) {
      console.error('Error loading stats:', err)
    }
  }

  async function loadCategories() {
    const res = await fetch('/api/categories')
    const data = await res.json()
    setCategories(data.categories || [])
  }

  async function loadUsers() {
    const res = await fetch('/api/admin/users')
    const data = await res.json()
    setUsers(data.users || [])
  }

  async function loadListings() {
    const res = await fetch('/api/admin/listings')
    const data = await res.json()
    setAdminListings(data.listings || [])
  }

  async function loadBalanceRequests() {
    const res = await fetch('/api/admin/balance-requests')
    const data = await res.json()
    setBalanceRequests(data.requests || [])
  }

  async function loadHelpQuestions() {
    const res = await fetch('/api/admin/help-questions')
    const data = await res.json()
    setHelpQuestions(data.questions || [])
  }

  async function loadEvents() {
    const res = await fetch('/api/events')
    const data = await res.json()
    setEvents(data.events || [])
  }

  async function loadAds() {
    const res = await fetch('/api/admin/advertisements')
    const data = await res.json()
    setAds(data.advertisements || [])
  }

  async function restrictUser(userId, restrict) {
    const action = restrict ? 'restrict' : 'unrestrict'
    if (!confirm(`Are you sure you want to ${action} this user?`)) return
    const res = await fetch('/api/admin/restrict-user', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId, restrict })
    })
    const data = await res.json()
    alert(data.message)
    if (data.success) loadUsers()
  }

  async function deleteUser(userId) {
    if (!confirm('Are you sure you want to DELETE this user? This cannot be undone.')) return
    const res = await fetch('/api/admin/delete-user', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId })
    })
    const data = await res.json()
    alert(data.message)
    if (data.success) loadUsers()
  }

  async function approveListing(listingId, approve) {
    const action = approve ? 'approve' : 'disapprove'
    if (!confirm(`Are you sure you want to ${action} this listing?`)) return
    const res = await fetch('/api/admin/approve-listing', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ listingId, approve })
    })
    const data = await res.json()
    alert(data.message)
    if (data.success) loadListings()
  }

  async function restockGame(e) {
    e.preventDefault()
    if (!restockQuantity || parseInt(restockQuantity) < 1) {
      alert('Quantity must be at least 1')
      return
    }
    const res = await fetch('/api/admin/restock', {
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
      loadListings()
    }
  }

  async function processBalanceRequest(requestId, approve) {
    const action = approve ? 'approve' : 'reject'
    if (!confirm(`Are you sure you want to ${action} this balance request?`)) return
    const res = await fetch('/api/admin/process-balance-request', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ requestId, approve })
    })
    const data = await res.json()
    alert(data.message)
    if (data.success) loadBalanceRequests()
  }

  async function answerQuestion(questionId) {
    const answer = answers[questionId] || ''
    if (!answer.trim()) { alert('Please enter an answer'); return }
    const res = await fetch('/api/admin/answer-question', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ questionId, answer })
    })
    const data = await res.json()
    if (data.success) {
      alert('Answer submitted successfully!')
      loadHelpQuestions()
    } else {
      alert(data.message || 'Error submitting answer')
    }
  }

  async function handleAddGame(e) {
    e.preventDefault()
    const res = await fetch('/api/admin/create-listing', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ 
        gameName, 
        description: gameDescription, 
        price: parseFloat(gamePrice), 
        gameKey,
        categoryId: gameCategoryId || null,
        trailerUrl: gameTrailerUrl || null
      })
    })
    const data = await res.json()
    if (data.success) {
      alert('Game added successfully!')
      setGameName(''); setGameDescription(''); setGamePrice(''); setGameKey('')
      setGameCategoryId(''); setGameTrailerUrl('')
    } else {
      alert(data.message || 'Error adding game')
    }
  }

  async function handleCreateEvent(e) {
    e.preventDefault()
    const res = await fetch('/api/admin/event/create', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        title: eventTitle,
        description: eventDescription,
        eventDate,
        maxParticipants: eventMaxParticipants ? parseInt(eventMaxParticipants) : null
      })
    })
    const data = await res.json()
    if (data.success) {
      alert('Event created successfully!')
      setShowEventForm(false)
      setEventTitle(''); setEventDescription(''); setEventDate(''); setEventMaxParticipants('')
      loadEvents()
    } else {
      alert(data.message)
    }
  }

  async function deleteEvent(eventId) {
    if (!confirm('Delete this event?')) return
    const res = await fetch(`/api/admin/event/${eventId}`, { method: 'DELETE' })
    const data = await res.json()
    if (data.success) loadEvents()
    else alert(data.message)
  }

  async function handleCreateAd(e) {
    e.preventDefault()
    const res = await fetch('/api/admin/advertisement/create', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        title: adTitle,
        description: adDescription,
        imageUrl: adImageUrl || null,
        linkUrl: adLinkUrl || null,
        endDate: adEndDate || null
      })
    })
    const data = await res.json()
    if (data.success) {
      alert('Advertisement created!')
      setShowAdForm(false)
      setAdTitle(''); setAdDescription(''); setAdImageUrl(''); setAdLinkUrl(''); setAdEndDate('')
      loadAds()
    } else {
      alert(data.message)
    }
  }

  async function deleteAd(adId) {
    if (!confirm('Delete this advertisement?')) return
    const res = await fetch(`/api/admin/advertisement/${adId}`, { method: 'DELETE' })
    const data = await res.json()
    if (data.success) loadAds()
    else alert(data.message)
  }

  async function handleCreateCategory(e) {
    e.preventDefault()
    const res = await fetch('/api/admin/category/create', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: categoryName, description: categoryDescription })
    })
    const data = await res.json()
    if (data.success) {
      alert('Category created!')
      setShowCategoryForm(false)
      setCategoryName(''); setCategoryDescription('')
      loadCategories()
    } else {
      alert(data.message)
    }
  }

  async function deleteCategory(categoryId) {
    if (!confirm('Delete this category? Games will become uncategorized.')) return
    const res = await fetch(`/api/admin/category/${categoryId}`, { method: 'DELETE' })
    const data = await res.json()
    if (data.success) loadCategories()
    else alert(data.message)
  }

  async function logout() {
    await fetch('/api/logout', { method: 'POST' })
    navigate('/')
  }

  function switchTab(tab) {
    setActiveTab(tab)
    if (tab === 'stats') loadStats()
    if (tab === 'users') loadUsers()
    if (tab === 'listings') loadListings()
    if (tab === 'balanceRequests') loadBalanceRequests()
    if (tab === 'helpQuestions') loadHelpQuestions()
    if (tab === 'events') loadEvents()
    if (tab === 'ads') loadAds()
    if (tab === 'categories') loadCategories()
  }

  const navLinks = [
    { to: '/', label: 'Home' },
    { to: '/events', label: 'Events' },
    { to: '/leaderboard', label: 'Leaderboard' },
    { to: '/help', label: 'Help' }
  ]

  if (!currentAdmin) return null

  return (
    <>
      <Navbar
        links={navLinks}
        showLogout
        onLogout={logout}
        userInfo={`Admin: ${currentAdmin.username}`}
        isAdmin
      />

      <div className="container">
        <div className="dashboard">
          <h1><i className="fas fa-user-shield"></i> Admin Dashboard</h1>

          <div className="tabs" style={{ flexWrap: 'wrap' }}>
            {[
              { key: 'stats', label: 'Dashboard', icon: 'fa-chart-bar' },
              { key: 'users', label: 'Users', icon: 'fa-users' },
              { key: 'listings', label: 'Listings', icon: 'fa-list' },
              { key: 'addGame', label: 'Add Game', icon: 'fa-plus' },
              { key: 'categories', label: 'Categories', icon: 'fa-folder' },
              { key: 'events', label: 'Events', icon: 'fa-calendar' },
              { key: 'ads', label: 'Ads', icon: 'fa-bullhorn' },
              { key: 'balanceRequests', label: 'Balance', icon: 'fa-coins' },
              { key: 'helpQuestions', label: 'Questions', icon: 'fa-question-circle' }
            ].map(t => (
              <button key={t.key} className={`tab-btn${activeTab === t.key ? ' active' : ''}`} onClick={() => switchTab(t.key)}>
                <i className={`fas ${t.icon}`}></i> {t.label}
              </button>
            ))}
          </div>

          {/* Stats Dashboard */}
          {activeTab === 'stats' && (
            <div>
              <h2><i className="fas fa-chart-bar" style={{ color: 'var(--primary)' }}></i> Platform Statistics</h2>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1.5rem', marginBottom: '2rem' }}>
                <div className="card" style={{ padding: '1.5rem', textAlign: 'center', background: 'linear-gradient(135deg, #3498db, #2980b9)', color: 'white' }}>
                  <i className="fas fa-users fa-2x" style={{ marginBottom: '0.5rem' }}></i>
                  <h3 style={{ margin: '0.5rem 0', fontSize: '2.5rem' }}>{stats.users}</h3>
                  <p style={{ margin: 0 }}>Total Users</p>
                </div>
                <div className="card" style={{ padding: '1.5rem', textAlign: 'center', background: 'linear-gradient(135deg, #9b59b6, #8e44ad)', color: 'white' }}>
                  <i className="fas fa-gamepad fa-2x" style={{ marginBottom: '0.5rem' }}></i>
                  <h3 style={{ margin: '0.5rem 0', fontSize: '2.5rem' }}>{stats.listings}</h3>
                  <p style={{ margin: 0 }}>Total Listings</p>
                </div>
                <div className="card" style={{ padding: '1.5rem', textAlign: 'center', background: 'linear-gradient(135deg, #2ecc71, #27ae60)', color: 'white' }}>
                  <i className="fas fa-shopping-cart fa-2x" style={{ marginBottom: '0.5rem' }}></i>
                  <h3 style={{ margin: '0.5rem 0', fontSize: '2.5rem' }}>{stats.sales}</h3>
                  <p style={{ margin: 0 }}>Games Sold</p>
                </div>
                <div className="card" style={{ padding: '1.5rem', textAlign: 'center', background: 'linear-gradient(135deg, #f39c12, #e67e22)', color: 'white' }}>
                  <i className="fas fa-dollar-sign fa-2x" style={{ marginBottom: '0.5rem' }}></i>
                  <h3 style={{ margin: '0.5rem 0', fontSize: '2.5rem' }}>${stats.revenue}</h3>
                  <p style={{ margin: 0 }}>Total Revenue</p>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1.5rem' }}>
                <div className="card" style={{ padding: '1.5rem' }}>
                  <h3><i className="fas fa-bolt" style={{ color: 'var(--primary)' }}></i> Quick Actions</h3>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', marginTop: '1rem' }}>
                    <button onClick={() => switchTab('addGame')} className="btn btn-primary">
                      <i className="fas fa-plus"></i> Add New Game
                    </button>
                    <button onClick={() => switchTab('events')} className="btn btn-secondary">
                      <i className="fas fa-calendar-plus"></i> Create Event
                    </button>
                    <button onClick={() => switchTab('ads')} className="btn btn-secondary">
                      <i className="fas fa-bullhorn"></i> Create Advertisement
                    </button>
                  </div>
                </div>

                <div className="card" style={{ padding: '1.5rem' }}>
                  <h3><i className="fas fa-folder" style={{ color: 'var(--primary)' }}></i> Game Categories</h3>
                  {categories.length === 0 ? (
                    <p style={{ color: 'var(--gray)' }}>No categories yet</p>
                  ) : (
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', marginTop: '1rem' }}>
                      {categories.map(cat => (
                        <span key={cat.category_id} style={{
                          background: 'var(--primary)',
                          color: 'white',
                          padding: '0.5rem 1rem',
                          borderRadius: '20px',
                          fontSize: '0.9rem'
                        }}>
                          {cat.name}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Manage Users */}
          {activeTab === 'users' && (
            <div>
              <h2>User Management</h2>
              {users.length === 0 ? <p>No users found.</p> : (
                <div style={{ overflowX: 'auto' }}>
                  <table className="admin-table">
                    <thead>
                      <tr>
                        <th>ID</th><th>Username</th><th>Email</th><th>Balance</th><th>Sales</th><th>Status</th><th>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {users.map(u => (
                        <tr key={u.user_id}>
                          <td>{u.user_id}</td>
                          <td>{u.username}</td>
                          <td>{u.email}</td>
                          <td>${u.balance}</td>
                          <td>${u.total_sales || '0.00'}</td>
                          <td>{u.is_restricted ? <span className="status-restricted">Restricted</span> : <span className="status-active">Active</span>}</td>
                          <td>
                            {u.is_restricted
                              ? <button onClick={() => restrictUser(u.user_id, false)} className="btn btn-success btn-small">Unrestrict</button>
                              : <button onClick={() => restrictUser(u.user_id, true)} className="btn btn-danger btn-small">Restrict</button>
                            }
                            {' '}
                            <button onClick={() => deleteUser(u.user_id)} className="btn btn-danger btn-small">
                              <i className="fas fa-trash"></i>
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

          {/* Manage Listings */}
          {activeTab === 'listings' && (
            <div>
              <h2>Listing Management</h2>

              {/* Restock Form Modal */}
              {restockListingId && (
                <div style={{ 
                  position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, 
                  background: 'rgba(0,0,0,0.5)', display: 'flex', 
                  alignItems: 'center', justifyContent: 'center', zIndex: 1000 
                }}>
                  <div style={{ background: 'white', padding: '2rem', borderRadius: '12px', maxWidth: '400px', width: '90%' }}>
                    <h3><i className="fas fa-boxes"></i> Restock Game</h3>
                    <form onSubmit={restockGame}>
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

              {adminListings.length === 0 ? <p>No listings found.</p> : (
                <div style={{ overflowX: 'auto' }}>
                  <table className="admin-table">
                    <thead>
                      <tr>
                        <th>ID</th><th>Game Name</th><th>Category</th><th>Seller</th><th>Price</th><th>Stock</th><th>Status</th><th>Approved</th><th>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {adminListings.map(l => (
                        <tr key={l.listing_id}>
                          <td>{l.listing_id}</td>
                          <td>{l.game_name}</td>
                          <td>{l.category_name || '-'}</td>
                          <td>{l.seller_name || 'Admin Store'}</td>
                          <td>${l.price}</td>
                          <td>{l.stock_quantity}</td>
                          <td><span className={`status-${l.status.toLowerCase()}`}>{l.status}</span></td>
                          <td>{l.admin_approved ? '✅' : '⏳'}</td>
                          <td>
                            {!l.admin_approved && (l.status === 'AVAILABLE' || l.status === 'OUT_OF_STOCK') ? (
                              <>
                                <button onClick={() => approveListing(l.listing_id, true)} className="btn btn-success btn-small">Approve</button>{' '}
                                <button onClick={() => approveListing(l.listing_id, false)} className="btn btn-danger btn-small">Reject</button>
                              </>
                            ) : l.admin_approved ? (
                              <>
                                <button onClick={() => approveListing(l.listing_id, false)} className="btn btn-danger btn-small">Disapprove</button>{' '}
                                <button onClick={() => setRestockListingId(l.listing_id)} className="btn btn-primary btn-small">
                                  <i className="fas fa-boxes"></i> Restock
                                </button>
                              </>
                            ) : 'N/A'}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

          {/* Add Game */}
          {activeTab === 'addGame' && (
            <div>
              <h2><i className="fas fa-gamepad"></i> Add Game for Sale</h2>
              <form onSubmit={handleAddGame} className="form-card">
                <div className="form-group">
                  <label>Game Name</label>
                  <input type="text" value={gameName} onChange={e => setGameName(e.target.value)} required placeholder="Enter game name" />
                </div>
                <div className="form-group">
                  <label>Category</label>
                  <select value={gameCategoryId} onChange={e => setGameCategoryId(e.target.value)}>
                    <option value="">Select Category</option>
                    {categories.map(cat => (
                      <option key={cat.category_id} value={cat.category_id}>{cat.name}</option>
                    ))}
                  </select>
                </div>
                <div className="form-group">
                  <label>Description</label>
                  <textarea value={gameDescription} onChange={e => setGameDescription(e.target.value)} required placeholder="Enter game description" />
                </div>
                <div className="form-group">
                  <label>Price ($)</label>
                  <input type="number" step="0.01" min="0.01" value={gamePrice} onChange={e => setGamePrice(e.target.value)} required placeholder="29.99" />
                </div>
                <div className="form-group">
                  <label>Game Key</label>
                  <input type="text" value={gameKey} onChange={e => setGameKey(e.target.value)} required placeholder="XXXX-XXXX-XXXX-XXXX" />
                </div>
                <div className="form-group">
                  <label>Trailer URL (optional)</label>
                  <input type="url" value={gameTrailerUrl} onChange={e => setGameTrailerUrl(e.target.value)} placeholder="https://youtube.com/watch?v=..." />
                </div>
                <button type="submit" className="btn btn-primary"><i className="fas fa-plus"></i> Add Game</button>
              </form>
            </div>
          )}

          {/* Categories */}
          {activeTab === 'categories' && (
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                <h2><i className="fas fa-folder" style={{ color: 'var(--primary)' }}></i> Game Categories</h2>
                <button onClick={() => setShowCategoryForm(!showCategoryForm)} className="btn btn-primary">
                  <i className="fas fa-plus"></i> Add Category
                </button>
              </div>

              {showCategoryForm && (
                <form onSubmit={handleCreateCategory} style={{ background: 'var(--light)', padding: '1.5rem', borderRadius: '8px', marginBottom: '1.5rem' }}>
                  <div className="form-group">
                    <label>Category Name</label>
                    <input type="text" value={categoryName} onChange={e => setCategoryName(e.target.value)} required />
                  </div>
                  <div className="form-group">
                    <label>Description (optional)</label>
                    <textarea value={categoryDescription} onChange={e => setCategoryDescription(e.target.value)} rows="2" />
                  </div>
                  <button type="submit" className="btn btn-primary">Create Category</button>
                  <button type="button" onClick={() => setShowCategoryForm(false)} className="btn btn-secondary" style={{ marginLeft: '0.5rem' }}>Cancel</button>
                </form>
              )}

              {categories.length === 0 ? (
                <p style={{ textAlign: 'center', color: 'var(--gray)', padding: '2rem' }}>No categories yet. Create one to organize your games!</p>
              ) : (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))', gap: '1rem' }}>
                  {categories.map(cat => (
                    <div key={cat.category_id} className="card" style={{ padding: '1.5rem' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                        <h3 style={{ margin: 0 }}>{cat.name}</h3>
                        <button onClick={() => deleteCategory(cat.category_id)} className="btn btn-danger btn-small">
                          <i className="fas fa-trash"></i>
                        </button>
                      </div>
                      {cat.description && <p style={{ color: 'var(--gray)', marginTop: '0.5rem' }}>{cat.description}</p>}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Events */}
          {activeTab === 'events' && (
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                <h2><i className="fas fa-calendar" style={{ color: 'var(--primary)' }}></i> Event Management</h2>
                <button onClick={() => setShowEventForm(!showEventForm)} className="btn btn-primary">
                  <i className="fas fa-plus"></i> Create Event
                </button>
              </div>

              {showEventForm && (
                <form onSubmit={handleCreateEvent} style={{ background: 'var(--light)', padding: '1.5rem', borderRadius: '8px', marginBottom: '1.5rem' }}>
                  <div className="form-group">
                    <label>Event Title</label>
                    <input type="text" value={eventTitle} onChange={e => setEventTitle(e.target.value)} required />
                  </div>
                  <div className="form-group">
                    <label>Description</label>
                    <textarea value={eventDescription} onChange={e => setEventDescription(e.target.value)} rows="3" required />
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                    <div className="form-group">
                      <label>Event Date & Time</label>
                      <input type="datetime-local" value={eventDate} onChange={e => setEventDate(e.target.value)} required />
                    </div>
                    <div className="form-group">
                      <label>Max Participants (optional)</label>
                      <input type="number" value={eventMaxParticipants} onChange={e => setEventMaxParticipants(e.target.value)} min="1" />
                    </div>
                  </div>
                  <button type="submit" className="btn btn-primary">Create Event</button>
                  <button type="button" onClick={() => setShowEventForm(false)} className="btn btn-secondary" style={{ marginLeft: '0.5rem' }}>Cancel</button>
                </form>
              )}

              {events.length === 0 ? (
                <p style={{ textAlign: 'center', color: 'var(--gray)', padding: '2rem' }}>No events yet.</p>
              ) : (
                <div style={{ display: 'grid', gap: '1rem' }}>
                  {events.map(event => (
                    <div key={event.event_id} className="card" style={{ padding: '1.5rem' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                        <div>
                          <h3 style={{ margin: '0 0 0.5rem' }}>{event.title}</h3>
                          <p style={{ margin: '0 0 0.5rem', color: 'var(--gray)' }}>{event.description}</p>
                          <p style={{ margin: 0 }}>
                            <i className="fas fa-clock" style={{ color: 'var(--primary)' }}></i> {new Date(event.event_date).toLocaleString()}
                            {event.max_participants && (
                              <span style={{ marginLeft: '1rem' }}>
                                <i className="fas fa-users"></i> {event.current_participants || 0}/{event.max_participants}
                              </span>
                            )}
                          </p>
                        </div>
                        <button onClick={() => deleteEvent(event.event_id)} className="btn btn-danger btn-small">
                          <i className="fas fa-trash"></i>
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Advertisements */}
          {activeTab === 'ads' && (
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                <h2><i className="fas fa-bullhorn" style={{ color: 'var(--primary)' }}></i> Advertisement Management</h2>
                <button onClick={() => setShowAdForm(!showAdForm)} className="btn btn-primary">
                  <i className="fas fa-plus"></i> Create Ad
                </button>
              </div>

              {showAdForm && (
                <form onSubmit={handleCreateAd} style={{ background: 'var(--light)', padding: '1.5rem', borderRadius: '8px', marginBottom: '1.5rem' }}>
                  <div className="form-group">
                    <label>Ad Title</label>
                    <input type="text" value={adTitle} onChange={e => setAdTitle(e.target.value)} required />
                  </div>
                  <div className="form-group">
                    <label>Description</label>
                    <textarea value={adDescription} onChange={e => setAdDescription(e.target.value)} rows="2" required />
                  </div>
                  <div className="form-group">
                    <label>Image URL (optional)</label>
                    <input type="url" value={adImageUrl} onChange={e => setAdImageUrl(e.target.value)} />
                  </div>
                  <div className="form-group">
                    <label>Link URL (optional)</label>
                    <input type="url" value={adLinkUrl} onChange={e => setAdLinkUrl(e.target.value)} />
                  </div>
                  <div className="form-group">
                    <label>End Date (optional)</label>
                    <input type="datetime-local" value={adEndDate} onChange={e => setAdEndDate(e.target.value)} />
                  </div>
                  <button type="submit" className="btn btn-primary">Create Ad</button>
                  <button type="button" onClick={() => setShowAdForm(false)} className="btn btn-secondary" style={{ marginLeft: '0.5rem' }}>Cancel</button>
                </form>
              )}

              {ads.length === 0 ? (
                <p style={{ textAlign: 'center', color: 'var(--gray)', padding: '2rem' }}>No advertisements yet.</p>
              ) : (
                <div style={{ display: 'grid', gap: '1rem' }}>
                  {ads.map(ad => (
                    <div key={ad.ad_id} className="card" style={{ padding: '1.5rem' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                        <div>
                          <h3 style={{ margin: '0 0 0.5rem' }}>{ad.title}</h3>
                          <p style={{ margin: '0 0 0.5rem', color: 'var(--gray)' }}>{ad.description}</p>
                          {ad.link_url && <a href={ad.link_url} target="_blank" rel="noopener noreferrer">View Link</a>}
                          {ad.end_date && <p style={{ margin: '0.5rem 0 0', fontSize: '0.85rem', color: 'var(--gray)' }}>Ends: {new Date(ad.end_date).toLocaleDateString()}</p>}
                        </div>
                        <button onClick={() => deleteAd(ad.ad_id)} className="btn btn-danger btn-small">
                          <i className="fas fa-trash"></i>
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Balance Requests */}
          {activeTab === 'balanceRequests' && (
            <div>
              <h2><i className="fas fa-coins"></i> Balance Addition Requests</h2>
              {balanceRequests.length === 0 ? <p>No balance requests found.</p> : (
                <div style={{ overflowX: 'auto' }}>
                  <table className="admin-table">
                    <thead>
                      <tr>
                        <th>ID</th><th>Username</th><th>Email</th><th>Amount</th><th>Status</th><th>Requested At</th><th>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {balanceRequests.map(r => {
                        const sc = r.status === 'PENDING' ? 'status-pending' : r.status === 'APPROVED' ? 'status-approved' : 'status-rejected'
                        return (
                          <tr key={r.request_id}>
                            <td>{r.request_id}</td>
                            <td>{r.username}</td>
                            <td>{r.email}</td>
                            <td>${parseFloat(r.amount).toFixed(2)}</td>
                            <td><span className={sc}>{r.status}</span></td>
                            <td>{new Date(r.created_at).toLocaleString()}</td>
                            <td>
                              {r.status === 'PENDING' ? (
                                <>
                                  <button onClick={() => processBalanceRequest(r.request_id, true)} className="btn btn-success btn-small">Approve</button>{' '}
                                  <button onClick={() => processBalanceRequest(r.request_id, false)} className="btn btn-danger btn-small">Reject</button>
                                </>
                              ) : 'Processed'}
                            </td>
                          </tr>
                        )
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

          {/* Help Questions */}
          {activeTab === 'helpQuestions' && (
            <div>
              <h2><i className="fas fa-question-circle"></i> Help Questions</h2>
              <p style={{ marginBottom: '1rem', color: 'var(--gray)' }}>Answer user questions from the Help Center</p>
              {helpQuestions.length === 0 ? <p>No questions found.</p> : (
                helpQuestions.map(q => {
                  const isAnswered = q.answer !== null
                  return (
                    <div key={q.question_id} style={{ background: 'white', padding: '1.5rem', borderRadius: '8px', marginBottom: '1rem', boxShadow: '0 2px 10px rgba(0,0,0,0.05)' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                        <strong style={{ color: 'var(--primary)' }}><i className="fas fa-user"></i> {q.username}</strong>
                        {isAnswered
                          ? <span className="status-approved">Answered</span>
                          : <span className="status-pending">Pending</span>
                        }
                      </div>
                      <p style={{ color: 'var(--dark)', marginBottom: '0.5rem' }}><strong>Question:</strong> {q.question}</p>
                      <small style={{ color: 'var(--gray)' }}>Asked: {new Date(q.created_at).toLocaleString()}</small>

                      {isAnswered ? (
                        <div style={{ background: 'var(--light)', padding: '1rem', borderRadius: '8px', marginTop: '1rem' }}>
                          <p style={{ color: 'var(--success)' }}><strong>Answer:</strong> {q.answer}</p>
                        </div>
                      ) : (
                        <div style={{ marginTop: '1rem' }}>
                          <textarea
                            rows="3"
                            placeholder="Type your answer..."
                            style={{ width: '100%', padding: '0.5rem', border: '1px solid #ddd', borderRadius: '4px' }}
                            value={answers[q.question_id] || ''}
                            onChange={e => setAnswers(prev => ({ ...prev, [q.question_id]: e.target.value }))}
                          />
                          <button onClick={() => answerQuestion(q.question_id)} className="btn btn-success btn-small" style={{ marginTop: '0.5rem' }}>
                            Submit Answer
                          </button>
                        </div>
                      )}
                    </div>
                  )
                })
              )}
            </div>
          )}

        </div>
      </div>
    </>
  )
}

export default AdminDashboard
