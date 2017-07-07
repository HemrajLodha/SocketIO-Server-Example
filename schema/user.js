var mongoose = require('mongoose');
var Schema = mongoose.Schema;

//create a schema
var userSchema = new Schema({
  name: String,
  username: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  admin: Boolean,
  location: String,
  meta: {
    age: Number,
    email: String,
    website: String,
    contact: String
  },
  created_at: Date,
  updated_at: Date
});

userSchema.pre('save',function(next){
	this.created_at = new Date();
	this.updated_at = new Date();
	next();
});

//the schema is useless so far
//we need to create a model using it
var User = mongoose.model('User', userSchema);

//make this available to our users in our Node applications
module.exports = User;
