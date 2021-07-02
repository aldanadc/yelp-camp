const express = require("express");
const router = express.Router();
const passport = require("passport");
const catchAsync = require("../utils/catchAsync");
const { showRegisterForm, registerUser, showLoginForm, loginSuccess, logout } = require("../controllers/users.controller");

router.route("/register")
  .get(showRegisterForm)
  .post(catchAsync(registerUser));

router.route("/login")
  .get(showLoginForm)
  .post(passport.authenticate("local", { failureFlash: true, failureRedirect: "/login" }), loginSuccess);

router.get("/logout", logout);


module.exports = router;