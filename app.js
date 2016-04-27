var express = require('express');
var path = require('path');

var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');

var index = require('./routes/index');
var secure = require('./routes/secure');
var auth = require('./routes/auth.js');
var session = require('express-session');
var expressProxy = require('express-http-proxy');
var proxyMiddleware = require('http-proxy-middleware');
var environmentVars = require('./config.json');
var url = require('url');
var HttpsProxyAgent = require('https-proxy-agent');

// Setting up express server
var app = express();

// Setting up express server port
var config = {
	express: {
		port: process.env.VCAP_APP_PORT || 3000
	}
};

// Setting up option for UAA
var clientId = '';
var uaaUri = '';
var applicationUrl = '';
var base64ClientCredential = '';
var windServiceUrl = '';

// Connected Device env variables
var assetTagname = '';
var assetURL = '';
var assetZoneId = '';
var timeseriesZone = '';
var timeseriesURL = '';
var uaaURL = '';
var isConnectedTimeseriesEnabled = false;
var isConnectedAssetEnabled = false;

// checking NODE_ENV to load cloud properties from VCAPS
// or development properties from config.json
var node_env = process.env.node_env || 'development';
if(node_env == 'development') {
	var devConfig = environmentVars[node_env];
	//console.log(devConfig);
	clientId = devConfig.clientId;
	uaaUri = devConfig.uaaUri;
	base64ClientCredential  = devConfig.base64ClientCredential;
	applicationUrl = devConfig.appUrl;
	windServiceUrl = devConfig.windServiceUrl;

	// Connected Device env variables
	assetTagname = devConfig.tagname;
	assetURL = devConfig.assetURL;
	assetZoneId = devConfig.assetZoneId;
	timeseriesZone = devConfig.timeseries_zone;
	timeseriesURL = devConfig.timeseriesURL;

} else {
	// read VCAP_SERVICES
	var vcapsServices = JSON.parse(process.env.VCAP_SERVICES);
	var uaaService = vcapsServices[process.env.uaa_service_label];
	var assetService = vcapsServices['predix-asset'];
	var timeseriesService = vcapsServices['predix-timeseries'];
	windServiceUrl = process.env.windServiceUrl;

	var uaaUri = '';

	if(uaaService) {
		//console.log('UAA service URL is  '+uaaService[0].credentials.uri)
		uaaUri = uaaService[0].credentials.uri;
	}

	if(assetService) {
		assetURL = assetService[0].credentials.uri + "/" + process.env.assetMachine;
		assetZoneId = assetService[0].credentials.zone["http-header-value"];
	}
	if(timeseriesService) {
		timeseriesZone = timeseriesService[0].credentials.query["zone-http-header-value"];
		timeseriesURL = timeseriesService[0].credentials.query.uri;
	}

	// read VCAP_APPLICATION
	var vcapsApplication = JSON.parse(process.env.VCAP_APPLICATION);
	applicationUrl = 'https://'+vcapsApplication.uris[0];
	//console.log('First applicationUrl is '+applicationUrl)

	// read env properties
	clientId = process.env.clientId;
	base64ClientCredential = process.env.base64ClientCredential;

	// Raspberry PI env variables
	assetTagname = process.env.tagname;
}

/* Setting the uaa Config used in the router auth.js*/

		var uaaConfig = {
			clientId: clientId,
			serverUrl : uaaUri,
	    defaultClientRoute : '/index.html',
	    base64ClientCredential: base64ClientCredential,
			callbackUrl: applicationUrl+'/callback',
			appUrl: applicationUrl
		};

		if (timeseriesURL != '') {
			isConnectedTimeseriesEnabled = true;
		}

		if (assetURL != '' ) {
			isConnectedAssetEnabled = true;
		}

		var connectedDeviceConfig = {
			assetTagname : assetTagname,
			assetURL : assetURL,
			assetZoneId : assetZoneId,
			timeseriesZone : timeseriesZone,
			timeseriesURL : timeseriesURL,
			uaaURL : uaaUri,
			uaaClientId: clientId,
			uaaBase64ClientCredential: base64ClientCredential,
			isConnectedTimeseriesEnabled: isConnectedTimeseriesEnabled,
			isConnectedAssetEnabled: isConnectedAssetEnabled
		};

		console.log('************'+node_env+'******************');
		console.log('uaaConfig.clientId = ' +uaaConfig.clientId );
		console.log('uaaConfig.serverUrl = ' +uaaConfig.serverUrl );
		console.log('uaaConfig.defaultClientRoute = ' +uaaConfig.defaultClientRoute );
		console.log('uaaConfig.base64ClientCredential = ' +uaaConfig.base64ClientCredential );
		console.log('uaaConfig.callbackUrl = ' +uaaConfig.callbackUrl );
		console.log('uaaConfig.appUrl = ' +uaaConfig.appUrl );
		console.log('windServiceUrl = ' +windServiceUrl );
		console.log('raspberryPiConfig.assetTagname = ' +connectedDeviceConfig.assetTagname );
		console.log('raspberryPiConfig.assetURL = ' +connectedDeviceConfig.assetURL );
		console.log('raspberryPiConfig.assetZoneId = ' +connectedDeviceConfig.assetZoneId );
		console.log('raspberryPiConfig.timeseriesZone = ' +connectedDeviceConfig.timeseriesZone );
		console.log('raspberryPiConfig.timeseriesURL = ' +connectedDeviceConfig.timeseriesURL );
		console.log('raspberryPiConfig.uaaURL = ' +connectedDeviceConfig.uaaURL );
		console.log('***************************');

		//app.configure(function() {
			app.set('connectedDeviceConfig', connectedDeviceConfig);
		//});


		var server = app.listen(config.express.port, function () {
  	var host = server.address().address;
  	var port = server.address().port;
		console.log ('Server Started at ' + uaaConfig.appUrl);
});

//Initializing application modules
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());

// Initializing default session store
// *** this session store in only development use redis for prod **
app.use(session({
	secret: 'predixsample',
	name: 'cookie_name',
	proxy: true,
	resave: true,
	saveUninitialized: true}));

//Initializing auth.js modules with UAA configurations
app.use(auth.init(uaaConfig));

app.get('/favicon.ico', function (req, res) {
  res.send('favicon.ico');
});
//Setting up the proxy for calling the windService microservice from the client
//Since the headers needs to be modified with Authorization header
//and content-type
if(windServiceUrl) {
	var corporateProxyServer = process.env.http_proxy || process.env.HTTP_PROXY;
	var apiProxyContext = '/api';
	var apiProxyOptions = {
		target:windServiceUrl,
		changeOrigin:true,
		logLevel: 'debug',
		pathRewrite: { '^/api/services/windservices': '/services/windservices'},
		onProxyReq: function onProxyReq(proxyReq, req, res) {
			req.headers['Authorization'] = auth.getUserToken(req);
			req.headers['Content-Type'] = 'application/json';
			//console.log('Request headers: ' + JSON.stringify(req.headers));
		}
	};
	if (corporateProxyServer) {
		apiProxyOptions.agent = new HttpsProxyAgent(corporateProxyServer);
	}

	app.use(proxyMiddleware(apiProxyContext,apiProxyOptions));
}

app.use(express.static(path.join(__dirname, 'public')));

// callback endpoint to removeSession
app.get('/removeSession', function (req, res ,next) {
	auth.deleteSession(req);
	res.redirect("/");
});

//Setting routes
app.use('/', index);
app.use('/secure', secure);

function getWindServiceUrl(req) {
	console.log('WindService URL from configuration: '+windServiceUrl);
  return windServiceUrl;
}

// using express-http-proxy, we can pass in a function to get the target URL for dynamic proxying:
app.use('/api', expressProxy(getWindServiceUrl, {
		https: true,
		forwardPath: function (req) {
			//  console.log("Forwarding request: " + req.url);
			  var forwardPath = url.parse(req.url).path;
		  //  console.log("forwardPath returns; " + forwardPath);
			  return forwardPath;
		},
  decorateRequest: function(req) {
       req.headers['Content-Type'] = 'application/json';
	     return req;
  }
	}
));

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  var err = new Error('Not Found');
  err.status = 404;
  next(err);
});

// error handlers

// development error handler
// will print stacktrace
if (app.get('env') === 'development') {
	app.use(function(err, req, res, next) {
		if (!res.headersSent) {
	    res.status(err.status || 500);
	    res.send({
	      message: err.message,
	      error: err
	    });
		}
	});
}

// production error handler
// no stacktraces leaked to user
app.use(function(err, req, res, next) {
	if (!res.headersSent) {
	  res.status(err.status || 500);
	  res.send({
	    message: err.message,
	    error: {}
	  });
	}
});

module.exports = app;
