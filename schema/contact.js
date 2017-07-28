var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var ObjectId = Schema.ObjectId;

var ContactStatus = {
		APPROVED : 0,
		REJECTED : 1,
		PENDING : 2,
};

// create a schema
var contactSchema = new Schema({
	user_id : { type: ObjectId, required: true, ref:"User", index:true},
	contact_id : { type: ObjectId, required: true, ref:"User", index:true},
	blocked : { type: Boolean, required:true, default:false},
	deleted : { type: Boolean, required:true, default:false},
	status : { type: Number, required:true},
	create_date : { type: Number, required: true, default : new Date().getTime()},
	update_date : { type: Number, required: true, default : new Date().getTime()},
});

contactSchema.pre('save', function(next) {
	this.create_date = new Date().getTime();
	next();
});

// the schema is useless so far
// we need to create a model using it
var Contact = mongoose.model('Contact', contactSchema);

// make this available to our users in our Node applications
module.exports = {Contact,ContactStatus};
