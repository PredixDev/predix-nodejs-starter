var qs = require('querystring');
var url = require('url');
var rewriteModule = require('http-rewrite-middleware');
var request = require('request');
var session = require('express-session');

module.exports = {
  init: function (options) {
    options = options ;
    this.clientId = options.clientId ;
    this.serverUrl = options.serverUrl;
    this.defaultClientRoute = options.defaultClientRoute ;
    this.base64ClientCredential = options.base64ClientCredential ;
    this.user = null;
    this.callbackUrl = options.callbackUrl;
    this.appUrl = options.appUrl;
    return this.getMiddlewares();
  },
  getAccessTokenFromCode: function (authCode, successCallback, errorCallback) {
    var request = require('request');
    var self = this;
    var options = {
      method: 'POST',
      url: this.serverUrl + '/oauth/token',
      form: {
        'grant_type': 'authorization_code',
        'code': authCode,
        'redirect_uri': this.callbackUrl,
        'state': this.defautClientRoute
      },
      headers: {
        'Authorization': 'Basic ' + this.base64ClientCredential
      }
    };

    request(options, function (err, response, body) {
      if (!err && response.statusCode == 200) {
        var res = JSON.parse(body);
        var accessToken = res.token_type + ' ' + res.access_token;
        //console.log('the accessToken is '+accessToken);
        //get user info
        request({
          method: 'post',
          url: self.serverUrl + '/check_token',
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
            'Authorization': 'Basic ' + self.base64ClientCredential
          },
          form: {
            'token': res.access_token
          }
        }, function (error, response, body) {
          self.user = JSON.parse(body);
          successCallback(accessToken);
	});
      }
      else {
        errorCallback(body);
      }
    });
  },
  getMiddlewares: function () {
    //get access token here
    var middlewares = [];
    var uaa = this;
    //console.log(uaa.callbackUrl);
    var rewriteMiddleware = rewriteModule.getMiddleware([
        {
          from: '^/login(.*)$',
          to: uaa.serverUrl + '/oauth/authorize$1&response_type=code&scope=&client_id=' + uaa.clientId + '&redirect_uri='+encodeURIComponent(uaa.callbackUrl),
          redirect: 'permanent'
        },
        {
          from: '^/logout(.*)$',
          to: uaa.serverUrl + '/logout?&redirect='+encodeURIComponent(uaa.appUrl+'/removeSession?state=logout'),
          redirect: 'permanent'
        }
      ]
    );

    middlewares.push(function (req, res, next) {
      if (req.url.match('/callback')) {
        var params = url.parse(req.url, true).query;
        uaa.getAccessTokenFromCode(params.code, function (token) {
          //console.log('uaa access token: ', token);
          req.session.token = token;
          params.state = params.state || '/secure';
          var url = req._parsedUrl.pathname.replace("/callback", params.state);
          res.statusCode = 301;
          res.setHeader('Location', url);
          res.end();
        }, function (err) {
          //console.error('error getting access token: ', err);
          next(err);
        });
      }
      else {
        next();
      }
    });

    middlewares.push(rewriteMiddleware);

    return middlewares;
  },
  hasValidSession: function (req) {
    var sess=req.session;
    //console.log("Session token is "+sess.token);
    return !!sess.token;
  },
  getUserToken: function (req) {
    var sess=req.session;
    return sess.token;
  },
  deleteSession: function (req) {
    req.session.destroy();
  }
};
