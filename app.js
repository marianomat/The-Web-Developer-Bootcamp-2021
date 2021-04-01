//*If we are in development, it requires dotenv package, then it takes the variables from .env and make them accesible in the app
if (process.env.NODE_ENV !== "production") {
	require("dotenv").config();
}
const express = require("express"),
	app = express(),
	path = require("path"),
	mongoose = require("mongoose"),
	methodOverride = require("method-override"),
	ejsMate = require("ejs-mate"),
	ExpressError = require("./utils/ExpressError"),
	session = require("express-session"),
	flash = require("connect-flash"),
	passport = require("passport"),
	LocalStrategy = require("passport-local"),
	campgroundsRoutes = require("./routes/campgrounds"),
	reviewsRoutes = require("./routes/reviews"),
	userRoutes = require("./routes/users"),
	User = require("./models/user"),
	helmet = require("helmet"),
	MongoStore = require("connect-mongo"),
	dbUrl = process.env.DB_URL || "mongodb://localhost: 27017/yelp-camp",
	mongoSanitize = require("express-mongo-sanitize");

//*mongo url dbUrl = process.env.DB_URL, */
//*Local url "mongodb://localhost: 27017/yelp-camp"

mongoose.connect(dbUrl, {
	useNewUrlParser: true,
	useCreateIndex: true,
	useUnifiedTopology: true,
	useFindAndModify: false,
});
const db = mongoose.connection;
db.on("error", console.error.bind(console, "conection error: "));
db.once("open", () => {
	console.log("Database Connected");
});

//*configure EJS
app.engine("ejs", ejsMate);
app.set("view engine", "ejs");

//*Serve dinamic files
app.set("views", path.join(__dirname, "views"));

//*Parse body object from req
app.use(express.urlencoded({ extended: true }));

//*Add more methods
app.use(methodOverride("_method"));

//*Serve statics files
app.use(express.static(path.join(__dirname, "public")));

//*Sanitize inputs
app.use(mongoSanitize());

const secret = process.env.SECRET || "secretopadree";

//*Config so session uses mongo and not memory
const store = MongoStore.create({
	mongoUrl: dbUrl,
	touchAfter: 24 * 60 * 60,
	crypto: {
		secret,
	},
});
store.on("error", function (e) {
	console.log("SESSION STORE ERROR", e);
});

//*config express-session
const sessionConfig = {
	store,
	name: "gatardo",
	secret,
	resave: false,
	saveUninitialized: true,
	cookie: {
		httpOnly: true,
		//secure: true, //* ONLY WORKS IF IT A HTTPS not HTTP, but localhost is not secure so just comment
		expires: Date.now() + 1000 * 60 * 60 * 24 * 7, //!date.now is on ms, so 1000ms * 60seg * 60min * 24 hs * 7days
		maxAge: 1000 * 60 * 60 * 24 * 7,
	},
};
app.use(session(sessionConfig));

//*Config passport (after use.session)
app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

//*Configure flash messages
app.use(flash());
//? flash middleware

//*Using helment
app.use(helmet());

const scriptSrcUrls = [
	"https://stackpath.bootstrapcdn.com/",
	"https://api.tiles.mapbox.com/",
	"https://api.mapbox.com/",
	"https://kit.fontawesome.com/",
	"https://cdnjs.cloudflare.com/",
	"https://cdn.jsdelivr.net",
];
const styleSrcUrls = [
	"https://kit-free.fontawesome.com/",
	"https://stackpath.bootstrapcdn.com/",
	"https://api.mapbox.com/",
	"https://api.tiles.mapbox.com/",
	"https://fonts.googleapis.com/",
	"https://use.fontawesome.com/",
	"https://cdn.jsdelivr.net",
];
const connectSrcUrls = [
	"https://api.mapbox.com/",
	"https://a.tiles.mapbox.com/",
	"https://b.tiles.mapbox.com/",
	"https://events.mapbox.com/",
];
const fontSrcUrls = [];
app.use(
	helmet.contentSecurityPolicy({
		directives: {
			defaultSrc: [],
			connectSrc: ["'self'", ...connectSrcUrls],
			scriptSrc: ["'unsafe-inline'", "'self'", ...scriptSrcUrls],
			styleSrc: ["'self'", "'unsafe-inline'", ...styleSrcUrls],
			workerSrc: ["'self'", "blob:"],
			objectSrc: [],
			imgSrc: [
				"'self'",
				"blob:",
				"data:",
				"https://res.cloudinary.com/dynrt1cf7/", //SHOULD MATCH YOUR CLOUDINARY ACCOUNT!
				"https://images.unsplash.com/",
			],
			fontSrc: ["'self'", ...fontSrcUrls],
		},
	})
);

//*In locals I have acces to data in every EJS, but not needing to actually pass it in the render
app.use((req, res, next) => {
	res.locals.currentUser = req.user;
	res.locals.success = req.flash("success");
	res.locals.error = req.flash("error");
	next();
});
//*Router
app.use("/campgrounds", campgroundsRoutes);
app.use("/campgrounds/:id/reviews", reviewsRoutes);
app.use("/", userRoutes);

//* ROUTES!!

app.get("/", (req, res) => {
	res.render("home");
});

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
