const express = require("express"),
	app = express(),
	path = require("path"),
	mongoose = require("mongoose"),
	methodOverride = require("method-override"),
	ejsMate = require("ejs-mate"),
	ExpressError = require("./utils/ExpressError"),
	campgrounds = require("./routes/campgrounds"),
	reviews = require("./routes/reviews"),
	session = require("express-session"),
	flash = require("connect-flash");

mongoose.connect("mongodb://localhost: 27017/yelp-camp", {
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

//*config express-session
const sessionConfig = {
	secret: "secretopadree",
	resave: false,
	saveUninitialized: true,
	cookie: {
		httpOnly: true,
		expires: Date.now() + 1000 * 60 * 60 * 24 * 7, //!date.now is on ms, so 1000ms * 60seg * 60min * 24 hs * 7days
		maxAge: 1000 * 60 * 60 * 24 * 7,
	},
};
app.use(session(sessionConfig));

//*Configure flash messages
app.use(flash());
//? flash middleware
app.use((req, res, next) => {
	res.locals.success = req.flash("success");
	res.locals.error = req.flash("error");
	next();
});
//*Router
app.use("/campgrounds", campgrounds);
app.use("/campgrounds/:id/reviews", reviews);

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
