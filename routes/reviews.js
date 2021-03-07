const express = require("express");
const router = express.Router({ mergeParams: true });
const catchAsync = require("../utils/catchAsync");
const Campground = require("../models/campground");
const Review = require("../models/review");
const ExpressError = require("../utils/ExpressError");
const { reviewSchema } = require("../joiSchemas");

//*Server-side validation with JOI
const validateReview = (req, res, next) => {
	const { error } = reviewSchema.validate(req.body);
	if (error) {
		console.log(error);
		const message = error.details
			.map((element) => element.message)
			.join(",");
		throw new ExpressError(message, 400);
	} else {
		next();
	}
};

router.post(
	"/",
	validateReview,
	catchAsync(async (req, res) => {
		const campground = await Campground.findById(req.params.id);
		const review = new Review(req.body.review);
		campground.reviews.push(review);
		await review.save();
		await campground.save();
		req.flash("success", "Created new review!");
		res.redirect(`/campgrounds/${campground._id}`);
	})
);

router.delete(
	"/:reviewId",
	catchAsync(async (req, res) => {
		const { id, reviewId } = req.params;
		//Delete review in campground array
		await Campground.findByIdAndUpdate(id, {
			$pull: { reviews: reviewId },
		});
		//Delete review
		await Review.findByIdAndDelete(reviewId);
		req.flash("success", "Deleted review");
		res.redirect(`/campgrounds/${id}`);
	})
);

module.exports = router;
