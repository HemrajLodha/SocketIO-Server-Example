var User = require('../.././schema/user');
var response = require('./response');
var AppUtil = require('../.././utils/AppUtil');
const bcrypt = require('bcrypt');

exports.login = function(req, res) {
	var username = req.body.username;
	var password = req.body.password;

	if (username && password) {

		User.findOne({
			username : username
		}, function(err, user) {
			if (user) {
				bcrypt.compare(password, user.password, function(err, result) {
					if (result) {
						res.json(response.createResponse(response.SUCCESS,
								"Success!", {
									id : user._id,
									name : user.name,
									username : user.username,
									meta : user.meta
								}));
					} else {
						res.json(response.createResponse(response.FAILED,
								"Invalid Password!"));
					}
				});
			} else {
				res.json(response.createResponse(response.FAILED,
						"Invalid User!"));
			}
		});

	} else {
		res.status(400)
				.json(
						response.createResponse(response.FAILED,
								"Misssing Parameter!"));
	}
};

exports.add = function(req, res) {
	var name = req.body.name;
	var username = req.body.username;
	var password = req.body.password;
	var age = req.body.age;
	var contact = req.body.contact;
	var email = req.body.email;
	var website = req.body.website;
	var admin = req.body.admin | false;

	if (name && username && password) {
		User.findOne({
			username : username
		}, function(err, result) {
			if (result) {
				res.json(response.createResponse(response.FAILED,
						"User Name already exists."));
			} else {
				bcrypt.hash(password, 10, function(err, hash) {
					if (err) {
						res.json(response.createResponse(response.FAILED,
								"Failed to encypt credentials!"));
					} else {
						var user = new User({
							name : name,
							username : username,
							password : hash,
							admin : admin,
							meta : {
								age : age,
								email : email,
								website : website,
								contact : contact
							}
						});

						user.save(function(err) {
							if (err) {
								console.error(err);
								res.json(response
										.createResponse(response.FAILED,
												"Failed to save user!"));
							} else {
								res.json(response.createResponse(
										response.SUCCESS, "User saved!!"));
							}
						});
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

exports.user = function(req, res) {
	var id = req.query.id;
	if (AppUtil.isObjectID(id)) {
		User.findOne({
			_id : id
		}, function(err, user) {
			if (user) {
				res.json(response.createResponse(response.SUCCESS,
						"Data found!!", {
							id : user._id,
							name : user.name,
							username : user.username,
							password : user.password,
							admin : user.admin,
							location : user.location,
							meta : {
								age : user.meta.age,
								email : user.meta.email,
								website : user.meta.website,
								contact : user.meta.contact
							},
						}));
			} else {
				res.json(response.createResponse(response.FAILED,
						"User not found!!"));
			}
		});
	} else {
		res.status(400)
				.json(
						response.createResponse(response.FAILED,
								"Misssing Parameter!"));
	}
};

exports.userAll = function(req, res) {
	var id = req.query.id;
	if (AppUtil.isObjectID(id)) {
		User.find({
			_id : {
				$ne : id
			}
		}, function(err, users) {
			if (users) {
				var data = [];
				for (var i = 0; i < users.length; i++) {
					var user = users[i];
					data.push({
						id : user._id,
						name : user.name,
						username : user.username,
						password : user.password,
						admin : user.admin,
						location : user.location,
						update_date : user.update_date,
						meta : {
							age : user.meta.age,
							email : user.meta.email,
							website : user.meta.website,
							contact : user.meta.contact
						}
					});
				}
				res.json(response.createResponse(response.SUCCESS,
						"Data found!!", data));
			} else {
				res.json(response.createResponse(response.FAILED,
						"User not found!!"));
			}
		});
	} else {
		res.status(400)
				.json(
						response.createResponse(response.FAILED,
								"Misssing Parameter!"));
	}
};