const Campground = require("../db_models/campground");
const Review = require("../db_models/review");

const createReview = async(request, response) => {
  const { id } = request.params;
  const campground = await Campground.findById(id);
  const review = new Review(request.body.review);
  review.author = request.user._id;
  campground.reviews.push(review);
  await review.save();
  await campground.save();
  request.flash("success", "Your review was added!");
  response.redirect(`/campgrounds/${campground._id}`);
}

const deleteReview = async (request, response) => {
  const { id, reviewId } = request.params;
  await Campground.findByIdAndUpdate(id, {$pull: { reviews: reviewId }});
  await Review.findByIdAndDelete(reviewId);
  request.flash("success", "Your review was deleted");
  response.redirect(`/campgrounds/${id}`);
}

module.exports = { createReview, deleteReview }