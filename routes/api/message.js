var Message = require('../.././schema/message').Message;
var Chat = require('../.././schema/chat').Chat;
var response = require('./response');
var AppUtil = require('../.././utils/AppUtil');

var saveMessage = function(chat, data) {
	console.log("data", data);
	var message = new Message({
		sender_id : data.sender_id,
		chat_id : data.receiver_id,
		type : data.type,
		message : data.message
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
				data.type = chat.type;
				saveMessage(chat, data);
			}
		}
	})
};