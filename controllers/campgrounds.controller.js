const Campground = require("../db_models/campground");
const { cloudinary } = require("../cloudinary");
const MapBoxGeoCoding = require("@mapbox/mapbox-sdk/services/geocoding");
const mapBoxToken = process.env.MAPBOX_TOKEN;
const geoCoder = MapBoxGeoCoding({accessToken: mapBoxToken});


const showIndex = async (request, response) => {
  const campgrounds = await Campground.find({});
  response.render("campgrounds/index", { campgrounds })
}

const showNewCampForm = (request, response) => {
  response.render("campgrounds/new");
}

const createCampground = async (request, response, next) => {
  const geoCoderResponse = await geoCoder.forwardGeocode({
    query: request.body.campground.location,
    limit: 1
  }).send();
  const campground = new Campground(request.body.campground);
  campground.geometry = geoCoderResponse.body.features[0].geometry;
  campground.author = request.user._id;
  campground.images = request.files.map(file => ({ url: file.path, filename: file.filename }));
  await campground.save();
  request.flash("success", "Successfully made a new campground");
  response.redirect(`/campgrounds/${campground._id}`);
}

const showCampground = async (request, response) => {
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
}

const showEditCampForm = async (request, response) => {
  const { id } = request.params;
  const campground = await Campground.findById(id);
  if (!campground) {
    request.flash("error", "Cannot find that campground");
    return response.redirect("/campgrounds");
  }
  response.render("campgrounds/edit", { campground });
}

const editCampground = async (request, response) => {
  const { id } = request.params;
  console.log(request.body);
  const campground = await Campground.findByIdAndUpdate(id, {...request.body.campground}, {new: true})
  const images = request.files.map(file => ({ url: file.path, filename: file.filename }));
  campground.images.push(...images);
  await campground.save();
  if (request.body.deleteImages) {
    for (let filename of request.body.deleteImages) {
      await cloudinary.uploader.destroy(filename);
    }
    await campground.updateOne({ $pull: { images: { filename: { $in: request.body.deleteImages} } } });
  }
  request.flash("success", "Successfully updated the campground");
  response.redirect(`/campgrounds/${campground._id}`);
}

const deleteCampground = async (request, response) => {
  const { id } = request.params;
  await Campground.findByIdAndDelete(id);
  request.flash("success", "Campground was deleted");
  response.redirect("/campgrounds");
}

module.exports = { showIndex, showNewCampForm, createCampground, showCampground, showEditCampForm, editCampground, deleteCampground }