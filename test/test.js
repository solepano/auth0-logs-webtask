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
			assert.ok(!err,err + (err||{stack:""}).stack);
			assert.ok(result);
			assert.ok(result.lastLogId);
			//console.log("result",result);
			done();
		});
	});

	it("should accept initialCheckpointId param",function(done){
		var context = contextHelper.getContextFromDotEnv();
		context.data.checkpointId = "55e51d7ed7840991154993f6";
		context.data.take = "0";
		logsWebtask(context,function(err,result){
			assert.ok(!err,err + (err||{stack:""}).stack);
			assert.ok(result);
			assert.ok(result.lastLogId);
			assert.equal(result.lastLogId,context.data.checkpointId);
			done();
		});
	});

	it("should fail if 'take' param is greater than max value",function(done){
		var context = contextHelper.getContextFromDotEnv();
		context.data.take = "300";
		logsWebtask(context,function(err,result){
			assert.ok(err);
			assert.equal(err.message,"The 'take' parameter must be an integer between 0 and 200, but 300 was received instead.");
			done();
		});
	});

	it("should fail if 'take' param is not a number",function(done){
		var context = contextHelper.getContextFromDotEnv();
		context.data.take = "foo";
		logsWebtask(context,function(err,result){
			assert.ok(err);
			assert.equal(err.message,"The 'take' parameter must be an integer between 0 and 200, but foo was received instead.");
			done();
		});
	});

	it("should fail if 'take' param is a negative number",function(done){
		var context = contextHelper.getContextFromDotEnv();
		context.data.take = "-40";
		logsWebtask(context,function(err,result){
			assert.ok(err);
			assert.equal(err.message,"The 'take' parameter must be an integer between 0 and 200, but -40 was received instead.");
			done();
		});
	});
});