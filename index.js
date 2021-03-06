if (process.env.NODE_ENV !== "production") {
  require("dotenv").config();
}

const express = require("express");
const path = require("path");
const mongoose = require("mongoose");
const dbUrl = process.env.DB_URL;
const ejsMate = require("ejs-mate");
const methodOverride = require("method-override");
const session = require("express-session");
const flash = require("connect-flash");
const ExpressError = require("./utils/ExpressError");
const campgroundsRoutes = require("./routes/campgrounds");
const reviewsRoutes = require("./routes/reviews");
const UsersRoutes = require("./routes/users");
const passport = require("passport");
const LocalStrategy = require("passport-local");
const User = require("./db_models/user");
const mongoSanitize = require('express-mongo-sanitize');
const helmet = require("helmet");
const { contentSecurityConfig } = require("./content-security");
const MongoStore = require('connect-mongo');
const app = express();
const secret = process.env.SESSION_SECRET || "blueberriesareyummy";
const port = process.env.PORT || 3000;


mongoose.connect(dbUrl, { 
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

const store = new MongoStore({
  mongoUrl: dbUrl,
  secret,
  touchAfter: 24 * 60 * 60
});

store.on("error", function(error) {
  console.log("Session store error", error)
});

const sessionConfig = {
  store,
  name: "session",
  secret,
  resave: false,
  saveUninitialized: true,
  cookie: {
    httpOnly: true,
    //secure: true,
    expires: Date.now() + 1000 * 60 * 60 * 24 * 7,
    maxAge: 1000 * 60 * 60 * 24 * 7
  }
}

app.engine("ejs", ejsMate);
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));
app.use(express.urlencoded({ extended: true}));
app.use(methodOverride("_method"));
app.use(express.static(path.join(__dirname, "public")));
app.use(session(sessionConfig));
app.use(flash());
app.use(mongoSanitize());
app.use(helmet());
app.use(helmet.contentSecurityPolicy(contentSecurityConfig));

app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

app.use((request, response, next) => {
  response.locals.success = request.flash("success");
  response.locals.error = request.flash("error");
  response.locals.currentUser = request.user;
  next();
});

app.use("/", UsersRoutes);
app.use("/campgrounds", campgroundsRoutes);
app.use("/campgrounds/:id/reviews", reviewsRoutes);

app.get("/", (request, response) => {
  response.render("home")
});

app.all("*", (request, response, next) => {
  next(new ExpressError("Page not found", 404));
});

app.use((err, request, response, next) => {
  const { statusCode = 500 } = err;
  if(!err.message) err.message = "Oh no, something went wrong"; 
  response.status(statusCode).render("error", { err });
});

app.listen(port, () => {
  console.log(`Server is ready on port ${port}`);
});