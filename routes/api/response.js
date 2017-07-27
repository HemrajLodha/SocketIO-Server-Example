/**
 * http://usejsdoc.org/
 * 
 */

var createResponse = function(resStatus, msg, result, recordCount, pageNo,
		limit) {
	return {
		status : resStatus,
		message : msg,
		data : result,
		dataCount : recordCount,
		pageNo : pageNo,
		limit : limit
	};
};
exports.SUCCESS = 1;
exports.FAILED = 0;
exports.ERROR = 2;
exports.createResponse = createResponse;