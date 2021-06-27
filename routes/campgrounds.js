const express = require("express");
const router = express.Router();
const catchAsync = require("../utils/catchAsync");
const Campground = require("../db_models/campground");
const { isLoggedIn, validateCampground, isAuthor } = require("../middleware/middleware");



router.get("/", catchAsync(async (request, response) => {
  const campgrounds = await Campground.find({});
  response.render("campgrounds/index", { campgrounds })
}));

router.get("/new", isLoggedIn, (request, response) => {
  response.render("campgrounds/new");
});

router.post("/", isLoggedIn, validateCampground, catchAsync(async (request, response, next) => {
  //if (!request.body.campground) throw new ExpressError("Invalid campground data", 400);
  const campground = new Campground(request.body.campground);
  campground.author = request.user._id;
  await campground.save();
  request.flash("success", "Successfully made a new campground");
  response.redirect(`/campgrounds/${campground._id}`);
}));

router.get("/:id", catchAsync(async (request, response) => {
  const { id } = request.params;
  const campground = await Campground.findById(id).populate({
    path: "reviews",
    populate: {
      path: "author"
    }
  }).populate("author");
  if (!campground) {
    request.flash("error", "Cannot find that campground");
    return response.redirect("/campgrounds");
  }
  response.render("campgrounds/show", { campground });
}));

router.get("/:id/edit", isLoggedIn, isAuthor, catchAsync(async (request, response) => {
  const { id } = request.params;
  const campground = await Campground.findById(id);
  if (!campground) {
    request.flash("error", "Cannot find that campground");
    return response.redirect("/campgrounds");
  }
  response.render("campgrounds/edit", { campground });
}));


router.put("/:id", isLoggedIn, isAuthor, validateCampground, catchAsync(async (request, response) => {
  const { id } = request.params;
  const campground = await Campground.findByIdAndUpdate(id, {...request.body.campground}, {new: true})
  request.flash("success", "Successfully updated campground");
  response.redirect(`/campgrounds/${campground._id}`);
}));

router.delete("/:id", isLoggedIn, isAuthor, catchAsync(async (request, response) => {
  const { id } = request.params;
  await Campground.findByIdAndDelete(id);
  request.flash("success", "Campground was deleted");
  response.redirect("/campgrounds");
}));

module.exports = router;