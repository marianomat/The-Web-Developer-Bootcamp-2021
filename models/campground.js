const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const Review = require("./review");

const imageSchema = new Schema({ url: String, filename: String });

imageSchema.virtual("thumbnail").get(function () {
	console.log(this);
	return this.url.replace("/upload", "/upload/w_200");
});

const options = { toJSON: { virtuals: true } };

const CampgroundSchema = new Schema(
	{
		title: String,
		price: Number,
		description: String,
		location: String,
		geometry: {
			type: {
				type: String,
				enum: ["Point"],
				required: true,
			},
			coordinates: {
				type: [Number],
				required: true,
			},
		},
		images: [imageSchema],
		author: {
			type: Schema.Types.ObjectId,
			ref: "User",
		},
		reviews: [
			{
				type: Schema.Types.ObjectId,
				ref: "Review",
			},
		],
	},
	options //*tHIS IS TO PASS VIRTUALS IN
);

//*For the popup mapbox
CampgroundSchema.virtual("properties.popUpMarkup").get(function () {
	return `<strong><a href="/campgrounds/${
		this._id
	}">${this.title}</a></strong>
	<p>${this.description.substring(0, 20)}...</p>`;
});

CampgroundSchema.post("findOneAndDelete", async function (doc) {
	if (doc) {
		await Review.deleteMany({
			_id: {
				$in: doc.reviews,
			},
		});
	}
});

module.exports = mongoose.model("Campground", CampgroundSchema);
