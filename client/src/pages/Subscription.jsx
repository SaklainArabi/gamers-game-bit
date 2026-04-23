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

const plans = [
  {
    id: 'basic',
    name: 'Basic',
    price: 4.99,
    icon: 'fa-gamepad',
    color: '#3498db',
    features: [
      '10% discount on all purchases',
      'Early access to sales',
      'Monthly newsletter',
      'Priority support'
    ]
  },
  {
    id: 'pro',
    name: 'Pro Gamer',
    price: 9.99,
    icon: 'fa-trophy',
    color: '#9b59b6',
    popular: true,
    features: [
      '20% discount on all purchases',
      'Early access to new listings',
      'Exclusive game bundles',
      'Premium support 24/7',
      'Ad-free experience',
      'Custom profile badge'
    ]
  },
  {
    id: 'elite',
    name: 'Elite',
    price: 19.99,
    icon: 'fa-crown',
    color: '#f39c12',
    features: [
      '30% discount on all purchases',
      'First access to rare games',
      'Personal game curator',
      'Dedicated support agent',
      'Ad-free experience',
      'Exclusive elite badge',
      'Free monthly game key'
    ]
  }
]

function Subscription() {
  const navigate = useNavigate()
  const [currentUser, setCurrentUser] = useState(null)
  const [currentSub, setCurrentSub] = useState(null)
  const [loading, setLoading] = useState(true)
  const [processingPlan, setProcessingPlan] = useState(null)

  useEffect(() => {
    checkAuth()
  }, [])

  async function checkAuth() {
    setLoading(true)
    try {
      const res = await fetch('/api/check-session')
      const data = await res.json()
      if (data.success) {
        setCurrentUser(data.user)
        loadSubscription()
      } else {
        navigate('/login')
      }
    } catch (err) {
      navigate('/login')
    }
  }

  async function loadSubscription() {
    try {
      const res = await fetch('/api/subscription')
      const data = await res.json()
      if (data.success && data.subscription) {
        setCurrentSub(data.subscription)
      }
    } catch (err) {
      console.error('Error loading subscription:', err)
    }
    setLoading(false)
  }

  async function subscribeToPlan(plan) {
    if (!confirm(`Subscribe to ${plan.name} for $${plan.price}/month?`)) return

    setProcessingPlan(plan.id)
    try {
      const res = await fetch('/api/subscription/subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ planName: plan.id, price: plan.price })
      })
      const data = await res.json()
      if (data.success) {
        alert(`Successfully subscribed to ${plan.name}! Enjoy your ${plan.features[0].toLowerCase()}.`)
        loadSubscription()
      } else {
        alert(data.message)
      }
    } catch (err) {
      alert('Error processing subscription')
    }
    setProcessingPlan(null)
  }

  async function cancelSubscription() {
    if (!confirm('Are you sure you want to cancel your subscription? You will lose all benefits.')) return

    try {
      const res = await fetch('/api/subscription/cancel', { method: 'POST' })
      const data = await res.json()
      if (data.success) {
        alert('Subscription cancelled.')
        setCurrentSub(null)
      } else {
        alert(data.message)
      }
    } catch (err) {
      alert('Error cancelling subscription')
    }
  }

  if (loading) {
    return (
      <>
        <Navbar links={navLinks} />
        <div className="container" style={{ textAlign: 'center', padding: '5rem' }}>
          <i className="fas fa-spinner fa-spin fa-3x" style={{ color: 'var(--primary)' }}></i>
          <p>Loading...</p>
        </div>
      </>
    )
  }

  return (
    <>
      <Navbar links={navLinks} />

      <div className="container">
        <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
          <h1><i className="fas fa-gem" style={{ color: 'var(--primary)' }}></i> Subscription Plans</h1>
          <p style={{ color: 'var(--gray)', maxWidth: '600px', margin: '0 auto' }}>
            Subscribe to unlock exclusive discounts, early access to games, and premium features.
            Save up to 30% on every purchase!
          </p>
        </div>

        {currentSub && (
          <div className="card" style={{ 
            padding: '2rem', 
            marginBottom: '2rem', 
            background: 'linear-gradient(135deg, var(--primary), #9b59b6)',
            color: 'white'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
              <div>
                <h3 style={{ margin: 0 }}>
                  <i className="fas fa-check-circle"></i> Current Plan: {currentSub.plan_name.toUpperCase()}
                </h3>
                <p style={{ margin: '0.5rem 0 0' }}>
                  Valid until: {new Date(currentSub.end_date).toLocaleDateString()}
                </p>
              </div>
              <button 
                onClick={cancelSubscription}
                className="btn"
                style={{ background: 'rgba(255,255,255,0.2)', color: 'white' }}
              >
                <i className="fas fa-times"></i> Cancel Subscription
              </button>
            </div>
          </div>
        )}

        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', 
          gap: '2rem', 
          alignItems: 'start' 
        }}>
          {plans.map(plan => {
            const isCurrentPlan = currentSub && currentSub.plan_name === plan.id

            return (
              <div 
                key={plan.id} 
                className="card" 
                style={{ 
                  padding: '2rem', 
                  textAlign: 'center',
                  position: 'relative',
                  transform: plan.popular ? 'scale(1.05)' : 'none',
                  border: plan.popular ? `3px solid ${plan.color}` : 'none',
                  boxShadow: plan.popular ? `0 10px 30px rgba(155, 89, 182, 0.3)` : undefined
                }}
              >
                {plan.popular && (
                  <div style={{
                    position: 'absolute',
                    top: '-12px',
                    left: '50%',
                    transform: 'translateX(-50%)',
                    background: plan.color,
                    color: 'white',
                    padding: '0.25rem 1rem',
                    borderRadius: '20px',
                    fontSize: '0.8rem',
                    fontWeight: 'bold'
                  }}>
                    MOST POPULAR
                  </div>
                )}

                <div style={{
                  width: '80px',
                  height: '80px',
                  borderRadius: '50%',
                  background: `linear-gradient(135deg, ${plan.color}, ${plan.color}aa)`,
                  margin: '0 auto 1.5rem',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}>
                  <i className={`fas ${plan.icon}`} style={{ fontSize: '2rem', color: 'white' }}></i>
                </div>

                <h2 style={{ marginBottom: '0.5rem' }}>{plan.name}</h2>
                <div style={{ marginBottom: '1.5rem' }}>
                  <span style={{ fontSize: '3rem', fontWeight: 'bold', color: plan.color }}>${plan.price}</span>
                  <span style={{ color: 'var(--gray)' }}>/month</span>
                </div>

                <ul style={{ 
                  listStyle: 'none', 
                  padding: 0, 
                  margin: '0 0 2rem',
                  textAlign: 'left' 
                }}>
                  {plan.features.map((feature, index) => (
                    <li key={index} style={{ 
                      padding: '0.75rem 0', 
                      borderBottom: index < plan.features.length - 1 ? '1px solid var(--light)' : 'none',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.75rem'
                    }}>
                      <i className="fas fa-check" style={{ color: plan.color }}></i>
                      {feature}
                    </li>
                  ))}
                </ul>

                {isCurrentPlan ? (
                  <button 
                    className="btn" 
                    style={{ 
                      width: '100%', 
                      background: 'var(--success)', 
                      color: 'white',
                      cursor: 'default'
                    }}
                    disabled
                  >
                    <i className="fas fa-check-circle"></i> Current Plan
                  </button>
                ) : (
                  <button
                    onClick={() => subscribeToPlan(plan)}
                    className="btn btn-primary"
                    style={{ 
                      width: '100%', 
                      background: plan.color,
                      opacity: processingPlan === plan.id ? 0.7 : 1
                    }}
                    disabled={processingPlan === plan.id}
                  >
                    {processingPlan === plan.id ? (
                      <><i className="fas fa-spinner fa-spin"></i> Processing...</>
                    ) : (
                      <><i className="fas fa-rocket"></i> Subscribe Now</>
                    )}
                  </button>
                )}
              </div>
            )
          })}
        </div>

        {/* FAQ Section */}
        <div className="card" style={{ marginTop: '3rem', padding: '2rem' }}>
          <h2 style={{ marginBottom: '1.5rem' }}>
            <i className="fas fa-question-circle" style={{ color: 'var(--primary)' }}></i> Frequently Asked Questions
          </h2>
          
          <div style={{ display: 'grid', gap: '1rem' }}>
            <div style={{ padding: '1rem', background: 'var(--light)', borderRadius: '8px' }}>
              <strong>How does the discount work?</strong>
              <p style={{ margin: '0.5rem 0 0', color: 'var(--gray)' }}>
                Your discount is automatically applied at checkout when you purchase any game. 
                The discount percentage depends on your subscription tier.
              </p>
            </div>
            <div style={{ padding: '1rem', background: 'var(--light)', borderRadius: '8px' }}>
              <strong>Can I upgrade my plan?</strong>
              <p style={{ margin: '0.5rem 0 0', color: 'var(--gray)' }}>
                Yes! Simply select a higher tier plan and subscribe. Your current plan will be 
                replaced with the new one.
              </p>
            </div>
            <div style={{ padding: '1rem', background: 'var(--light)', borderRadius: '8px' }}>
              <strong>When can I cancel?</strong>
              <p style={{ margin: '0.5rem 0 0', color: 'var(--gray)' }}>
                You can cancel your subscription at any time. Your benefits will remain active 
                until the end of your billing period.
              </p>
            </div>
            <div style={{ padding: '1rem', background: 'var(--light)', borderRadius: '8px' }}>
              <strong>What payment methods are accepted?</strong>
              <p style={{ margin: '0.5rem 0 0', color: 'var(--gray)' }}>
                We accept all major credit cards through our secure Stripe payment system.
              </p>
            </div>
          </div>
        </div>

        <div style={{ textAlign: 'center', marginTop: '2rem' }}>
          <Link to="/" className="btn btn-secondary">
            <i className="fas fa-arrow-left"></i> Back to Home
          </Link>
        </div>
      </div>
    </>
  )
}

export default Subscription
