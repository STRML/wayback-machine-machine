'use strict';
var http = require('http');
var log = require('./log').log;
var urlTools = require('url');

// Wayback machine query cache so we're not hammering it.
var cache = {};

module.exports = function DHTMLForTheNewMillennium(options, req, res, next) {
  // This is where we want to go via wayback
  var urlObj = urlTools.parse(req.url);

  // Get the cookie we set so we don't have to hammer the wayback api.
  var waybackCookie = req.cookies['wayback' + urlObj.host + options.date];
  // Don't send our users' cookies if they forget to use incognito
  delete req.headers.cookie;

  if (waybackCookie) {
    log("Found cookie:", waybackCookie);
    return cyberspace(options, waybackCookie, urlObj, res);
  } else {
    doWaybackQuery(urlObj, options, res);
  }
};

// Ask the wayback machine where the nearest cached page is.
function doWaybackQuery(urlObj, options, res) {
  // Get the uri of the nearest snapshot.
  var destURL = urlObj.host + urlObj.path;
  var checkURL = 'http://archive.org/wayback/available?url=' + destURL + '&timestamp=' + options.date;
  log(checkURL);
  queryURL(checkURL, function(err, response, body) {
    if (err) {
      res.send(500);
    }
    log(body);
    // Got the uri, load it and pipe to the response.
    try {
      var bodyObj = JSON.parse(body);
      var ts = bodyObj.archived_snapshots.closest.timestamp;
      var waybackURL = 'http://web.archive.org/web/' + ts + '/';
      cyberspace(options, waybackURL, urlObj, res);
    } catch(e) {
      res.send(404);
    }
  });
}

// Reach into cyberspace, get a page, and deliver it to the user.
function cyberspace(options, waybackURL, urlObj, res) {
  log("Engaging cyberspace:", waybackURL + JSON.stringify(urlObj));
  // This url is directly within archive.org and doesn't need the wayback url, just proxy it.
  if (/https?:\/\//.test(urlObj.path)) {
    log('local archive.org hit');
    return proxyRequest('http://web.archive.org' + urlObj.path, res);
  }
  // This url has to go through our saved wayback machine url.
  proxyRequest(waybackURL + urlObj.host + urlObj.path, res, function(response) {
    response.headers['set-cookie'] = 'wayback' + urlObj.host + options.date + '=' + waybackURL;
  });
}

//
// Helpers
//

// Send a query & cache the results.
function queryURL(url, cb) {
  if (cache[url]) return cb(null, null, cache[url]);
  http.get(url, function(response) {
    parseBody(response, function(body){
      cache[url] = body;
      cb(null, response, body);
    });
  })
  .on('error', function(err) {
    cb(err);
  });
}

// Simple proxy wrapper.
function proxyRequest(url, res, intercept) {
  http.get(url, function(response) {
    if (intercept) intercept(response);
    res.writeHead(response.statusCode, response.headers);
    response.pipe(res);
  })
  .on('error', function(err) {
    res.send(500);
  });
}

function parseBody(res, cb) {
  var body = '';
  res.on('data', function(chunk) {
    body += chunk;
  });
  res.on('end', function() {
    cb(body);
  });
}
