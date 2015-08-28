var assert = require("assert");
var logsWebtask = require("../logsWebtask");
var contextHelper = require("../contextHelper");

describe("logs webtask", function(){
	it("should fail if required secrets are not provided",function(done){
		logsWebtask({data:{foo:"bar"}},function(err,result){
			assert.ok(err);
			assert.equal(err.message,"The 'AUTH0_DOMAIN' parameter must be provided.");
			done();
		});
	});

	it("should fetch auth0 logs",function(done){
		var context = contextHelper.getContextFromDotEnv();
		logsWebtask(context,function(err,result){
			assert.ok(!err,err);
			assert.ok(result);
			assert.ok(result.length);
			assert.ok(result.total);
			assert.ok(result.logs);
			done();
		});
	});
});