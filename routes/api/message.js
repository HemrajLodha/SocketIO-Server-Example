var Message = require('../.././schema/message');
var response = require('./response');
var AppUtil = require('../.././utils/AppUtil');

exports.save = function(data) {
	console.log("data",data);
	var message = new Message({
		sender_id : data.sender_id,
		receiver_id : data.receiver_id,
		message : data.message
	});
	message.save(function(err){
		if(err){
			console.error("Failed to save message " + err);
		}else{
			console.log("Message saved!!");
		}
	});
};