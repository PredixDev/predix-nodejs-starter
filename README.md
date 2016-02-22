Predix Development Kit Security Starter NodeJs Application
==========================================================

This is simple starter Node application that demonstrates user authentication with Predix UAA.

Refer to the predix-nodejs-starter to configure the UAA client.

## Running locally
Edit the config.json to run the application locally for your UAA client.

Sample :
```
"development":{
  "clientId": "${clientId}",
  "serverUrl" : "${UAA URL}",
  "base64ClientCredential": "${base 64 encoding of clientId:secret}",
  "appUrl": "http://localhost:3000",
  "windServiceUrl": "URL to the microservice"
}
```
*Note:* You can encode your clientId:secret combination using <https://www.base64encode.org/> or the base64 command on Unix / Mac OSX.

`echo -n clientId:clientSecret | base64`

#### Install and start local web server
```
npm install
node app.js or npm start
```
Navigate to <http://localhost:3000> in your web browser.

Debugging  
```
DEBUG=predix-boot-node-app:* npm start
DEBUG=express:* npm start
```
## Running in the cloud

Set up the manifest file for Cloud deployment

1. Copy manifest.yml.template to my-app-manifest.yml.
2. Edit the my-app-manifest.yml
  1. Replace ${UAA_service_instance} to the service instance name on the cloud foundry for predix UAA.
  2. Replace ${clientId} to the clientId configured on the UAA
  3. Replace ${base64ClientCredential} is the base 64 encoding of clientId:secret
  4. If integrating with Time series, then set the windServiceUrl to the URL of the deployed microservice

`cf push <appName> -f my-app-manifest.yml`
