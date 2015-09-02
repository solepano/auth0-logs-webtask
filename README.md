# auth0-logs-webtask
This webtask serves as an example of how you can pull logs from the Auth0 API and push them to a third party product. In this example in particular we will be pushing the logs to [Loggly](https://webtask.io/cli). 

In order to run the sample you will need:
* Auth0 credentials: domain, clientId and clientSecret
* Loggly credentials: customer token

The idea is to schedule the webtask to run periodically. The first time the webtask runs, it will fetch the first available Auth0 logs (up to 200), will push logs to Loggly and will return the id of the last log retrieved. An example of a webtask execution result is:

```sh
{
  "lastLogId": "55e47e08fb9377a9748fddd6"
}
```
The following executions will use the lastLogId returned from the last run as the [checkpointId](https://auth0.com/docs/api/v1#!#get--api-logs-from--checkpointId--take--count-) from which to return further logs from.

This is possible because when the webtask is croned you are able to access the latest runs' results from the context:

```sh
module.exports = function(context, cb) {
	if (context.body && context.body.results && context.body.results.length > 0){
		var lastRun = context.body.results[0];
		var lastRunStatus = lastRun.statusCode;
		var lastLogId = JSON.parse(lastRun.body).lastLogId; 
	}
	//...
}
```

## Running in a local dev environment
You have to add a .env file in the root folder containing the following settings:

```sh
AUTH0_DOMAIN=yourauth0domain
AUTH0_CLIENT_ID=yourAuth0ClientId
AUTH0_CLIENT_SECRET=yourAuth0ClientSecret
LOGGLY_TOKEN=yourLogglyToken
```

Install dependencies 

```sh
$ npm install
```
Change require of auth0 module in logsWebtask.js from
```sh
const Auth0 = require("auth0@0.8.2");
```
to
```sh
const Auth0 = require("auth0");
```

You will need [Babel](https://babeljs.io/) installed

$ npm install --global babel

You can run mocha tests with:

```sh
$ npm test
```
Or execute locally running

```sh
$ babel-node index
```

## Deploy as a webtasks with secrets

You first need to setup the [webtask-cli wt](https://webtask.io/cli):

```sh
$ npm i -g wt-cli
$ wt init
```

Don't forget to change back require of auth0 module in logsWebtask.js from
```sh
const Auth0 = require("auth0");
```
to
```sh
const Auth0 = require("auth0@0.8.2");
```

After that, you can create the webtask from a local file:

```sh
$ wt create logsWebtask.js \
        --name logs \
        --secret AUTH0_DOMAIN=yourauth0domain \
		--secret AUTH0_CLIENT_ID=yourAuth0ClientId \
		--secret AUTH0_CLIENT_SECRET=yourAuth0ClientSecret \
		--secret LOGGLY_TOKEN=yourLogglyToken
```

or from a url:

```sh
$ wt create https://raw.githubusercontent.com/solepano/auth0-logs-webtask/master/logsWebtask.js \
        --name logs \
        --secret AUTH0_DOMAIN=yourauth0domain \
		--secret AUTH0_CLIENT_ID=yourAuth0ClientId \
		--secret AUTH0_CLIENT_SECRET=yourAuth0ClientSecret \
		--secret LOGGLY_TOKEN=yourLogglyToken
```

And then run it with:

```sh
$ curl 'https://webtask.it.auth0.com/api/run/<tenant>/logs?webtask_no_cache=1'
```

## Schedule the webtask
We can use the wt cron command in order to schedule the webtask (in this example every 2 minutes):

```sh
$ wt cron schedule --name logs \
        --secret AUTH0_DOMAIN=yourauth0domain \
		--secret AUTH0_CLIENT_ID=yourAuth0ClientId \
		--secret AUTH0_CLIENT_SECRET=yourAuth0ClientSecret \
		--secret LOGGLY_SUBDOMAIN=yourLogglySubdomain \
		--secret LOGGLY_TOKEN=yourLogglyToken 
		--json \
		"*/2 * * * *" \
		logsWebtask.js
```

Or, to schedule it from an url:

```sh
$ wt cron schedule --name logs \
        --secret AUTH0_DOMAIN=yourauth0domain \
		--secret AUTH0_CLIENT_ID=yourAuth0ClientId \
		--secret AUTH0_CLIENT_SECRET=yourAuth0ClientSecret \
		--secret LOGGLY_SUBDOMAIN=yourLogglySubdomain \
		--secret LOGGLY_TOKEN=yourLogglyToken 
		--json \
		"*/2 * * * *" \
		https://raw.githubusercontent.com/solepano/auth0-logs-webtask/master/logsWebtask.js
```

You can see the log streaming of the webtask runs with:
```sh
$ wt logs
```

## Check logs in Loggly
![](https://raw.githubusercontent.com/solepano/auth0-logs-webtask/master/logglyScreenshot.png)

## Next steps
* Test passing 'checkpointId' and 'take' as query string params 
* Secure webtask run endpoint
* Add vaquire to versioned require of auth0 lib
