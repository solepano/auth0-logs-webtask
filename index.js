var contextHelper = require("./contextHelper");
var logsWebtask = require("./logsWebtask");

var context = contextHelper.getContextFromDotEnv();

console.log("Running logsWebtasks with context",context);

logsWebtask(context,function(err,result){
	if (err){
		console.log("Execution failed.",err,err.stack);
	} else {
		console.log("finished ok!",result);
	}
});

