const dbUrl = process.env.DB_URL;
const mongoose = require("mongoose");
const Campground = require("../db_models/campground");
const cities = require("./cities");
const { places, descriptors } = require("./seedHelpers");

mongoose.connect(dbUrl, {
  useNewUrlParser: true,
  useCreateIndex: true,
  useUnifiedTopology: true
});

const db = mongoose.connection;
db.on("error", console.error.bind(console, "connection error"));
db.once("open", () => {
  console.log("Database connected")
})

const sample = array => array[Math.floor(Math.random() * array.length)];

const imageSeeds = [
  {
    url: "https://res.cloudinary.com/dtuxjuyjb/image/upload/v1625195154/YelpCamp/ggd0aabla4g0k31w0nrt.jpg",
    filename: "YelpCamp/ggd0aabla4g0k31w0nrt"
  },
  {
    url: "https://res.cloudinary.com/dtuxjuyjb/image/upload/v1625195159/YelpCamp/a4pllumsro0qdn8yurck.jpg",
    filename: "YelpCamp/a4pllumsro0qdn8yurck"
  },
  {
    url: "https://res.cloudinary.com/dtuxjuyjb/image/upload/v1626219200/YelpCamp/manuel-meurisse-EuCll-F5atI-unsplash_qumy84.jpg",
    filename: "YelpCamp/manuel-meurisse-EuCll-F5atI-unsplash_qumy84"
  },
  {
    url: "https://res.cloudinary.com/dtuxjuyjb/image/upload/v1626219196/YelpCamp/jack-sloop-qelGaL2OLyE-unsplash_cqkjwe.jpg",
    filename: "YelpCamp/jack-sloop-qelGaL2OLyE-unsplash_cqkjwe"
  },
  {
    url: "https://res.cloudinary.com/dtuxjuyjb/image/upload/v1626219194/YelpCamp/clarisse-meyer-359AOEwnYcw-unsplash_fmc0jb.jpg",
    filename: "YelpCamp/clarisse-meyer-359AOEwnYcw-unsplash_fmc0jb"
  },
  {
    url: "https://res.cloudinary.com/dtuxjuyjb/image/upload/v1626219187/YelpCamp/chris-schog-EnCaUE4QNOw-unsplash_vgbwhr.jpg",
    filename: "YelpCamp/chris-schog-EnCaUE4QNOw-unsplash_vgbwhr"
  },
  {
    url: "https://res.cloudinary.com/dtuxjuyjb/image/upload/v1626220030/YelpCamp/cristina-gottardi-Tmb-nM6RJ44-unsplash_rjftgw.jpg",
    filename: "YelpCamp/cristina-gottardi-Tmb-nM6RJ44-unsplash_rjftgw"
  },
  {
    url: "https://res.cloudinary.com/dtuxjuyjb/image/upload/v1626220029/YelpCamp/sayan-nath-j6MenunuSKg-unsplash_yiq6gp.jpg",
    filename: "YelpCamp/sayan-nath-j6MenunuSKg-unsplash_yiq6gp"
  },
  {
    url: "https://res.cloudinary.com/dtuxjuyjb/image/upload/v1626220024/YelpCamp/clarisse-meyer-dNysjOcQfqI-unsplash_ywyqs9.jpg",
    filename: "YelpCamp/clarisse-meyer-dNysjOcQfqI-unsplash_ywyqs9"
  }
]


const seedDB = async () => {
  await Campground.deleteMany({});
  for (let i = 0; i < 200; i++) {
    const random1000 = Math.floor(Math.random() * 1000);
    const randomImg = Math.floor(Math.random() * 6);
    const randomImgSecond = Math.floor(Math.random() * 6);
    const price = Math.floor(Math.random() * 20) + 10;
    const camp = new Campground({
      author: "60d7c54ff21c483e109c1f4c",
      title: `${sample(descriptors)} ${sample(places)}`,
      location: `${cities[random1000].city}, ${cities[random1000].state}`,
      description: "Lorem ipsum dolor sit amet consectetur adipisicing elit. Eveniet, ea consequatur. Aliquam quasi dolorem nisi expedita, dolor ea eos rem autem voluptate consequatur incidunt placeat molestiae sapiente repellat provident consequuntur.",
      price,
      geometry: {
        type: "Point",
        coordinates: [
          cities[random1000].longitude,
          cities[random1000].latitude
        ]
      },
      images: [
        imageSeeds[randomImg],
        imageSeeds[randomImgSecond],
      ]
      // images: [
      //   {
      //     url: "https://res.cloudinary.com/dtuxjuyjb/image/upload/v1625195154/YelpCamp/ggd0aabla4g0k31w0nrt.jpg",
      //     filename: "YelpCamp/ggd0aabla4g0k31w0nrt"
      //   },
      //   {
      //     url: "https://res.cloudinary.com/dtuxjuyjb/image/upload/v1625195159/YelpCamp/a4pllumsro0qdn8yurck.jpg",
      //     filename: "YelpCamp/a4pllumsro0qdn8yurck"
      //   }
      // ]
    })
    await camp.save();
  }
}

seedDB().then(() => {
  mongoose.connection.close();
})