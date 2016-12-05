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
  "uaaUri" : "${UAA URL}",
  "base64ClientCredential": "${base 64 encoding of clientId:secret}",
  "appUrl": "http://localhost:3000",
  "assetZoneId": "${asset zone id for Asset service instantiated}",
  "tagname": "${tag name list to query. Separated by comma}",
  "assetURL": "${The asset url to query the tags from. https://<assetURI>/<assetType>}",
  "timeseries_zone": "${timeseries zone id for Timeseries service instantiated}",
  "timeseriesURL": "${Timeseries to query for data. <TimeseriesURI>/v1/datapoints}",
  "uaaURL": "${The UAA URI. <UaaURI>/predix.io",
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
```
---
applications:
- name: <front end app name>
  memory: 128M
  buildpack: nodejs_buildpack
  #command:  DEBUG=express:* node app.js
  command:  node app.js
services:
- <asset instance service name>
- <timeseries instance service name>
- <uaa instance service name>
env:
    node_env: cloud
    uaa_service_label : predix-uaa
    clientId: <client id with timeseries and asset scope>
    base64ClientCredential: <base64 encoding of client id>
    # Following properties configured only for Timeseries WindData service Integration
    assetMachine: <The asset name pushed to Asset service>
    tagname: <The asset tag pushed to Asset service>
```

`cf push <appName> -f my-app-manifest.yml`
