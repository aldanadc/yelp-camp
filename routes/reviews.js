const express = require("express");
const router = express.Router( {mergeParams: true });
const catchAsync = require("../utils/catchAsync");
const Review = require("../db_models/review");
const Campground = require("../db_models/campground");
const { validateReview, isLoggedIn, isReviewAuthor } = require("../middleware/middleware");
const { createReview, deleteReview } = require("../controllers/rewiews.controller");


router.post("/", isLoggedIn, validateReview, catchAsync(createReview));
router.delete("/:reviewId", isLoggedIn, isReviewAuthor, catchAsync(deleteReview));

module.exports = router;