/* 
  Gets Auth0 logs
*/
//var Auth0 = require("auth0");
var Auth0 = require("auth0@0.8.2");
var request = require("request");
var NestedError = require('nested-error-stacks');

var auth0Api;
var logglyClient;

module.exports = function(context, cb) {

	console.log("[logsWebtask] Checking context params...");

	var required_params = [
		"AUTH0_DOMAIN",
		"AUTH0_CLIENT_ID",
		"AUTH0_CLIENT_SECRET",
		"LOGGLY_TOKEN"
	];    
    
    for (var p in required_params){
    	if (!context.data[required_params[p]]){
			return cb(new Error("The '" + required_params[p] + "' parameter must be provided."));
    	} 
    }
    
    //Initialize Clients
	if (!auth0Api){
		initAuth0Api();
	}

	if (!logglyClient){
		initLogglyClient();
	}
	//Get last fetched log id from last successful run
	var lastLogId;
	if (context.body && context.body.results && context.body.results.length > 0){
		console.log("[logsWebtask] context.body.results",JSON.stringify(context.body.results));
		for (var i = 0; i < context.body.results.length; i++) { 
			if (context.body.results[i].statusCode === 200){
				try {
					lastLogId = JSON.parse(context.body.results[i].body).lastLogId; 
				} catch(parseEx){
					return cb(new NestedError("Error parsing last execution body: " + context.body.results[i].body, parseEx));
				}
				break;
			}
		};
		console.log("[logsWebtask] lastLogId",lastLogId);
	}
	//Get Auth0 Logs
	var logsOpts = {
		from: lastLogId,
		take: 50
	};
	console.log("Fetching logs from Auth0",logsOpts);
    auth0Api.getLogs(logsOpts,function(err,result){
    	if (err){
    		return cb(new NestedError("Error retrieving Auth0 logs",err));
    	} 
	    //Send them to Loggly
	    console.log("got logs!",result);
	    if (result && result.length > 0){
	    	logglyClient.bulkLog(result,function(err,logResult){
	    		if (err) return cb(err);
	    		return cb(null,{
	    			lastLogId : result[result.length - 1]._id
	    		});
	    	});
	    }
	    else {
	    	return cb(null, {
	    		lastLogId : lastLogId //if no results, keep same lastLogId
	    	});   	
	    }
    });

	function initAuth0Api(){
		var auth0Opts = {
	    	domain: context.data["AUTH0_DOMAIN"] + ".auth0.com",
	 		clientID: context.data["AUTH0_CLIENT_ID"],
	 		clientSecret: context.data["AUTH0_CLIENT_SECRET"]
	 	};
	 	console.log("[logsWebtask] Initializing Auth0 api for domain ", auth0Opts.domain);
	    try {
			auth0Api = new Auth0(auth0Opts);
		} catch(err) {
			return cb(new NestedError("Error initializing Auth0 API", err));
		}		
	}

	function initLogglyClient(opts){
		var logglyOpts = {
	    	token: context.data["LOGGLY_TOKEN"]
	    };
	 	console.log("[logsWebtask] Initializing loggly client...");
	    
		logglyClient = new LogglyClient(logglyOpts);
	};
};

//------------- Loggly Client -------------------------------------

var LogglyClient = function (options) {
    if (!options || !options.token) {
	    throw new Error('options.token is required.');
	}
	this._host = options.host || "logs-01.loggly.com",
	this._bulkUrl = "https://" + this._host + "/bulk/" + options.token + "/tag/bulk/";
};

LogglyClient.prototype.bulkLog = function (msgArray,cb) {
	if (! Array.isArray(msgArray)){
		return cb(new Error("msgArray should be an array"));
	}
    var messages = msgArray.map(JSON.stringify).join("\n");

    var requestOpts = {
    	url: this._bulkUrl,
    	method: "POST",
    	body: messages,
    	headers: {
	    	"content-type": "application/json"
	    }
    };

    request(requestOpts,function(err, res, body){
    	if (err){
    		return cb(new NestedError("Error sending logs to Loggly. Url: "+requestOpts.url,err));
    	}
		if (res.statusCode !== 200) { 
			return cb(new Error("Error sending logs to Loggly. Status: "+r.statusCode+", body: "+body)); 
		}
    	cb(null, JSON.parse(body));
    });


};