/**
 * http://usejsdoc.org/
 * 
 */



var createResponse = function(resStatus,msg,result){
	return {status : resStatus,
		message : msg,
		data : result};
};
exports.SUCCESS=1;
exports.FAILED=0;
exports.ERROR=2;
exports.createResponse = createResponse; 