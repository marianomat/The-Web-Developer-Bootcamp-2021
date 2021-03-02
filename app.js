const express = require("express"),
	app = express(),
	path = require("path"),
	mongoose = require("mongoose"),
	Campground = require("./models/campground"),
	methodOverride = require("method-override"),
	ejsMate = require("ejs-mate"),
	catchAsync = require("./utils/catchAsync"),
	ExpressError = require("./utils/ExpressError"),
	{ campgroundSchema } = require("./joiSchemas");

mongoose.connect("mongodb://localhost: 27017/yelp-camp", {
	useNewUrlParser: true,
	useCreateIndex: true,
	useUnifiedTopology: true,
});
const db = mongoose.connection;
db.on("error", console.error.bind(console, "conection error: "));
db.once("open", () => {
	console.log("Database Connected");
});

app.engine("ejs", ejsMate);
app.set("view engine", "ejs");

app.set("views", path.join(__dirname, "views"));

app.use(express.urlencoded({ extended: true }));
app.use(methodOverride("_method"));

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

//* ROUTES!!

app.get("/", (req, res) => {
	res.render("home");
});

app.get(
	"/campgrounds",
	catchAsync(async (req, res) => {
		const campgrounds = await Campground.find({});
		console.log(campgrounds);
		res.render("campgrounds/index", { campgrounds });
	})
);

app.get("/campgrounds/new", (req, res) => {
	res.render("campgrounds/new");
});

app.post(
	"/campgrounds",
	validateCampground,
	catchAsync(async (req, res, next) => {
		//*Add new Campground after passing client and server side validations
		const campground = new Campground(req.body.campground);
		await campground.save();
		res.redirect("/campgrounds/" + campground._id);
	})
);
app.get(
	"/campgrounds/:id",
	catchAsync(async (req, res) => {
		const { id } = req.params;
		const campground = await Campground.findById(id);
		res.render("campgrounds/show", { campground });
	})
);

app.get(
	"/campgrounds/:id/edit",
	catchAsync(async (req, res) => {
		const { id } = req.params;
		const campground = await Campground.findById(id);
		res.render("campgrounds/edit", { campground });
	})
);

app.put(
	"/campgrounds/:id",
	validateCampground,
	catchAsync(async (req, res) => {
		const { id } = req.params;
		const campground = await Campground.findByIdAndUpdate(id, {
			...req.body.campground,
		});
		res.redirect("/campgrounds/" + campground._id);
	})
);

app.delete(
	"/campgrounds/:id",
	catchAsync(async (req, res) => {
		const { id } = req.params;
		const deletedCampground = await Campground.findByIdAndDelete(id);
		res.redirect("/campgrounds");
	})
);

app.all("*", (req, res, next) => {
	next(new ExpressError("Page not found", 404));
});

app.use((err, req, res, next) => {
	const { statusCode = 500 } = err;
	if (!err.message) err.message = "Oh no! Something went wrong";
	res.status(statusCode).render("error", { err });
});

app.listen(3000, () => {
	console.log("Server On, Port 3000");
});
