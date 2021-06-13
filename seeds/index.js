const mongoose = require("mongoose");
const Campground = require("../db_models/campground");
const cities = require("./cities");
const { places, descriptors } = require("./seedHelpers");

mongoose.connect("mongodb+srv://admin:bananaPancake@cluster0.8mxmo.mongodb.net/yelp-camp?retryWrites=true&w=majority", { 
  useNewUrlParser: true,
  useCreateIndex: true,
  useUnifiedTopology: true
});

const db = mongoose.connection;
db.on("error", console.error.bind(console, "connection error"));
db.once("open", () => {
  console.log("Database connected")
})

const sample = array => array[Math.floor(Math.random()* array.length)];


const seedDB = async () => {
  await Campground.deleteMany({});
  for (let i=0; i<50; i++) {
    const random1000 = Math.floor(Math.random() * 1000);
    const price = Math.floor(Math.random() * 20) + 10;
    const camp = new Campground({
      title: `${sample(descriptors)} ${sample(places)}`,
      location: `${cities[random1000].city}, ${cities[random1000].state} `,
      image: "https://source.unsplash.com/collection/483251",
      description: "Lorem ipsum dolor sit amet consectetur adipisicing elit. Eveniet, ea consequatur. Aliquam quasi dolorem nisi expedita, dolor ea eos rem autem voluptate consequatur incidunt placeat molestiae sapiente repellat provident consequuntur.",
      price
    })
    await camp.save();
  }
}

seedDB().then(() => {
  mongoose.connection.close();
})