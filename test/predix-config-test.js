/* eslint-env mocha */

var assert = require('chai').assert;
var predixConfig = require('../server/predix-config.js');

describe('predix-config initialization in development mode', function() {
	var devConfig = require('../server/localConfig.json').development;
	it('loads values from localConfig.json', function() {
		assert.equal(predixConfig.assetURL, devConfig.assetURL);
		assert.equal(predixConfig.assetZoneId, devConfig.assetZoneId);
		assert.equal(predixConfig.timeseriesZoneId, devConfig.timeseriesZoneId);
		assert.equal(predixConfig.timeseriesURL, devConfig.timeseriesURL);
		assert.equal(predixConfig.uaaURL, devConfig.uaaURL);
		assert.equal(predixConfig.clientId, devConfig.clientId);
		assert.equal(predixConfig.base64ClientCredential, devConfig.base64ClientCredential);
		assert.equal(predixConfig.appURL, devConfig.appURL);
	});

	describe('builds a VCAP object from localConfig', function() {
		var vcap = predixConfig.buildVcapObjectFromLocalConfig(devConfig);

		it('with UAA info', function() {
			assert.equal(vcap['predix-uaa'][0].credentials.uri, devConfig.uaaURL);
		});

		it('with asset info', function() {
			assert.equal(vcap['predix-asset'][0].credentials.uri, devConfig.assetURL);
			assert.equal(vcap['predix-asset'][0].credentials.zone['http-header-value'], devConfig.assetZoneId);
		});

		it('with time series info', function() {
			assert.equal(vcap['predix-timeseries'][0].credentials.query.uri, devConfig.timeseriesURL);
			assert.equal(vcap['predix-timeseries'][0].credentials.query['zone-http-header-value'], devConfig.timeseriesZoneId);
		});
	});
});
