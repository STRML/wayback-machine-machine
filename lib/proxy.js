'use strict';
var request = require('request');
var log = require('./log').log;
var urlTools = require('url');

var cache = {};

module.exports = function DHTMLForTheNewMillennium(options, req, res, next) {
  // This is where we want to go via wayback
  var urlObj = urlTools.parse(req.url);

  // Don't send our users' cookies if they forget to use incognito
  var waybackCookie = req.cookies['wayback' + options.date];
  delete req.headers.cookie;

  if (waybackCookie) {
    console.log("Found cookie:", waybackCookie);
    return cyberspace(options, waybackCookie, urlObj, res);
  } else {
    doWaybackQuery(urlObj, options, res);
  }
};

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

function queryURL(url, cb) {
  if (cache[url]) return cb(null, null, cache[url]);
  request(url, function(err, response, body) {
    cache[url] = body;
    cb(err, response, body);
  });
}

function cyberspace(options, waybackURL, urlObj, res) {
  log("Engaging cyberspace:", waybackURL + JSON.stringify(urlObj));
  if (/https?:\/\//.test(urlObj.path)) {
    log('local archive.org hit');
    return request.get('http://web.archive.org' + urlObj.path).pipe(res);
  }
  request.get(waybackURL + urlObj.host + urlObj.path)
    .on('response', function(response){
      response.headers['set-cookie'] = 'wayback' + options.date + '=' + waybackURL;
      res.writeHead(response.statusCode, response.headers);
    }).pipe(res);
}
