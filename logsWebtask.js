"use latest";
/* 
  Gets Auth0 logs
*/
//const Auth0 = require('auth0');
const Auth0 = require("auth0@0.8.2");
const request = require('request');
const NestedError = require('nested-error-stacks');
let auth0Api;
let logglyClient;

//default number of logs to fetch at a time from auth0 API to bulk insert in Loggly
const DEFAULT_TAKE = 5;
//max number of logs to fetch at a time from auth0 API to bulk insert in Loggly
const MAX_TAKE = 200;

module.exports = function(context) {

  return new Promise((resolve,reject) => {       
    console.log("[logsWebtask] Checking context params...");

    const required_params = [
      "AUTH0_DOMAIN",
      "AUTH0_CLIENT_ID",
      "AUTH0_CLIENT_SECRET",
      "LOGGLY_TOKEN"
    ];    
      
    for (const p in required_params){
      if (!context.data[required_params[p]]){
        return reject(new Error("The '" + required_params[p] + "' parameter must be provided."));
      } 
    }
      
    //Get optional query string params
    let lastLogId = context.data.checkpointId;
    const take = context.data.take? parseInt(context.data.take): DEFAULT_TAKE;
    if (isNaN(take) || take < 0 || take > MAX_TAKE){
      return reject (new Error("The 'take' parameter must be an integer between 0 and 200, but "+context.data.take+" was received instead."));
    }

    //Initialize Clients
    if (!auth0Api){
      initAuth0Api();
    }
    if (!logglyClient){
      initLogglyClient();
    }
    
    //Get last fetched log id from last successful run  
    if (context.body && context.body.results && context.body.results.length > 0){
      console.log("[logsWebtask] context.body.results",JSON.stringify(context.body.results));
      for (let i = 0; i < context.body.results.length; i++) { 
        if (context.body.results[i].statusCode === 200){
          try {
            lastLogId = JSON.parse(context.body.results[i].body).lastLogId; 
          } catch(parseEx){
            return reject(new NestedError("Error parsing last execution body: " + context.body.results[i].body, parseEx));
          }
          break;
        }
      };
      console.log("[logsWebtask] lastLogId",lastLogId);
    }
    
    //Get Auth0 Logs
    const logsOpts = {
      from: lastLogId,
      take: take
    };
    console.log("Fetching logs from Auth0",logsOpts);
      auth0Api.getLogs(logsOpts,(err,result) => {
        if (err){
          return reject(new NestedError("Error retrieving Auth0 logs",err));
        } 
        //Send them to Loggly
        console.log("got logs!",result);
        if (result && result.length > 0){
          logglyClient.bulkLog(result)
          .then((logResult) => {
            return resolve({
              lastLogId : result[result.length - 1]._id
            });
          }).catch( (err) => {
            return reject(err)
          });
        }
        else {
          return resolve({
            lastLogId : lastLogId //if no results, keep same lastLogId
          });     
        }
      });

  });

  function initAuth0Api(){
    const auth0Opts = {
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

  function initLogglyClient(){
    const logglyOpts = {
      token: context.data["LOGGLY_TOKEN"]
    };
    console.log("[logsWebtask] Initializing loggly client...");      
    logglyClient = new LogglyClient(logglyOpts);
  };

};

//------------- Loggly Client -------------------------------------
class LogglyClient {

  constructor(options) {
    if (!options || !options.token) {
        throw new Error('options.token is required.');
    }
    this.host = options.host || 'logs-01.loggly.com';
    this.bulkUrl = `https://${ this.host }/bulk/${ options.token }/tag/bulk/`;
  }

  bulkLog(msgArray) {
    return new Promise((resolve,reject) => {       
      if (!Array.isArray(msgArray)) {
        return reject(new Error('msgArray should be an array'));
      }
      const messages = msgArray.map(JSON.stringify).join('\n');
      const requestOpts = {
        url: this.bulkUrl,
        method: 'POST',
        body: messages,
        headers: { 'content-type': 'application/json' }
      };
      request(requestOpts, (err, res, body) => {
        if (err) {
          return reject(new NestedError(`Error sending logs to Loggly. Url: ${ requestOpts.url }`, err));
        }
        if (res.statusCode !== 200) {
          return reject(new Error(`Error sending logs to Loggly. Status: ${ r.statusCode }, body: ${ body }`));
        }
        resolve(JSON.parse(body));
      });
    });
  }
}