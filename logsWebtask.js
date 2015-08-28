/* 
  Gets Auth0 logs
*/

var request = require("request");

var auth0Api;

module.exports = function(context, cb) {

	var required_params = [
		"AUTH0_DOMAIN",
		"AUTH0_CLIENT_ID",
		"AUTH0_CLIENT_SECRET",
		"LOGGLY_SUBDOMAIN", 
		"LOGGLY_TOKEN", 
		"LOGGLY_USERNAME", 
		"LOGGLY_PASSWORD"];
    
    console.log("checking params...");

    for (var p in required_params){
    	if (!context.data[required_params[p]]){
			return cb(new Error("The '" + required_params[p] + "' parameter must be provided."));
    	} 
    }
       
	if (!auth0Api){
		console.log("initializing api...");
		var auth0Opts = {
	    	domain: context.data["AUTH0_DOMAIN"] + ".auth0.com",
	 		clientID: context.data["AUTH0_CLIENT_ID"],
	 		clientSecret: context.data["AUTH0_CLIENT_SECRET"]
	 	}
	    initAuth0Api(auth0Opts);
	}

    auth0Api.getLogs(function(err,result){
    	if (err){
    		console.log("Error getting logs",err);
    		return cb(err);
    	} 
	    
	    console.log("got logs!",result);
    	return cb(null,result);
    });

	function initAuth0Api(opts){
		var Auth0 = require("auth0");
		auth0Api = new Auth0(opts);
	}
};