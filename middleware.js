const ExpressError = require("./utils/ExpressError");
const { campgroundSchema, reviewSchema } = require("./joiSchemas");
const Campground = require("./models/campground");
const Review = require("./models/review");

module.exports.isLoggedIn = (req, res, next) => {
	if (!req.isAuthenticated()) {
		//*Store the url that user is requesting
		//*req.path is only the router
		//*req.originalpath takes the router and app route (more comple)
		req.session.returnTo = req.originalUrl;
		req.flash("error", "You must be signed in!");
		return res.redirect("/login");
	}
	next();
};

module.exports.isAuthor = async (req, res, next) => {
	const { id } = req.params;
	const campground = await Campground.findById(id);
	if (!campground.author.equals(req.user._id)) {
		req.flash("error", "You do not own the campground");
		return res.redirect(`/campgrounds/${id}`);
	} else {
		next();
	}
};

module.exports.isReviewAuthor = async (req, res, next) => {
	const { id, reviewId } = req.params;
	const review = await Review.findById(reviewId);
	if (!review.author.equals(req.user._id)) {
		req.flash("error", "You do not own the comment");
		return res.redirect(`/campgrounds/${id}`);
	} else {
		next();
	}
};

//*Server-side validation with JOI
module.exports.validateCampground = (req, res, next) => {
	const { error } = campgroundSchema.validate(req.body);
	if (error) {
		const message = error.details
			.map((element) => element.message)
			.join(",");
		throw new ExpressError(message, 400);
	} else {
		next();
	}
};

//*Server-side validation with JOI
module.exports.validateReview = (req, res, next) => {
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
