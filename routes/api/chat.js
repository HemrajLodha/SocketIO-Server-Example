var Message = require('./../../schema/message').Message;
var MessageType = require('./../../schema/message').MessageType;
var Chat = require('./../../schema/chat').Chat;
var ChatType = require('./../../schema/chat').ChatType;
var response = require('./response');
var AppUtil = require('../.././utils/AppUtil');

exports.deleteChat = function(req, res) {
	var user_id = req.body.user_id;
	var chat_id = req.body.chat_id;

	if (AppUtil.isObjectID(chat_id) && AppUtil.isObjectID(user_id)) {
		Chat.findOne({
			$and : [ {
				_id : chat_id
			}, {
				admin_ids : {
					$in : [ user_id ]
				}
			} ]
		}, function(err, chat) {
			console.log("chat", chat);
			if (!err && chat) {
				if (parseInt(chat.type) == ChatType.PERSONAL) {
					res.status(200).json(
							response.createResponse(response.FAILED,
									"Private chat can not be deleted!"));
				} else {
					chat.remove(function(err) {
						if (err) {
							res.status(200).json(
									response.createResponse(response.FAILED,
											"Failed to delete chat!"));
						} else {
							res.status(200).json(
									response.createResponse(response.SUCCESS,
											"chat deleted successfully!"));
						}
					});
				}

			} else {
				res.status(200).json(
						response.createResponse(response.FAILED,
								"No chat found or you are not group owner!"));
			}
		})
	} else {
		res.status(400)
				.json(
						response.createResponse(response.FAILED,
								"Misssing Parameter!"));
	}

};

/**
 * create new chat
 */
exports.createChat = function(req, res) {
	console.log("body", req.body);
	var user_id = req.body.user_id;
	var users = req.body.users;
	var type = req.body.type;
	var name = req.body.name || "";

	if (AppUtil.isObjectID(user_id) && users && users.length != 0 && type) {
		console.log("req", req.body);
		users.push(user_id); // push own user id
		var createChat = function(chat) {
			chat.admin_ids = [ user_id ];
			chat.save(function(err) {
				if (err) {
					res.status(400).json(
							response.createResponse(response.FAILED,
									"Fialed to create personal chat"));
				} else {
					res.status(200)
							.json(
									response.createResponse(response.SUCCESS,
											"Success"));
				}
			})
		};

		switch (parseInt(type)) {
		case ChatType.PERSONAL:
			Chat.findOne({
				users : {
					$all : users
				},
				type : ChatType.PERSONAL
			}, function(err, chat) {
				console.log("chat", chat);
				if (chat) {
					chat.last_message_id = undefined;
					createChat(chat);
				} else {
					chat = new Chat({
						users : users,
						type : type
					});
					createChat(chat);
				}
			});
			break;
		case ChatType.GROUP:
			chat = new Chat({
				users : users,
				type : type
			});
			createChat(chat);
			break;
		case ChatType.BROADCAST:
			// TODO
			break;

		default:
			res.status(400).json(
					response.createResponse(response.FAILED,
							"Invalid chat type"));
			break;
		}

	} else {
		res.status(400)
				.json(
						response.createResponse(response.FAILED,
								"Misssing Parameter!"));
	}

};

exports.chatList = function(req, res) {
	var id = req.query.id;
	if (AppUtil.isObjectID(id)) {
		id = [ id ];
		Chat
				.find({
					users : {
						$in : id
					}
				})
				.populate("users", null, {
					_id : {
						$ne : id
					}
				})
				.populate("last_message_id")
				.exec(
						function(err, chats) {
							console.log("chats", chats);
							if (chats && chats.length) {
								var chatData = [];
								for (var i = 0; i < chats.length; i++) {
									var chat = chats[i];

									switch (parseInt(chat.type)) {
									case ChatType.PERSONAL:
										chatData
												.push({
													id : chat._id,
													type : chat.type,
													name : chat.users[0].name,
													update_date : chat.update_date,
													last_message : chat.last_message_id !== undefined ? chat.last_message_id.message
															: "" || ""
												});
										break;
									case ChatType.GROUP:
										var chatName = "";
										for (var j = 0; j < chat.users.length; j++) {
											if (chatName === "") {
												chatName = chat.users[j].name;
											} else if (j < 2) {
												chatName = chatName + ", "
														+ chat.users[j].name;
											} else {
												chatName = chatName
														+ "... +"
														+ (chat.users.length - j);
												break;
											}
										}
										console.log("chatName", chatName);
										chatData
												.push({
													id : chat._id,
													type : chat.type,
													name : chatName,
													update_date : chat.update_date,
													last_message : chat.last_message_id !== undefined ? chat.last_message_id.message
															: "" || ""
												});
										break;
									}
								}

								res.status(200).json(
										response.createResponse(
												response.SUCCESS, "Success",
												chatData));
							} else {
								res.status(400).json(
										response.createResponse(
												response.FAILED, "Failed"));
							}
						});
	} else {
		res.status(400)
				.json(
						response.createResponse(response.FAILED,
								"Misssing Parameter!"));
	}
};