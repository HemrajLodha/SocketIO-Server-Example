var Message = require('../.././schema/message').Message;
var Chat = require('../.././schema/chat').Chat;
var EventType = require('../.././schema/message').EventType;
var response = require('./response');
var AppUtil = require('../.././utils/AppUtil');
var fs = require('fs');

var saveMessage = function(chat, data) {
	console.log("data", data);
	var message = new Message({
		sender_id : data.sender_id,
		chat_id : data.receiver_id,
		type : data.message_type,
		image_url : data.image_url || "",
		message : data.message || ""
	});
	message.save(function(err) {
		if (err) {
			console.error("Failed to save message " + err);
		} else {
			console.log("Message saved!!");
			chat.last_message_id = message._id;
			chat.save(function(err) {
				if (!err) {
					console.log("last message id updated for chat ", chat._id);
				}
			});
		}
	});
};

exports.sendMessage = function(data, socket) {
	Chat.findOne({
		_id : data.receiver_id
	}, function(err, chat) {
		if (err) {
			console.error("Failed to send message", err);
		} else {
			try {
				for (var i = 0; i < chat.users.length; i++) {
					if (chat.users[i] != data.sender_id) {
						socket.to(chat.users[i]).emit("message", data);
					}
				}
			} catch (err) {
				console.error(err);
			} finally {
				if (parseInt(data.event) === EventType.MESSAGE) {
					data.type = chat.type;
					saveMessage(chat, data);
				}
			}
		}
	})
};

exports.sendPictureMessage = function(req, res) {
	var sender_id = req.body.sender_id;
	var sender_name = req.body.sender_name;
	var receiver_id = req.body.receiver_id;
	var message = req.body.message || "";
	var message_type = req.body.message_type;
	var event = req.body.event;
	var image = req.file;

	if (image) {
		var data = {
			sender_id : sender_id,
			sender_name : sender_name,
			receiver_id : receiver_id,
			message : message,
			message_type : message_type,
			event : event,
			image_url : image.filename,
		}

		res.status(200).json(
				response.createResponse(response.SUCCESS,
						"Successfully Uploaded", data))
	} else {
		res.status(200)
				.json(response.createResponse(response.FAILED, "Failed"))
	}
};
