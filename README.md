# auth0-logs-webtask
Webtask script for pulling logs from Auth0 API and pushing them to a third party product.

## testing in local environment
You have to add a .env file in the root folder containing the following settings:
```sh
AUTH0_DOMAIN=yourauth0domain
AUTH0_CLIENT_ID=yourAuth0ClientId
AUTH0_CLIENT_SECRET=yourAuth0ClientSecret
LOGGLY_SUBDOMAIN=yourLogglySubdomain
LOGGLY_TOKEN=yourLogglyToken
LOGGLY_USERNAME=yourLogglyUsername
LOGGLY_PASSWORD=yourLogglyPassword
```
You can test the webtask code by runing 
```sh
$ mocha test
```
Or execute locally running
```sh
$ node index
```

## create as webtasks and execute with a secret

You first need to setup the [webtask-cli wt](https://webtask.io/cli):
```sh
$ npm i -g wt-cli
$ wt init
```
After that, you can create the webtask from a local file:

```sh
wt create logsWebtask.js \
        --name logs \
        --secret AUTH0_DOMAIN=yourauth0domain \
		--secret AUTH0_CLIENT_ID=yourAuth0ClientId \
		--secret AUTH0_CLIENT_SECRET=yourAuth0ClientSecret \
		--secret LOGGLY_SUBDOMAIN=yourLogglySubdomain \
		--secret LOGGLY_TOKEN=yourLogglyToken
```

or from a url:

```sh
wt create https://raw.githubusercontent.com/solepano/auth0-logs-webtask/master/logsWebtask.js \
        --name logs \
        --secret AUTH0_DOMAIN=yourauth0domain \
		--secret AUTH0_CLIENT_ID=yourAuth0ClientId \
		--secret AUTH0_CLIENT_SECRET=yourAuth0ClientSecret \
		--secret LOGGLY_SUBDOMAIN=yourLogglySubdomain \
		--secret LOGGLY_TOKEN=yourLogglyToken
```

And then execute with:
```sh
curl 'https://webtask.it.auth0.com/api/run/<tenant>/logs?webtask_no_cache=1'
```