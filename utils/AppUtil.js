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

var getBoolean = function(data, defType) {
	try {
		if (typeof parseInt(data) === "number" && isFinite(data)) {
			return parseInt(data) > 0 ? true : false;
		} else {
			return data === "true";
		}
	} catch (e) {
		console.error("error", e);
		return defType || false;
	}
};

exports.isObjectID = isObjectID;
exports.parseJSON = parseJSON;
exports.getBoolean = getBoolean;