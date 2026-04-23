const express = require('express');
const router = express.Router();
const ListingPresenter = require('../presenters/ListingPresenter');

// Categories
router.get('/categories', ListingPresenter.getCategories);
router.post('/admin/category/create', ListingPresenter.createCategory);
router.delete('/admin/category/:id', ListingPresenter.deleteCategory);

// Listings Core
router.get('/listings', ListingPresenter.getListings);
router.post('/listing/create', ListingPresenter.createListing);
router.get('/listing/:id', ListingPresenter.getListingDetail);

// User Listing Interactions
router.get('/user/my-listings', ListingPresenter.getMyListings);
router.post('/user/restock', ListingPresenter.restock);
router.post('/listing/buy', ListingPresenter.buy);
router.get('/user/purchases', ListingPresenter.getPurchases);

// Reviews
router.post('/listing/:id/review', ListingPresenter.createReview);
router.get('/listing/:id/reviews', ListingPresenter.getReviews);

module.exports = router;
