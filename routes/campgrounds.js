const express = require("express");
const router = express.Router();
const catchAsync = require("../utils/catchAsync");
const ExpressError = require("../utils/ExpressError");
const Campground = require("../models/campground");
const { campgroundSchema } = require("../joiSchemas");

//*Server-side validation with JOI
const validateCampground = (req, res, next) => {
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

router.get(
	"/",
	catchAsync(async (req, res) => {
		const campgrounds = await Campground.find({});
		res.render("campgrounds/index", { campgrounds });
	})
);

router.get("/new", (req, res) => {
	res.render("campgrounds/new");
});

router.post(
	"/",
	validateCampground,
	catchAsync(async (req, res, next) => {
		//*Add new Campground after passing client and server side validations
		const campground = new Campground(req.body.campground);
		await campground.save();
		//*Set up flash msg
		req.flash("success", "Successfully made a new campground!");
		res.redirect("/campgrounds/" + campground._id);
	})
);
router.get(
	"/:id",
	catchAsync(async (req, res) => {
		const { id } = req.params;
		const campground = await Campground.findById(id).populate("reviews");
		if (!campground) {
			req.flash("error", "Cannot find that campground");
			return res.redirect("/campgrounds");
		}
		res.render("campgrounds/show", { campground });
	})
);

router.get(
	"/:id/edit",
	catchAsync(async (req, res) => {
		const { id } = req.params;
		const campground = await Campground.findById(id);
		if (!campground) {
			req.flash("error", "Cannot find that campground");
			return res.redirect("/campgrounds");
		}
		res.render("campgrounds/edit", { campground });
	})
);

router.put(
	"/:id",
	validateCampground,
	catchAsync(async (req, res) => {
		const { id } = req.params;
		const campground = await Campground.findByIdAndUpdate(id, {
			...req.body.campground,
		});
		req.flash("success", "Successfully updated campground!");
		res.redirect("/campgrounds/" + campground._id);
	})
);

router.delete(
	"/:id",
	catchAsync(async (req, res) => {
		const { id } = req.params;
		const deletedCampground = await Campground.findByIdAndDelete(id);
		req.flash("success", "Successfully deleted campground!");
		res.redirect("/campgrounds");
	})
);

module.exports = router;
