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
