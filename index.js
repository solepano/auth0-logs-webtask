var contextHelper = require("./contextHelper");
var logsWebtask = require("./logsWebtask");

var context = contextHelper.getContextFromDotEnv();

console.log("Running logsWebtasks with context",context);

logsWebtask(context,function(err,result){
	console.log("err",err,"result",result);
});

