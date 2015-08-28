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
