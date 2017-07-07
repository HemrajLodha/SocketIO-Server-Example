var objectID = require('mongodb').ObjectID;

var isObjectID = function(id){
	return objectID.isValid(id);
};

exports.isObjectID = isObjectID;