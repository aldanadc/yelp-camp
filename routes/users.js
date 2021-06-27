const express = require("express");
const router = express.Router();
const passport = require("passport");
const User = require("../db_models/user");
const catchAsync = require("../utils/catchAsync");

router.get("/register", (request, response) => {
  response.render("users/register")
});

router.post("/register", catchAsync(async (request, response, next) => {
  try {
    const {email, username, password} = request.body;
    const newUser = new User({email, username});
    const registeredUser = await User.register(newUser, password);
    request.login(registeredUser, error => {
      if (error) return next(error);
      request.flash("success", "Welcome to YelpCamp!");
      response.redirect("/campgrounds");
    });
    
  } catch (error) {
    request.flash("error", error.message);
    response.redirect("/register");
  }
}));

router.get("/login", (request, response) => {
  response.render("users/login");
});

router.post("/login", passport.authenticate("local", { failureFlash: true, failureRedirect: "/login" }), (request, response) => {
  request.flash("success", "Welcome back!");
  const redirectUrl = request.session.returnTo || "/campgrounds";
  delete request.session.returnTo;
  response.redirect(redirectUrl);
});

router.get("/logout", (request, response) => {
  request.logout();
  request.flash("success", "Logged out!");
  response.redirect("/campgrounds");
});

module.exports = router;