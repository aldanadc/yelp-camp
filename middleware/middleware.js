const { campgroundSchema, reviewSchema } = require("../joiSchemas.js");
const ExpressError = require("../utils/ExpressError");
const Campground = require("../db_models/campground");
const Review = require("../db_models/review");
const mongooseObjectId = require('mongoose').Types.ObjectId;

const isLoggedIn = (request, response, next) => {
  if (!request.isAuthenticated()) {
    request.session.returnTo = request.originalUrl;
    request.flash("error", "You must be signed in first");
    return response.redirect("/login");
  } else {
    next();
  }
}

const validateCampground = (request, response, next) => {
  const { error } = campgroundSchema.validate(request.body);
  if (error) {
    const msg = error.details.map(el => el.message).join(",");
    throw new ExpressError(msg, 400);
  } else {
    next();
  }
}

const isAuthor = (request, response, next) => {
  const { id } = request.params;
  Campground.findById(id, function(err, campground) {
    if (err || !campground) {
      request.flash("error", "A campground with the specified ID does not exist");
      return response.redirect("/campgrounds");
    }else if (!campground.author.equals(request.user._id)) {
      request.flash("error", "You don't have permission to do that");
      return response.redirect(`/campgrounds/${id}`);
    }
    next();
  })
}

const validateReview = (request, response, next) => {
  const { error } = reviewSchema.validate(request.body);
  if (error) {
    const msg = error.details.map(el => el.message).join(",");
    throw new ExpressError(msg, 400);
  } else {
    next();
  }
}

const isReviewAuthor = async(request, response, next) => {
  const { id, reviewId } = request.params;
  const review = await Review.findById(reviewId);
  if (!review.author.equals(request.user._id)) {
    request.flash("error", "You don't have permission to do that");
    return response.redirect(`/campgrounds/${id}`);
  }
  next();
}

module.exports = { isLoggedIn, validateCampground, isAuthor, validateReview, isReviewAuthor }
