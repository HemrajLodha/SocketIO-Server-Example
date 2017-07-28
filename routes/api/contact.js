var User = require('./../../schema/user').User;
var Contact = require('./../../schema/contact').Contact;
var ContactStatus = require('./../../schema/contact').ContactStatus;
var response = require('./response');
var AppUtil = require('../.././utils/AppUtil');
var async = require('async');
const MAX_PAGE_SIZE = 50;

exports.deleteContact = function(req, res) {
	var user_id = req.body.user_id;
	var users = req.body.users;

	if (AppUtil.isObjectID(user_id) && users && users.length) {

		var getTask = function(contact_id) {
			return function(callback) {
				Contact.findOne({
					user_id : user_id,
					contact_id : contact_id
				}, function(err, contact) {
					if (contact) {
						contact.deleted = true;
						contact.update_date = new Date().getTime();
						contact.save(function(err) {
							callback(err);
						});
					} else {
						callback();
					}
				});
			};
		};

		var taskList = [];
		for (var i = 0; i < users.length; i++) {
			taskList.push(getTask(user[i]));
		}

		async.parallel(taskList, function(err, result) {
			if (err) {
				res.status(200).json(
						response.createResponse(response.FAILED,
								"Failed to delete contact!"));
			} else {
				res.status(200).json(
						response.createResponse(response.SUCCESS,
								"contact deleted successfully!"));
			}
		});

	} else {
		res.status(400)
				.json(
						response.createResponse(response.FAILED,
								"Misssing Parameter!"));
	}

};

/**
 * create new contact
 */
exports.createContact = function(req, res) {
	console.log("body", req.body);
	var user_id = req.body.user_id;
	var users = req.body.users;

	if (AppUtil.isObjectID(user_id) && users) {

		if (AppUtil.isTypeString(users)) {
			users = [ users ];
		}

		var getTask = function(contact_id) {
			return function(callback) {
				Contact.findOne({
					user_id : user_id,
					contact_id : contact_id
				}, function(err, contact) {
					if (contact) {
						callback();
					} else {
						contact = new Contact({
							user_id : user_id,
							contact_id : contact_id,
							blocked : false,
							deleted : false,
							status : ContactStatus.APPROVED,
							update_date : new Date().getTime()
						});

						contact.save(function(err) {
							callback(err);
						});
					}
				});
			};
		};

		var taskList = [];
		for (var i = 0; i < users.length; i++) {
			taskList.push(getTask(users[i]));
		}

		async.parallel(taskList, function(err, result) {
			if (err) {
				res.status(200).json(
						response.createResponse(response.FAILED,
								"Failed to create contact"));
			} else {
				res.status(200).json(
						response.createResponse(response.SUCCESS,
								"contacts created"));
			}
		});

	} else {
		res.status(400)
				.json(
						response.createResponse(response.FAILED,
								"Misssing Parameter!"));
	}

};

exports.contactList = function(req, res) {
	var id = req.query.id;
	var update_date = req.query.update_date;
	var deleted = AppUtil.getBoolean(req.query.deleted, false);
	var pageNo = parseInt(req.query.pageNo || 1);
	if (pageNo !== 0) {
		pageNo--; // decrement page no by 1
	}
	var limit = parseInt(req.query.limit || MAX_PAGE_SIZE);

	if (AppUtil.isObjectID(id)) {
		id = [ id ];

		var query = {};

		query = {
			user_id : id,
			update_date : {
				$gte : update_date
			}
		};

		if (deleted) {
			// do nothing in case of deleted data fetching
		} else {
			query.deleted = deleted;
		}

		Contact
				.count(
						query,
						function(err, count) {
							if (err) {
								console.error("err", err);
								res.status(200).json(
										response.createResponse(
												response.FAILED, "Failed"));
							} else {
								Contact
										.find(query)
										.skip(pageNo * limit)
										.limit(limit)
										.sort({
											update_date : -1
										})
										.populate("contact_id")
										.exec(
												function(err, contacts) {
													// console.log("chats",
													// chats);
													if (!err && contacts) {
														var contactData = [];
														for (var i = 0; i < contacts.length; i++) {
															var contact = contacts[i];
															contactData
																	.push({
																		id : contact.contact_id._id,
																		name : contact.contact_id.name,
																		blocked : contact.blocked,
																		status : contact.status,
																		deleted : contact.deleted,
																		meta : {
																			email : contact.contact_id.meta.email,
																			contact : contact.contact_id.meta.contact,
																			age : contact.contact_id.meta.age,
																		}
																	});
														}
														res
																.status(200)
																.json(
																		response
																				.createResponse(
																						response.SUCCESS,
																						"Success",
																						contactData,
																						count,
																						pageNo,
																						limit));
													} else {
														res
																.status(200)
																.json(
																		response
																				.createResponse(
																						response.FAILED,
																						"Failed"));
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