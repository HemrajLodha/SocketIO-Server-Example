var Message = require('./../../schema/message').Message;
var MessageType = require('./../../schema/message').MessageType;
var Chat = require('./../../schema/chat').Chat;
var ChatType = require('./../../schema/chat').ChatType;
var response = require('./response');
var AppUtil = require('../.././utils/AppUtil');
const MAX_PAGE_SIZE = 50;

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
					chat.deleted = true;
					chat.update_date = new Date().getTime();
					chat.save(function(err) {
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

		if (typeof users === 'string') {
			users = [ users ];
		}

		users.push(user_id); // push own user id
		var createChat = function(chat) {
			chat.admin_ids = [ user_id ];
			chat.update_date = new Date().getTime();
			chat
					.save(function(err) {
						if (err) {
							res.status(400).json(
									response.createResponse(response.FAILED,
											"Fialed to create personal chat"));
						} else {

							Chat
									.findById(chat._id)
									.populate("users", null, {
										_id : {
											$ne : user_id
										}
									})
									.populate("last_message_id")
									.exec(
											function(err, chatData) {
												if (!err && chatData) {
													var data = getChatData(chatData);
													data = [ data ];
													res
															.status(200)
															.json(
																	response
																			.createResponse(
																					response.SUCCESS,
																					"Success",
																					data));
												} else {
													res
															.status(200)
															.json(
																	response
																			.createResponse(
																					response.SUCCESS,
																					"Chat created but failed to get data"));
												}

											});
						}
					});
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

var getChatData = function(chat) {

	var chatUsers = [];
	var chatData = {};

	for (var x = 0; x < chat.users.length; x++) {
		chatUsers.push({
			id : chat.users[x]._id,
			name : chat.users[x].name
		});
	}

	switch (parseInt(chat.type)) {
	case ChatType.PERSONAL:
		chatData = {
			id : chat._id,
			type : chat.type,
			name : chatUsers[0].name,
			users : chatUsers,
			admin_ids : chat.admin_ids,
			deleted : chat.deleted,
			create_date : chat.create_date,
			update_date : chat.update_date,
			last_message : chat.last_message_id !== undefined ? chat.last_message_id.message
					: "" || ""
		};
		break;
	case ChatType.GROUP:
		var chatName = "";
		for (var j = 0; j < chat.users.length; j++) {
			if (chatName === "") {
				chatName = chat.users[j].name;
			} else if (j < 2) {
				chatName = chatName + ", " + chat.users[j].name;
			} else {
				chatName = chatName + "... +" + (chat.users.length - j);
				break;
			}
		}
		chatData = {
			id : chat._id,
			type : chat.type,
			name : chatName,
			users : chatUsers,
			admin_ids : chat.admin_ids,
			deleted : chat.deleted,
			create_date : chat.create_date,
			update_date : chat.update_date,
			last_message : chat.last_message_id !== undefined ? chat.last_message_id.message
					: "" || ""
		};
		break;
	}
	return chatData;
};

exports.chatList = function(req, res) {

	var id = req.query.id;
	var update_date = req.query.update_date || 0;
	var deleted = AppUtil.getBoolean(req.query.deleted, false);
	var pageNo = parseInt(req.query.pageNo || 1);
	if (pageNo !== 0) {
		pageNo--; // decrement page no by 1
	}
	var limit = parseInt(req.query.limit || MAX_PAGE_SIZE);

	if (AppUtil.isObjectID(id)) {
		id = [ id ];

		var query = {
			$and : [ {
				users : {
					$in : id
				}
			}, {
				update_date : {
					$gte : parseInt(update_date)
				}
			} ]
		};

		if (deleted) {
			// do nothing in case of deleted data fetching
		} else {
			query.deleted = deleted;
		}

		Chat.count(query, function(err, count) {
			if (err) {
				console.error("err", err);
				res.status(200).json(
						response.createResponse(response.FAILED, "Failed"));
			} else {
				Chat.find(query).skip(pageNo * limit).limit(limit).sort({
					update_date : -1
				}).populate("users", null, {
					_id : {
						$ne : id
					}
				}).populate("last_message_id").exec(
						function(err, chats) {
							console.log("err", err);
							if (!err && chats) {
								var chatData = [];
								for (var i = 0; i < chats.length; i++) {
									var chat = chats[i];
									chatData.push(getChatData(chat));
								}
								res.status(200)
										.json(
												response.createResponse(
														response.SUCCESS,
														"Success", chatData,
														count, pageNo, limit));
							} else {
								res.status(200).json(
										response.createResponse(
												response.FAILED, "Failed"));
							}
						});
			}
		});

	} else {
		res.status(400)
				.json(
						response.createResponse(response.FAILED,
								"Misssing Parameter!"));
	}
};