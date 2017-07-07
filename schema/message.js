// grab the things we need
var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var ObjectId = Schema.ObjectId;

// create a schema
var messageSchema = new Schema({
  sender_id: { type: ObjectId, required: true},
  receiver_id: { type: ObjectId, required: true},
  message: { type: String, required: true},
  date : { type: Date, required: true, default : new Date()}
});

messageSchema.pre('save',function(next){
	this.date= new Date();
	next();
});

// the schema is useless so far
// we need to create a model using it
var Message = mongoose.model('Message', messageSchema);

// make this available to our users in our Node applications
module.exports = Message;