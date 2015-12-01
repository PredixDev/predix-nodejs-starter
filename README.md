Predix Development Kit Security Starter NodeJs Application
==========================================================

Starter Node application that demonstrates the user authentication .

Refer to the pdk-security-starter to configure the UAA client.

## Running locally
```
Setting up the config.json to run locally

Edit the config.json file to add the configuration details for above generated client.
Sample :
"development":{
  "clientId": "${clientId}",
  "serverUrl" : "${UAA URL}",
  "base64ClientCredential": "${base 64 encoding of clientId:secret}",
  "appUrl": "http://localhost:3000"
}

Package and start
npm install
node node app.js or npm start

Debugging  
DEBUG=predix-boot-node-app:* npm start
DEBUG=express:* npm start
```

## Running in the cloud
```
Setting up the manifest for Cloud deployment
1. Copy manifest.yml.template to my-app-manifest.yml.
2. Edit the my-app-manifest.yml
  1. Replace ${UAA_service_instance} to the service instance name on the cloud foundry for predix UAA.
  2. Replace ${clientId} to the clientId configured on the UAA
  3. Replace ${base64ClientCredential} is the base 64 encoding of clientId:secret

cf push <appName> -f my-app-manifest.yml
```
