const Campground = require("../models/campground");
const { cloudinary } = require("../cloudinary");

module.exports.index = async (req, res) => {
	const campgrounds = await Campground.find({});
	res.render("campgrounds/index", { campgrounds });
};

module.exports.renderNewForm = (req, res) => {
	res.render("campgrounds/new");
};

module.exports.createCampground = async (req, res, next) => {
	//*Add new Campground after passing client and server side validations
	const campground = new Campground(req.body.campground);
	//*Add iomages url and info from the cloudnary
	campground.images = req.files.map((file) => {
		return {
			url: file.path,
			filename: file.filename,
		};
	});
	//*Add author
	campground.author = req.user._id;
	console.log(campground);
	await campground.save();
	//*Set up flash msg
	req.flash("success", "Successfully made a new campground!");
	res.redirect("/campgrounds/" + campground._id);
};

module.exports.showCampground = async (req, res) => {
	const { id } = req.params;
	const campground = await Campground.findById(id)
		.populate({
			path: "reviews",
			populate: {
				path: "author",
			},
		})
		.populate("author");
	if (!campground) {
		req.flash("error", "Cannot find that campground");
		return res.redirect("/campgrounds");
	}
	res.render("campgrounds/show", { campground });
};

module.exports.renderEditForm = async (req, res) => {
	const { id } = req.params;
	const campground = await Campground.findById(id);
	if (!campground) {
		req.flash("error", "Cannot find that campground");
		return res.redirect("/campgrounds");
	}
	res.render("campgrounds/edit", { campground });
};

module.exports.updateCampground = async (req, res) => {
	const { id } = req.params;
	const campground = await Campground.findByIdAndUpdate(id, {
		...req.body.campground,
	});
	const imgs = req.files.map((file) => {
		return {
			url: file.path,
			filename: file.filename,
		};
	});
	campground.images.push(...imgs);
	if (req.body.deleteImages) {
		for (let filename of req.body.deleteImages) {
			await cloudinary.uploader.destroy(filename);
		}
		await campground.updateOne({
			$pull: { images: { filename: { $in: req.body.deleteImages } } },
		});
	}
	await campground.save();
	req.flash("success", "Successfully updated campground!");
	res.redirect("/campgrounds/" + campground._id);
};

module.exports.deleteCampground = async (req, res) => {
	const { id } = req.params;
	const deletedCampground = await Campground.findByIdAndDelete(id);
	req.flash("success", "Successfully deleted campground!");
	res.redirect("/campgrounds");
};
