var assert = require('chai').assert;
var expressApp = require('../server/app.js');
var devConfig = require('../server/localConfig.json');

describe('Server initialization', function() {
	it('sets device config from localConfig.json, when in development mode', function() {
		var appConfig = expressApp.get('connectedDeviceConfig');
		// assert.equal(appConfig.assetTagname, devConfig.development.tagname);
		assert.equal(appConfig.assetURL, devConfig.development.assetURL);
		assert.equal(appConfig.assetZoneId, devConfig.development.assetZoneId);
		assert.equal(appConfig.timeseriesZone, devConfig.development.timeseries_zone);
		assert.equal(appConfig.timeseriesURL, devConfig.development.timeseriesURL);
		assert.equal(appConfig.uaaURL, devConfig.development.uaaURL);
		assert.equal(appConfig.uaaClientId, devConfig.development.clientId);
		assert.equal(appConfig.uaaBase64ClientCredential, devConfig.development.base64ClientCredential);
	});
});
