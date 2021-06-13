const express = require("express");
const path = require("path");
const mongoose = require("mongoose");
const ejsMate = require("ejs-mate");
const methodOverride = require("method-override");
const app = express();
const Campground = require("./db_models/campground");

mongoose.connect("mongodb+srv://admin:bananaPancake@cluster0.8mxmo.mongodb.net/yelp-camp?retryWrites=true&w=majority", { 
  useNewUrlParser: true,
  useCreateIndex: true,
  useUnifiedTopology: true
});

const db = mongoose.connection;
db.on("error", console.error.bind(console, "Connection error"));
db.once("open", () => {
  console.log("Database connected")
})

app.engine("ejs", ejsMate);
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));
app.use(express.urlencoded({ extended: true}));
app.use(methodOverride("_method"));


app.get("/", (request, response) => {
  response.render("home")
})

app.get("/campgrounds", async (request, response) => {
  const campgrounds = await Campground.find({});
  response.render("campgrounds/index", { campgrounds })
})

app.get("/campgrounds/new", (request, response) => {
  response.render("campgrounds/new");
})

app.post("/campgrounds", async (request, response) => {
  const campground = new Campground(request.body.campground);
  await campground.save();
  response.redirect(`/campgrounds/${campground._id}`);
})

app.get("/campgrounds/:id", async (request, response) => {
  const { id } = request.params;
  const campground = await Campground.findById(id);
  response.render("campgrounds/show", { campground });
})

app.get("/campgrounds/:id/edit", async (request, response) => {
  const { id } = request.params;
  const campground = await Campground.findById(id);
  response.render("campgrounds/edit", { campground });
})

app.put("/campgrounds/:id", async (request, response) => {
  const { id } = request.params;
  const campground = await Campground.findByIdAndUpdate(id, {...request.body.campground}, {new: true})
  response.redirect(`/campgrounds/${campground._id}`);
})

app.delete("/campgrounds/:id", async (request, response) => {
  const { id } = request.params;
  await Campground.findByIdAndDelete(id);
  response.redirect("/campgrounds");
})


app.listen(3000, () => {
  console.log("Server is ready on port 3000");
})