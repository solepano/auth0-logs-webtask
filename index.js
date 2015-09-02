var contextHelper = require("./contextHelper");
var logsWebtask = require("./logsWebtask");

var context = contextHelper.getContextFromDotEnv();

console.log("Running logsWebtasks with context",context);

logsWebtask(context)
  .then( result => console.log("finished ok!",result))
  .catch( err => console.log("Execution failed.",err,err.stack));