
-- Create Database
CREATE DATABASE IF NOT EXISTS game_marketplace;
USE game_marketplace;

-- Drop existing tables (in reverse order of dependencies)
DROP TABLE IF EXISTS Chat_Message;
DROP TABLE IF EXISTS Help_Question;
DROP TABLE IF EXISTS Balance_Request;
DROP TABLE IF EXISTS Thread_Upvote;
DROP TABLE IF EXISTS Comment_Upvote;
DROP TABLE IF EXISTS Thread_Comment;
DROP TABLE IF EXISTS Thread;
DROP TABLE IF EXISTS Game_Review;
DROP TABLE IF EXISTS Wishlist;
DROP TABLE IF EXISTS Purchase;
DROP TABLE IF EXISTS Game_Listing;
DROP TABLE IF EXISTS Game_Category;
DROP TABLE IF EXISTS Event_Registration;
DROP TABLE IF EXISTS Event;
DROP TABLE IF EXISTS Notification;
DROP TABLE IF EXISTS Subscription;
DROP TABLE IF EXISTS Advertisement;
DROP TABLE IF EXISTS Referral;
DROP TABLE IF EXISTS User;
DROP TABLE IF EXISTS Admin;

-- Admin table
CREATE TABLE Admin (
    admin_id INT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(100) NOT NULL UNIQUE,
    email VARCHAR(150) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- User table (enhanced with subscription, referral, localization)
CREATE TABLE User (
    user_id INT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(100) NOT NULL UNIQUE,
    email VARCHAR(150) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    balance DECIMAL(10,2) DEFAULT 0.00,
    is_restricted BOOLEAN DEFAULT FALSE,
    referral_code VARCHAR(50) UNIQUE,
    referred_by INT,
    language_preference VARCHAR(10) DEFAULT 'en',
    profile_picture VARCHAR(500),
    bio TEXT,
    total_sales DECIMAL(10,2) DEFAULT 0.00,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (referred_by) REFERENCES User(user_id)
);

-- Subscription table (Stripe integration)
CREATE TABLE Subscription (
    subscription_id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    plan_type ENUM('MONTHLY', 'YEARLY') NOT NULL,
    stripe_subscription_id VARCHAR(255),
    stripe_customer_id VARCHAR(255),
    status ENUM('ACTIVE', 'CANCELLED', 'EXPIRED', 'PENDING') DEFAULT 'PENDING',
    discount_percentage DECIMAL(5,2) DEFAULT 20.00,
    start_date DATETIME,
    end_date DATETIME,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES User(user_id)
);

-- Game Category table
CREATE TABLE Game_Category (
    category_id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL UNIQUE,
    description TEXT,
    icon VARCHAR(100),
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Game Listings table (enhanced with category, trailer, screenshots, stock)
CREATE TABLE Game_Listing (
    listing_id INT AUTO_INCREMENT PRIMARY KEY,
    seller_id INT,
    category_id INT,
    game_name VARCHAR(200) NOT NULL,
    description TEXT,
    price DECIMAL(10,2) NOT NULL,
    game_key VARCHAR(255),
    stock_quantity INT DEFAULT 1,
    trailer_url VARCHAR(500),
    screenshots JSON,
    rating_avg DECIMAL(3,2) DEFAULT 0.00,
    rating_count INT DEFAULT 0,
    view_count INT DEFAULT 0,
    status ENUM('AVAILABLE', 'OUT_OF_STOCK', 'SOLD') DEFAULT 'AVAILABLE',
    admin_approved BOOLEAN DEFAULT FALSE,
    featured BOOLEAN DEFAULT FALSE,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (seller_id) REFERENCES User(user_id),
    FOREIGN KEY (category_id) REFERENCES Game_Category(category_id)
);

-- Game Reviews/Feedback table
CREATE TABLE Game_Review (
    review_id INT AUTO_INCREMENT PRIMARY KEY,
    listing_id INT NOT NULL,
    user_id INT NOT NULL,
    rating INT NOT NULL CHECK (rating >= 1 AND rating <= 5),
    review_text TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (listing_id) REFERENCES Game_Listing(listing_id),
    FOREIGN KEY (user_id) REFERENCES User(user_id),
    UNIQUE KEY unique_user_review (listing_id, user_id)
);

-- Purchases table (enhanced with Stripe)
CREATE TABLE Purchase (
    purchase_id INT AUTO_INCREMENT PRIMARY KEY,
    buyer_id INT NOT NULL,
    listing_id INT NOT NULL,
    purchase_price DECIMAL(10,2) NOT NULL,
    original_price DECIMAL(10,2) NOT NULL,
    discount_applied DECIMAL(5,2) DEFAULT 0.00,
    stripe_payment_id VARCHAR(255),
    payment_method ENUM('BALANCE', 'STRIPE') DEFAULT 'BALANCE',
    purchase_date DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (buyer_id) REFERENCES User(user_id),
    FOREIGN KEY (listing_id) REFERENCES Game_Listing(listing_id)
);

-- Wishlist table
CREATE TABLE Wishlist (
    wishlist_id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    game_name VARCHAR(200) NOT NULL,
    listing_id INT,
    notified BOOLEAN DEFAULT FALSE,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES User(user_id),
    FOREIGN KEY (listing_id) REFERENCES Game_Listing(listing_id),
    UNIQUE KEY unique_user_listing (user_id, listing_id),
    UNIQUE KEY unique_user_game (user_id, game_name)
);

-- Thread table for Community (enhanced with upvotes)
CREATE TABLE Thread (
    thread_id INT AUTO_INCREMENT PRIMARY KEY,
    title VARCHAR(200) NOT NULL,
    content TEXT NOT NULL,
    user_id INT NOT NULL,
    upvote_count INT DEFAULT 0,
    is_pinned BOOLEAN DEFAULT FALSE,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES User(user_id)
);

-- Thread Upvotes table
CREATE TABLE Thread_Upvote (
    upvote_id INT AUTO_INCREMENT PRIMARY KEY,
    thread_id INT NOT NULL,
    user_id INT NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (thread_id) REFERENCES Thread(thread_id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES User(user_id),
    UNIQUE KEY unique_thread_upvote (thread_id, user_id)
);

-- Thread Comments table
CREATE TABLE Thread_Comment (
    comment_id INT AUTO_INCREMENT PRIMARY KEY,
    thread_id INT NOT NULL,
    comment_text TEXT NOT NULL,
    user_id INT NOT NULL,
    upvote_count INT DEFAULT 0,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (thread_id) REFERENCES Thread(thread_id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES User(user_id)
);

-- Comment Upvotes table
CREATE TABLE Comment_Upvote (
    upvote_id INT AUTO_INCREMENT PRIMARY KEY,
    comment_id INT NOT NULL,
    user_id INT NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (comment_id) REFERENCES Thread_Comment(comment_id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES User(user_id),
    UNIQUE KEY unique_comment_upvote (comment_id, user_id)
);

-- Event Management table
CREATE TABLE Event (
    event_id INT AUTO_INCREMENT PRIMARY KEY,
    title VARCHAR(200) NOT NULL,
    description TEXT,
    event_type ENUM('TOURNAMENT', 'SALE', 'GIVEAWAY', 'MEETUP') NOT NULL,
    start_date DATETIME NOT NULL,
    end_date DATETIME NOT NULL,
    max_participants INT,
    prizes TEXT,
    banner_image VARCHAR(500),
    status ENUM('UPCOMING', 'ONGOING', 'COMPLETED', 'CANCELLED') DEFAULT 'UPCOMING',
    created_by INT NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (created_by) REFERENCES Admin(admin_id)
);

-- Event Registration table
CREATE TABLE Event_Registration (
    registration_id INT AUTO_INCREMENT PRIMARY KEY,
    event_id INT NOT NULL,
    user_id INT NOT NULL,
    placement INT,
    registered_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (event_id) REFERENCES Event(event_id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES User(user_id),
    UNIQUE KEY unique_event_registration (event_id, user_id)
);

-- Notification table (real-time)
CREATE TABLE Notification (
    notification_id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    type ENUM('PURCHASE', 'SALE', 'APPROVAL', 'WISHLIST', 'EVENT', 'COMMENT', 'SYSTEM', 'REFERRAL') NOT NULL,
    title VARCHAR(200) NOT NULL,
    message TEXT NOT NULL,
    link VARCHAR(500),
    is_read BOOLEAN DEFAULT FALSE,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES User(user_id) ON DELETE CASCADE
);

-- Advertisement Banner table
CREATE TABLE Advertisement (
    ad_id INT AUTO_INCREMENT PRIMARY KEY,
    title VARCHAR(200) NOT NULL,
    image_url VARCHAR(500) NOT NULL,
    link_url VARCHAR(500),
    listing_id INT,
    position ENUM('TOP', 'SIDEBAR', 'BOTTOM') DEFAULT 'TOP',
    is_active BOOLEAN DEFAULT TRUE,
    click_count INT DEFAULT 0,
    start_date DATETIME,
    end_date DATETIME,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (listing_id) REFERENCES Game_Listing(listing_id)
);

-- Referral System table
CREATE TABLE Referral (
    referral_id INT AUTO_INCREMENT PRIMARY KEY,
    referrer_id INT NOT NULL,
    referred_id INT NOT NULL,
    bonus_amount DECIMAL(10,2) DEFAULT 5.00,
    status ENUM('PENDING', 'COMPLETED') DEFAULT 'PENDING',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    completed_at DATETIME,
    FOREIGN KEY (referrer_id) REFERENCES User(user_id),
    FOREIGN KEY (referred_id) REFERENCES User(user_id),
    UNIQUE KEY unique_referral (referred_id)
);

-- Balance Request table
CREATE TABLE Balance_Request (
    request_id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    amount DECIMAL(10,2) NOT NULL,
    status ENUM('PENDING', 'APPROVED', 'REJECTED') DEFAULT 'PENDING',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    processed_at DATETIME,
    processed_by INT,
    FOREIGN KEY (user_id) REFERENCES User(user_id),
    FOREIGN KEY (processed_by) REFERENCES Admin(admin_id)
);

-- Help Question table
CREATE TABLE Help_Question (
    question_id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    question TEXT NOT NULL,
    answer TEXT,
    answered_by INT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    answered_at DATETIME,
    FOREIGN KEY (user_id) REFERENCES User(user_id),
    FOREIGN KEY (answered_by) REFERENCES Admin(admin_id)
);

-- Chat Message table (real-time support chat)
CREATE TABLE Chat_Message (
    message_id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    admin_id INT,
    message TEXT NOT NULL,
    sender_type ENUM('USER', 'ADMIN') NOT NULL,
    is_read BOOLEAN DEFAULT FALSE,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES User(user_id),
    FOREIGN KEY (admin_id) REFERENCES Admin(admin_id)
);

-- Insert default game categories
INSERT INTO Game_Category (name, description, icon) VALUES
('Action', 'Fast-paced games with combat and adventure', 'fa-bolt'),
('Adventure', 'Story-driven exploration games', 'fa-compass'),
('RPG', 'Role-playing games with character progression', 'fa-hat-wizard'),
('Strategy', 'Tactical and planning-based games', 'fa-chess'),
('Sports', 'Sports simulation and arcade games', 'fa-futbol'),
('Racing', 'Racing and driving games', 'fa-car'),
('Puzzle', 'Brain teasers and puzzle games', 'fa-puzzle-piece'),
('Shooter', 'First and third-person shooter games', 'fa-crosshairs'),
('Simulation', 'Life and business simulation games', 'fa-city'),
('Horror', 'Scary and survival horror games', 'fa-ghost'),
('Indie', 'Independent and unique games', 'fa-star'),
('Multiplayer', 'Online multiplayer games', 'fa-users');

-- Trigger to generate referral code for new users
DELIMITER //
CREATE TRIGGER generate_referral_code BEFORE INSERT ON User
FOR EACH ROW
BEGIN
    SET NEW.referral_code = CONCAT('GG', UPPER(SUBSTRING(MD5(RAND()), 1, 8)));
END//
DELIMITER ;

-- Trigger to update game rating average
DELIMITER //
CREATE TRIGGER update_game_rating AFTER INSERT ON Game_Review
FOR EACH ROW
BEGIN
    UPDATE Game_Listing 
    SET rating_avg = (SELECT AVG(rating) FROM Game_Review WHERE listing_id = NEW.listing_id),
        rating_count = (SELECT COUNT(*) FROM Game_Review WHERE listing_id = NEW.listing_id)
    WHERE listing_id = NEW.listing_id;
END//
DELIMITER ;

-- Trigger to update seller total sales
DELIMITER //
CREATE TRIGGER update_seller_sales AFTER INSERT ON Purchase
FOR EACH ROW
BEGIN
    DECLARE seller INT;
    SELECT seller_id INTO seller FROM Game_Listing WHERE listing_id = NEW.listing_id;
    IF seller IS NOT NULL THEN
        UPDATE User SET total_sales = total_sales + NEW.purchase_price WHERE user_id = seller;
    END IF;
END//
DELIMITER ;
