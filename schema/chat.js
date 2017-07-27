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
  type :{ type:Number,required:true},
  admin_ids :[{type:ObjectId, ref:"User"}],
  deleted : { type:Boolean, required:true, default:false},
  create_date : { type: Number, required: true, default : new Date().getTime()},
  update_date : { type: Number, required: true, default : new Date().getTime()}
});

chatSchema.pre('save',function(next){
	this.create_date = new Date().getTime();
	this.update_date = new Date().getTime();
	next();
});

chatSchema.pre('update',function(next){
	this.update_date = new Date().getTime();
	next();
});

// the schema is useless so far
// we need to create a model using it
var Chat = mongoose.model('chat', chatSchema);

// make this available to our users in our Node applications
module.exports = {Chat,ChatType};
