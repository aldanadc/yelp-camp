const express = require("express");
const router = express.Router();
const catchAsync = require("../utils/catchAsync");
const { isLoggedIn, validateCampground, isAuthor } = require("../middleware/middleware");
const { showIndex, showNewCampForm, createCampground, showCampground, showEditCampForm, editCampground, deleteCampground } = require("../controllers/campgrounds.controller");
const multer = require("multer");
const { storage } = require("../cloudinary");
const upload = multer({ storage });


router.route("/")
  .get(catchAsync(showIndex))
  .post(isLoggedIn, upload.array("image"), validateCampground, catchAsync(createCampground));

router.get("/new", isLoggedIn, showNewCampForm);

router.route("/:id")
  .get(showCampground)
  .put(isLoggedIn, isAuthor, upload.array("image"), validateCampground, catchAsync(editCampground))
  .delete(isLoggedIn, isAuthor, catchAsync(deleteCampground));

router.get("/:id/edit", isLoggedIn, isAuthor, showEditCampForm);


module.exports = router;