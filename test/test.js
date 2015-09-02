
var chai = require("chai");
var chaiAsPromised = require("chai-as-promised");
chai.use(chaiAsPromised);
var assert = chai.assert;
var expect = chai.expect;

var logsWebtask = require("../logsWebtask");
var contextHelper = require("../contextHelper");

describe("logs webtask", function(){
  it("should fail if required secrets are not provided",function(){
    var promise = logsWebtask({data:{foo:"bar"}});
    return assert.isRejected(promise, /The 'AUTH0_DOMAIN' parameter must be provided./);
  });

  it("should fetch auth0 logs",function(){
    var context = contextHelper.getContextFromDotEnv();
    var promise = logsWebtask(context);
    return expect(promise).to.eventually.have.property("lastLogId");
  });

  it("should accept initialCheckpointId param",function(){
    var context = contextHelper.getContextFromDotEnv();
    context.data.checkpointId = "55e51d7ed7840991154993f6";
    context.data.take = "0";
    var promise = logsWebtask(context);
    return expect(promise).to.become({"lastLogId":context.data.checkpointId});
  });

  it("should fail if 'take' param is greater than max value",function(){
    var context = contextHelper.getContextFromDotEnv();
    context.data.take = "300";
    var promise = logsWebtask(context);
    return assert.isRejected(promise, /The 'take' parameter must be an integer between 0 and 200, but 300 was received instead./);
  });

  it("should fail if 'take' param is not a number",function(){
    var context = contextHelper.getContextFromDotEnv();
    context.data.take = "foo";
    var promise = logsWebtask(context);
    return assert.isRejected(promise, /The 'take' parameter must be an integer between 0 and 200, but foo was received instead./);
  });

  it("should fail if 'take' param is a negative number",function(){
    var context = contextHelper.getContextFromDotEnv();
    context.data.take = "-40";
    var promise = logsWebtask(context);
    return assert.isRejected(promise, /The 'take' parameter must be an integer between 0 and 200, but -40 was received instead./);
  });
  
});