var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var ObjectId = Schema.ObjectId;

var ChatType = {
		PERSONAL: 0,
		GROUP:1,
		BROADCAST:2
};

// create a schema
var chatSchema = new Schema({
  name : {type:String},
  users: [{ type: ObjectId, required: true, ref:"User"}],
  last_message_id: { type: ObjectId, ref:"Message"},
  date : { type: Date, required: true, default : new Date()},
  type :{ type:Number,required:true},
  admin_ids :[{type:ObjectId, ref:"User"}],
  update_date : { type: Date, required: true, default : new Date()}
});

chatSchema.pre('save',function(next){
	this.date= new Date();
	this.update_date= new Date();
	next();
});

chatSchema.pre('update',function(next){
	this.update_date= new Date();
	next();
});

// the schema is useless so far
// we need to create a model using it
var Chat = mongoose.model('chat', chatSchema);

// make this available to our users in our Node applications
module.exports = {Chat,ChatType};
