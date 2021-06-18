const express = require("express");
const path = require("path");
const mongoose = require("mongoose");
const ejsMate = require("ejs-mate");
const { campgroundSchema, reviewSchema } = require("./joiSchemas.js")
const methodOverride = require("method-override");
const catchAsync = require("./utils/catchAsync");
const ExpressError = require("./utils/ExpressError");
const app = express();
const Campground = require("./db_models/campground");
const Review = require("./db_models/review");

mongoose.connect("mongodb+srv://admin:bananaPancake@cluster0.8mxmo.mongodb.net/yelp-camp?retryWrites=true&w=majority", { 
  useNewUrlParser: true,
  useCreateIndex: true,
  useUnifiedTopology: true,
  useFindAndModify: false
});

const db = mongoose.connection;
db.on("error", console.error.bind(console, "Connection error"));
db.once("open", () => {
  console.log("Database connected")
});

app.engine("ejs", ejsMate);
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));
app.use(express.urlencoded({ extended: true}));
app.use(methodOverride("_method"));


const validateCampground = (request, response, next) => {
  const { error } = campgroundSchema.validate(request.body);
  if (error) {
    const msg = error.details.map(el => el.message).join(",");
    throw new ExpressError(msg, 400);
  } else {
    next();
  }
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


app.get("/", (request, response) => {
  response.render("home")
});

app.get("/campgrounds", catchAsync(async (request, response) => {
  const campgrounds = await Campground.find({});
  response.render("campgrounds/index", { campgrounds })
}));

app.get("/campgrounds/new", (request, response) => {
  response.render("campgrounds/new");
});

app.post("/campgrounds", validateCampground, catchAsync(async (request, response, next) => {
  //if (!request.body.campground) throw new ExpressError("Invalid campground data", 400);
  
  const campground = new Campground(request.body.campground);
  await campground.save();
  response.redirect(`/campgrounds/${campground._id}`);
}));

app.get("/campgrounds/:id", catchAsync(async (request, response) => {
  const { id } = request.params;
  const campground = await Campground.findById(id).populate("reviews");
  response.render("campgrounds/show", { campground });
}));

app.get("/campgrounds/:id/edit", catchAsync(async (request, response) => {
  const { id } = request.params;
  const campground = await Campground.findById(id);
  response.render("campgrounds/edit", { campground });
}));

app.put("/campgrounds/:id", validateCampground, catchAsync(async (request, response) => {
  const { id } = request.params;
  const campground = await Campground.findByIdAndUpdate(id, {...request.body.campground}, {new: true})
  response.redirect(`/campgrounds/${campground._id}`);
}));

app.delete("/campgrounds/:id", catchAsync(async (request, response) => {
  const { id } = request.params;
  await Campground.findByIdAndDelete(id);
  response.redirect("/campgrounds");
}));

app.post("/campgrounds/:id/reviews", validateReview, (catchAsync(async(request, response) => {
  const { id } = request.params;
  const campground = await Campground.findById(id);
  const review = new Review(request.body.review);
  campground.reviews.push(review);
  await review.save();
  await campground.save();
  response.redirect(`/campgrounds/${campground._id}`);
})));

app.delete("/campgrounds/:id/reviews/:reviewId", catchAsync(async (request, response) => {
  const { id, reviewId } = request.params;
  await Campground.findByIdAndUpdate(id, {$pull: { reviews: reviewId }});
  await Review.findByIdAndDelete(reviewId);
  response.redirect(`/campgrounds/${id}`);
}));

app.all("*", (request, response, next) => {
  next(new ExpressError("Page not found", 404));
});

app.use((err, request, response, next) => {
  const { statusCode = 500 } = err;
  if(!err.message) err.message = "Oh no, something went wrong"; 
  response.status(statusCode).render("error", { err });
});


app.listen(3000, () => {
  console.log("Server is ready on port 3000");
});