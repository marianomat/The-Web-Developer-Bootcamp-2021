const mongoose = require("mongoose");
const cities = require("./cities");
const { places, descriptors } = require("./seedHelpers");
const Campground = require("../models/campground");

mongoose.connect("mongodb://localhost:27017/yelp-camp", {
	useNewUrlParser: true,
	useCreateIndex: true,
	useUnifiedTopology: true,
});

const db = mongoose.connection;

db.on("error", console.error.bind(console, "connection error:"));
db.once("open", () => {
	console.log("Database connected");
});

const sample = (array) => array[Math.floor(Math.random() * array.length)];

const seedDB = async () => {
	await Campground.deleteMany({});
	for (let i = 0; i < 50; i++) {
		const random1000 = Math.floor(Math.random() * 1000);
		const price = Math.floor(Math.random() * 20 + 10);
		const camp = new Campground({
			location: `${cities[random1000].city}, ${cities[random1000].state}`,
			title: `${sample(descriptors)} ${sample(places)}`,
			images: [
				{
					url:
						"https://res.cloudinary.com/dynrt1cf7/image/upload/v1616258207/YelpCamp/xbr5kuzwju3sep6enhag.jpg",
					filename: "YelpCamp/xbr5kuzwju3sep6enhag",
				},
				{
					url:
						"https://res.cloudinary.com/dynrt1cf7/image/upload/v1616258208/YelpCamp/znbdbevchcpducwsevck.jpg",
					filename: "YelpCamp/znbdbevchcpducwsevck",
				},
			],
			author: "60527e0d5a03951ac4fc85c9",
			description:
				"Lorem ipsum dolor sit amet consectetur adipisicing elit. Eligendi, explicabo quasi illum vitae dicta accusamus perferendis sed. Exercitationem eveniet ad odio aut consectetur quisquam optio distinctio? Eum iusto delectus officiis!",
			price: price,
		});
		await camp.save();
	}
};

seedDB().then(() => {
	mongoose.connection.close();
});
