const User = require("../db_models/user");

const showRegisterForm = (request, response) => {
  response.render("users/register")
}

const registerUser = async (request, response, next) => {
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
}

const showLoginForm = (request, response) => {
  response.render("users/login");
}

const loginSuccess = (request, response) => {
  request.flash("success", "Welcome back!");
  const redirectUrl = request.session.returnTo || "/campgrounds";
  delete request.session.returnTo;
  response.redirect(redirectUrl);
}

const logout = (request, response) => {
  request.logout();
  request.flash("success", "Logged out, see you soon!");
  response.redirect("/campgrounds");
}

module.exports = { showRegisterForm, registerUser, showLoginForm, loginSuccess, logout }