var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var ObjectId = Schema.ObjectId;

// create a schema
var userSchema = new Schema({
	name : String,
	username : {
		type : String,
		required : true,
		unique : true
	},
	password : {
		type : String,
		required : true
	},
	admin : Boolean,
	location : String,
	meta : {
		age : Number,
		email : String,
		website : String,
		contact : String
	},
	deleted : { type:Boolean, required:true, default:false},
	create_date : { type: Number, required: true, default : new Date().getTime()},
	update_date : { type: Number, required: true, default : new Date().getTime()},
});

userSchema.pre('save', function(next) {
	this.create_date = new Date().getTime();
	this.update_date = new Date().getTime();
	next();
});

// the schema is useless so far
// we need to create a model using it
var User = mongoose.model('User', userSchema);

// make this available to our users in our Node applications
module.exports = User;
