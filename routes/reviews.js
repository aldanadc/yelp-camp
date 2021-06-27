const express = require("express");
const router = express.Router( {mergeParams: true });
const catchAsync = require("../utils/catchAsync");
const Review = require("../db_models/review");
const Campground = require("../db_models/campground");
const { validateReview, isLoggedIn, isReviewAuthor } = require("../middleware/middleware");


router.post("/", isLoggedIn, validateReview, (catchAsync(async(request, response) => {
  const { id } = request.params;
  const campground = await Campground.findById(id);
  const review = new Review(request.body.review);
  review.author = request.user._id;
  campground.reviews.push(review);
  await review.save();
  await campground.save();
  request.flash("success", "Your review was added!");
  response.redirect(`/campgrounds/${campground._id}`);
})));

router.delete("/:reviewId", isLoggedIn, isReviewAuthor, catchAsync(async (request, response) => {
  const { id, reviewId } = request.params;
  await Campground.findByIdAndUpdate(id, {$pull: { reviews: reviewId }});
  await Review.findByIdAndDelete(reviewId);
  request.flash("success", "Your review was deleted");
  response.redirect(`/campgrounds/${id}`);
}));

module.exports = router;