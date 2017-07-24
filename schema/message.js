// grab the things we need
var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var ObjectId = Schema.ObjectId;

const MessageType = {
		TEXT : 0,
		PICTURE : 1,
		AUDIO:2,
		VIDEO:3
	};

const EventType = {
		JOIN : 1,
		MESSAGE : 2,
		TYPING:3
	};

// create a schema
var messageSchema = new Schema({
  sender_id: { type: ObjectId, required: true},
  chat_id: { type: ObjectId, required: true},
  message: { type: String},
  image_url : { type: String},
  type: {type:Number, required:true},
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
module.exports = {Message,MessageType,EventType};