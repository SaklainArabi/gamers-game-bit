# Gamers' Gambit API Documentation v2.0

## Table of Contents
- [Authentication](#authentication)
- [User Management](#user-management)
- [Game Categories](#game-categories)
- [Game Listings](#game-listings)
- [Purchases](#purchases)
- [Wishlist](#wishlist)
- [Reviews](#reviews)
- [Community Forum](#community-forum)
- [Events](#events)
- [Leaderboard](#leaderboard)
- [Subscriptions](#subscriptions)
- [Notifications](#notifications)
- [Advertisements](#advertisements)
- [Referral System](#referral-system)
- [Game Comparison](#game-comparison)
- [Help & Live Chat](#help--live-chat)
- [Localization](#localization)
- [Admin Endpoints](#admin-endpoints)

---

## Authentication

### Check Session
**Endpoint:** `GET /api/check-session`  
**Auth Required:** No  
**Description:** Check if user is logged in and get user info.

**Response:**
```json
{
  "success": true,
  "user": {
    "userId": 1,
    "username": "john_doe",
    "email": "john@example.com",
    "role": "user"
  }
}
```

---

### User Login
**Endpoint:** `POST /api/login`  
**Auth Required:** No

**Request Body:**
```json
{
  "email": "john@example.com",
  "password": "password123"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Login successful",
  "user": { "id": 1, "username": "john_doe" }
}
```

---

### User Register
**Endpoint:** `POST /api/register`  
**Auth Required:** No

**Request Body:**
```json
{
  "username": "john_doe",
  "email": "john@example.com",
  "password": "password123",
  "confirmPassword": "password123",
  "referralCode": "ABC123"  // Optional
}
```

---

### Admin Login
**Endpoint:** `POST /api/admin/login`  
**Auth Required:** No

**Request Body:**
```json
{
  "email": "admin@example.com",
  "password": "adminpass"
}
```

---

### Admin Register
**Endpoint:** `POST /api/admin/register`  
**Auth Required:** No

**Request Body:**
```json
{
  "username": "admin_user",
  "email": "admin@example.com",
  "password": "adminpass"
}
```

---

### Logout
**Endpoint:** `POST /api/logout`  
**Auth Required:** Yes

**Response:**
```json
{
  "success": true,
  "message": "Logged out successfully"
}
```

---

### Delete Account
**Endpoint:** `DELETE /api/user/delete-account`  
**Auth Required:** User session

**Response:**
```json
{
  "success": true,
  "message": "Account deleted successfully"
}
```

---

## User Management

### Get User Profile
**Endpoint:** `GET /api/user/profile`  
**Auth Required:** User session

**Response:**
```json
{
  "success": true,
  "profile": {
    "user_id": 1,
    "username": "john_doe",
    "email": "john@example.com",
    "balance": 150.00,
    "referral_code": "ABC123",
    "created_at": "2025-01-01T00:00:00.000Z",
    "subscription": {
      "tier": "PRO",
      "discount_percent": 20,
      "end_date": "2025-02-01T00:00:00.000Z"
    }
  }
}
```

---

### Request Balance Addition
**Endpoint:** `POST /api/user/request-balance`  
**Auth Required:** User session

**Request Body:**
```json
{
  "amount": 50.00
}
```

**Response:**
```json
{
  "success": true,
  "message": "Balance request submitted. Waiting for admin approval."
}
```

---

### Get User's Balance Requests
**Endpoint:** `GET /api/user/balance-requests`  
**Auth Required:** User session

**Response:**
```json
{
  "success": true,
  "requests": [
    {
      "request_id": 1,
      "amount": 50.00,
      "status": "PENDING",
      "created_at": "2025-01-15T10:30:00.000Z"
    }
  ]
}
```

---

## Game Categories

### Get All Categories
**Endpoint:** `GET /api/categories`  
**Auth Required:** No

**Response:**
```json
{
  "success": true,
  "categories": [
    { "category_id": 1, "name": "Action", "icon": "fa-gun" },
    { "category_id": 2, "name": "RPG", "icon": "fa-dragon" },
    { "category_id": 3, "name": "Sports", "icon": "fa-futbol" }
  ]
}
```

---

## Game Listings

### Get All Listings
**Endpoint:** `GET /api/listings`  
**Auth Required:** No  
**Query Params:** `?category=1&search=keyword&sort=price_asc`

**Response:**
```json
{
  "success": true,
  "listings": [
    {
      "listing_id": 1,
      "game_name": "Epic Adventure",
      "description": "An amazing RPG game",
      "price": 29.99,
      "seller_username": "game_seller",
      "category_id": 2,
      "category_name": "RPG",
      "trailer_url": "https://youtube.com/watch?v=xxx",
      "screenshots": "[\"img1.jpg\", \"img2.jpg\"]",
      "rating": 4.5,
      "review_count": 15,
      "created_at": "2025-01-10T00:00:00.000Z"
    }
  ]
}
```

---

### Get Single Game Details
**Endpoint:** `GET /api/listings/:id`  
**Auth Required:** No

**Response:**
```json
{
  "success": true,
  "listing": {
    "listing_id": 1,
    "game_name": "Epic Adventure",
    "description": "An amazing RPG game",
    "price": 29.99,
    "seller_username": "game_seller",
    "category_name": "RPG",
    "trailer_url": "https://youtube.com/watch?v=xxx",
    "screenshots": "[\"img1.jpg\", \"img2.jpg\"]",
    "rating": 4.5,
    "review_count": 15
  }
}
```

---

### Create Listing (User)
**Endpoint:** `POST /api/listings`  
**Auth Required:** User session

**Request Body:**
```json
{
  "gameName": "My Game",
  "description": "Game description",
  "price": 19.99,
  "gameKey": "XXXX-XXXX-XXXX-XXXX",
  "categoryId": 1,
  "trailerUrl": "https://youtube.com/watch?v=xxx"
}
```

---

### Get User's Listings
**Endpoint:** `GET /api/user/listings`  
**Auth Required:** User session

---

### Get Featured Games
**Endpoint:** `GET /api/listings/featured`  
**Auth Required:** No

**Response:**
```json
{
  "success": true,
  "listings": [/* top 6 rated approved games */]
}
```

---

## Purchases

### Buy Game
**Endpoint:** `POST /api/buy`  
**Auth Required:** User session  
**Description:** Purchase a game. Subscription discount is auto-applied.

**Request Body:**
```json
{
  "listingId": 1
}
```

**Response:**
```json
{
  "success": true,
  "message": "Game purchased successfully!",
  "gameKey": "XXXX-XXXX-XXXX-XXXX",
  "discount": 20,
  "finalPrice": 23.99
}
```

---

### Get Purchase History
**Endpoint:** `GET /api/user/purchases`  
**Auth Required:** User session

**Response:**
```json
{
  "success": true,
  "purchases": [
    {
      "transaction_id": 1,
      "game_name": "Epic Adventure",
      "price": 29.99,
      "final_price": 23.99,
      "discount_applied": 20,
      "game_key": "XXXX-XXXX-XXXX-XXXX",
      "purchased_at": "2025-01-15T12:00:00.000Z"
    }
  ]
}
```

---

## Wishlist

### Get User Wishlist
**Endpoint:** `GET /api/user/wishlist`  
**Auth Required:** User session

**Response:**
```json
{
  "success": true,
  "wishlist": [
    {
      "wishlist_id": 1,
      "listing_id": 5,
      "game_name": "Space Explorer",
      "price": 39.99,
      "category_name": "Action",
      "added_at": "2025-01-10T00:00:00.000Z"
    }
  ]
}
```

---

### Add to Wishlist
**Endpoint:** `POST /api/user/wishlist`  
**Auth Required:** User session

**Request Body:**
```json
{
  "listingId": 5
}
```

---

### Remove from Wishlist
**Endpoint:** `DELETE /api/user/wishlist/:listingId`  
**Auth Required:** User session

---

### Check Wishlist Status
**Endpoint:** `GET /api/user/wishlist/check/:listingId`  
**Auth Required:** User session

**Response:**
```json
{
  "success": true,
  "inWishlist": true
}
```

---

## Reviews

### Get Reviews for a Game
**Endpoint:** `GET /api/reviews/:listingId`  
**Auth Required:** No

**Response:**
```json
{
  "success": true,
  "reviews": [
    {
      "review_id": 1,
      "username": "buyer123",
      "rating": 5,
      "comment": "Amazing game!",
      "created_at": "2025-01-12T00:00:00.000Z"
    }
  ]
}
```

---

### Submit Review
**Endpoint:** `POST /api/reviews`  
**Auth Required:** User session  
**Requirement:** User must have purchased the game

**Request Body:**
```json
{
  "listingId": 1,
  "rating": 5,
  "comment": "Great game, highly recommend!"
}
```

---

## Community Forum

### Get All Threads
**Endpoint:** `GET /api/community/threads`  
**Auth Required:** No

**Response:**
```json
{
  "success": true,
  "threads": [
    {
      "thread_id": 1,
      "title": "Best RPG games of 2025?",
      "content": "Looking for recommendations...",
      "username": "gamer123",
      "upvotes": 15,
      "user_upvoted": false,
      "comment_count": 8,
      "created_at": "2025-01-15T00:00:00.000Z"
    }
  ]
}
```

---

### Get Single Thread with Comments
**Endpoint:** `GET /api/community/threads/:id`  
**Auth Required:** No

**Response:**
```json
{
  "success": true,
  "thread": { /* thread data */ },
  "comments": [
    {
      "comment_id": 1,
      "content": "I recommend Dragon Quest!",
      "username": "rpgfan",
      "upvotes": 5,
      "user_upvoted": true,
      "created_at": "2025-01-15T01:00:00.000Z"
    }
  ]
}
```

---

### Create Thread
**Endpoint:** `POST /api/community/threads`  
**Auth Required:** User session

**Request Body:**
```json
{
  "title": "Best RPG games of 2025?",
  "content": "Looking for recommendations for good RPG games."
}
```

---

### Add Comment
**Endpoint:** `POST /api/community/threads/:threadId/comments`  
**Auth Required:** User session

**Request Body:**
```json
{
  "content": "I highly recommend Dragon Quest!"
}
```

---

### Upvote/Remove Upvote Thread
**Endpoint:** `POST /api/community/threads/:threadId/upvote`  
**Auth Required:** User session  
**Description:** Toggles upvote on/off

**Response:**
```json
{
  "success": true,
  "upvoted": true,
  "newCount": 16
}
```

---

### Upvote/Remove Upvote Comment
**Endpoint:** `POST /api/community/comments/:commentId/upvote`  
**Auth Required:** User session

---

## Events

### Get All Events
**Endpoint:** `GET /api/events`  
**Auth Required:** No

**Response:**
```json
{
  "success": true,
  "events": [
    {
      "event_id": 1,
      "title": "Winter Sale 2025",
      "description": "Huge discounts on all games!",
      "event_date": "2025-02-01",
      "end_date": "2025-02-15",
      "status": "UPCOMING",
      "registration_count": 45
    }
  ]
}
```

---

### Register for Event
**Endpoint:** `POST /api/events/:eventId/register`  
**Auth Required:** User session

---

### Check Event Registration
**Endpoint:** `GET /api/events/:eventId/check-registration`  
**Auth Required:** User session

**Response:**
```json
{
  "success": true,
  "registered": true
}
```

---

## Leaderboard

### Get Seller Leaderboard
**Endpoint:** `GET /api/leaderboard`  
**Auth Required:** No

**Response:**
```json
{
  "success": true,
  "leaderboard": [
    {
      "seller_id": 5,
      "username": "top_seller",
      "total_sales": 150,
      "total_revenue": 4500.00
    }
  ]
}
```

---

## Subscriptions

### Get Subscription Plans
**Endpoint:** `GET /api/subscriptions/plans`  
**Auth Required:** No

**Response:**
```json
{
  "success": true,
  "plans": [
    { "tier": "BASIC", "price": 4.99, "discount_percent": 10 },
    { "tier": "PRO", "price": 9.99, "discount_percent": 20 },
    { "tier": "ELITE", "price": 19.99, "discount_percent": 30 }
  ]
}
```

---

### Get User Subscription
**Endpoint:** `GET /api/user/subscription`  
**Auth Required:** User session

**Response:**
```json
{
  "success": true,
  "subscription": {
    "tier": "PRO",
    "discount_percent": 20,
    "start_date": "2025-01-01T00:00:00.000Z",
    "end_date": "2025-02-01T00:00:00.000Z",
    "is_active": true
  }
}
```

---

### Subscribe
**Endpoint:** `POST /api/user/subscribe`  
**Auth Required:** User session

**Request Body:**
```json
{
  "tier": "PRO"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Subscribed to PRO plan successfully!",
  "subscription": { /* subscription details */ }
}
```

---

## Notifications

### Get User Notifications
**Endpoint:** `GET /api/user/notifications`  
**Auth Required:** User session

**Response:**
```json
{
  "success": true,
  "notifications": [
    {
      "notification_id": 1,
      "type": "PURCHASE",
      "message": "Your purchase of Epic Adventure was successful!",
      "is_read": false,
      "created_at": "2025-01-15T12:00:00.000Z"
    }
  ]
}
```

---

### Mark Notification as Read
**Endpoint:** `POST /api/user/notifications/:id/read`  
**Auth Required:** User session

---

### Mark All Notifications as Read
**Endpoint:** `POST /api/user/notifications/read-all`  
**Auth Required:** User session

---

## Advertisements

### Get Active Advertisements
**Endpoint:** `GET /api/advertisements`  
**Auth Required:** No

**Response:**
```json
{
  "success": true,
  "advertisements": [
    {
      "ad_id": 1,
      "title": "Summer Sale!",
      "image_url": "/images/summer-sale.jpg",
      "link_url": "/events",
      "position": "HOME_BANNER"
    }
  ]
}
```

---

## Referral System

### Get Referral Info
**Endpoint:** `GET /api/user/referral-info`  
**Auth Required:** User session

**Response:**
```json
{
  "success": true,
  "referralCode": "ABC123",
  "referralCount": 5,
  "totalBonus": 25.00
}
```

---

### Apply Referral Code
**Endpoint:** `POST /api/user/apply-referral`  
**Auth Required:** User session  
**Description:** Apply a referral code (typically used during registration)

**Request Body:**
```json
{
  "referralCode": "XYZ789"
}
```

---

## Game Comparison

### Compare Games
**Endpoint:** `POST /api/compare`  
**Auth Required:** No  
**Description:** Compare 2-4 games side by side

**Request Body:**
```json
{
  "listingIds": [1, 2, 3]
}
```

**Response:**
```json
{
  "success": true,
  "games": [
    {
      "listing_id": 1,
      "game_name": "Epic Adventure",
      "price": 29.99,
      "category_name": "RPG",
      "rating": 4.5,
      "review_count": 15,
      "seller_username": "seller1"
    },
    // ... more games
  ]
}
```

---

## Help & Live Chat

### Get Help Questions
**Endpoint:** `GET /api/help/questions`  
**Auth Required:** No

**Response:**
```json
{
  "success": true,
  "questions": [
    {
      "question_id": 1,
      "username": "user123",
      "question": "How do I sell a game?",
      "answer": "Go to your dashboard...",
      "created_at": "2025-01-15T00:00:00.000Z",
      "answered_at": "2025-01-15T01:00:00.000Z"
    }
  ]
}
```

---

### Ask Question
**Endpoint:** `POST /api/help/ask`  
**Auth Required:** User session

**Request Body:**
```json
{
  "question": "How do subscriptions work?"
}
```

---

### Get Chat History
**Endpoint:** `GET /api/help/chat-history`  
**Auth Required:** User session

**Response:**
```json
{
  "success": true,
  "messages": [
    {
      "message_id": 1,
      "message": "I need help with my purchase",
      "admin_reply": "Sure, what's the issue?",
      "created_at": "2025-01-15T12:00:00.000Z"
    }
  ]
}
```

---

### Send Chat Message
**Endpoint:** `POST /api/help/chat`  
**Auth Required:** User session

**Request Body:**
```json
{
  "message": "I need help with my purchase"
}
```

---

## Localization

### Get Available Languages
**Endpoint:** `GET /api/localization/languages`  
**Auth Required:** No

**Response:**
```json
{
  "success": true,
  "languages": [
    { "code": "en", "name": "English" },
    { "code": "es", "name": "Spanish" },
    { "code": "fr", "name": "French" },
    { "code": "de", "name": "German" },
    { "code": "ja", "name": "Japanese" },
    { "code": "zh", "name": "Chinese" }
  ]
}
```

---

### Get Translations
**Endpoint:** `GET /api/localization/:lang`  
**Auth Required:** No

**Response:**
```json
{
  "success": true,
  "translations": {
    "welcome": "Welcome to Gamers' Gambit",
    "home": "Home",
    "login": "Login",
    // ... more translations
  }
}
```

---

## Admin Endpoints

### Admin Statistics
**Endpoint:** `GET /api/admin/stats`  
**Auth Required:** Admin session

**Response:**
```json
{
  "success": true,
  "stats": {
    "totalUsers": 150,
    "totalListings": 85,
    "pendingApprovals": 12,
    "totalTransactions": 320,
    "totalRevenue": 9500.00
  }
}
```

---

### Get All Users
**Endpoint:** `GET /api/admin/users`  
**Auth Required:** Admin session

---

### Delete User
**Endpoint:** `DELETE /api/admin/users/:userId`  
**Auth Required:** Admin session

---

### Get All Listings (Admin)
**Endpoint:** `GET /api/admin/listings`  
**Auth Required:** Admin session

---

### Approve/Reject Listing
**Endpoint:** `POST /api/admin/approve-listing`  
**Auth Required:** Admin session

**Request Body:**
```json
{
  "listingId": 1,
  "approve": true
}
```

---

### Admin Create Game Listing
**Endpoint:** `POST /api/admin/create-listing`  
**Auth Required:** Admin session

**Request Body:**
```json
{
  "gameName": "Game Title",
  "description": "Game description",
  "price": 29.99,
  "gameKey": "XXXX-XXXX-XXXX-XXXX",
  "categoryId": 1,
  "trailerUrl": "https://youtube.com/watch?v=xxx"
}
```

---

### Manage Categories (Admin)

#### Get All Categories
**Endpoint:** `GET /api/admin/categories`  
**Auth Required:** Admin session

#### Create Category
**Endpoint:** `POST /api/admin/categories`  
**Auth Required:** Admin session

**Request Body:**
```json
{
  "name": "Horror",
  "icon": "fa-ghost"
}
```

#### Delete Category
**Endpoint:** `DELETE /api/admin/categories/:categoryId`  
**Auth Required:** Admin session

---

### Manage Events (Admin)

#### Get All Events
**Endpoint:** `GET /api/admin/events`  
**Auth Required:** Admin session

#### Create Event
**Endpoint:** `POST /api/admin/events`  
**Auth Required:** Admin session

**Request Body:**
```json
{
  "title": "Spring Sale",
  "description": "Big discounts!",
  "eventDate": "2025-03-01",
  "endDate": "2025-03-15"
}
```

#### Update Event
**Endpoint:** `PUT /api/admin/events/:eventId`  
**Auth Required:** Admin session

#### Delete Event
**Endpoint:** `DELETE /api/admin/events/:eventId`  
**Auth Required:** Admin session

---

### Manage Advertisements (Admin)

#### Get All Advertisements
**Endpoint:** `GET /api/admin/advertisements`  
**Auth Required:** Admin session

#### Create Advertisement
**Endpoint:** `POST /api/admin/advertisements`  
**Auth Required:** Admin session

**Request Body:**
```json
{
  "title": "Summer Sale",
  "imageUrl": "/images/banner.jpg",
  "linkUrl": "/events",
  "position": "HOME_BANNER",
  "startDate": "2025-06-01",
  "endDate": "2025-06-30"
}
```

#### Delete Advertisement
**Endpoint:** `DELETE /api/admin/advertisements/:adId`  
**Auth Required:** Admin session

---

### Balance Requests (Admin)

#### Get All Balance Requests
**Endpoint:** `GET /api/admin/balance-requests`  
**Auth Required:** Admin session

#### Process Balance Request
**Endpoint:** `POST /api/admin/process-balance-request`  
**Auth Required:** Admin session

**Request Body:**
```json
{
  "requestId": 1,
  "approve": true
}
```

---

### Help Questions (Admin)

#### Get All Help Questions
**Endpoint:** `GET /api/admin/help-questions`  
**Auth Required:** Admin session

#### Answer Question
**Endpoint:** `POST /api/admin/answer-question`  
**Auth Required:** Admin session

**Request Body:**
```json
{
  "questionId": 1,
  "answer": "To sell a game, go to your dashboard..."
}
```

---

### Live Chat Support (Admin)

#### Get All Chat Messages
**Endpoint:** `GET /api/admin/chat-messages`  
**Auth Required:** Admin session

#### Reply to Chat
**Endpoint:** `POST /api/admin/chat-reply`  
**Auth Required:** Admin session

**Request Body:**
```json
{
  "messageId": 1,
  "reply": "Sure, I can help you with that!"
}
```

---

## Status Codes

| Code | Description |
|------|-------------|
| 200  | Success |
| 400  | Bad request (validation error) |
| 401  | Unauthorized (not logged in) |
| 403  | Forbidden (wrong user type or permission denied) |
| 404  | Not found |
| 500  | Server error |

---

## Real-time Features (Socket.IO)

The server uses Socket.IO for real-time features:

### Events
- `notification` - Sent to user when they receive a notification
- `chat-message` - Sent when admin replies to a chat message

### Connection
```javascript
import { io } from 'socket.io-client'

const socket = io('http://localhost:3000')

socket.on('notification', (data) => {
  console.log('New notification:', data)
})

socket.on('chat-message', (data) => {
  console.log('Chat reply:', data)
})
```

---

## Database Schema Overview

### Core Tables
- **User** - User accounts with balance and referral codes
- **Admin** - Admin accounts
- **Game_Category** - Game categories
- **Game_Listing** - Game listings with category, trailer, screenshots
- **Transaction** - Purchase history with discount tracking
- **Balance_Request** - User balance addition requests

### Feature Tables
- **Subscription** - User subscription plans
- **Wishlist** - User wishlists
- **Game_Review** - Game reviews and ratings
- **Thread** / **Comment** - Community forum
- **Thread_Upvote** / **Comment_Upvote** - Upvote tracking
- **Event** / **Event_Registration** - Events system
- **Notification** - User notifications
- **Advertisement** - Ad banners
- **Referral** - Referral tracking
- **Chat_Message** - Live chat messages
- **Help_Question** - Q&A forum

---

## Environment Variables

Create a `.env` file with:

```env
PORT=3000
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=your_password
DB_NAME=game_marketplace
SESSION_SECRET=your_session_secret
STRIPE_SECRET_KEY=sk_test_xxx
STRIPE_WEBHOOK_SECRET=whsec_xxx
```

---

## Running the Server

```bash
# Install dependencies
npm install

# Start server
npm start

# Development with auto-reload
npm run dev
```

The server runs on `http://localhost:3000` by default.
