var objectID = require('mongodb').ObjectID;

var isObjectID = function(id) {
	return objectID.isValid(id);
};

var parseJSON = function(data) {
	try {
		return JSON.parse(str);
	} catch (e) {
		console.error("error", e);
		return "";
	}
};

exports.isObjectID = isObjectID;
exports.parseJSON = parseJSON;