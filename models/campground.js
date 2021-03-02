const mongoose = require("mongoose"),
	Schema = mongoose.Schema;

const CampgroundSchema = new Schema({
	title: String,
	price: Number,
	description: String,
	location: String,
	image: String,
});

module.exports = mongoose.model("Campground", CampgroundSchema);
