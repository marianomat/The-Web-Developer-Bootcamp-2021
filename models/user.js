const mongoose = require("mongoose");
const passportLocalMongoose = require("passport-local-mongoose");
const Schema = mongoose.Schema;

const UserSchema = new Schema({
	email: {
		type: String,
		required: true,
		unique: true,
	},
});
//*Add fields for username and password, add methods, check that they are unique
UserSchema.plugin(passportLocalMongoose);

module.exports = mongoose.model("User", UserSchema);
