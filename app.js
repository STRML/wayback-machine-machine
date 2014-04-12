'use strict';
var args = require('yargs')
  .usage('Teleport your browser back in time.\nUsage: $0 [date] --port [num] --debug')
  .example('$0 2006-03-01', 'View the web as if it were March 1st, 2006')
  .default('port', '4080')
  .demand(1)
  .argv;

var date = args._[0].replace(/-/g, '');
var port = args.port;
var log = require('./lib/log').init(args.debug).log;

console.log("Running on port %s with date %s", port, date);

var proxyToWayback = require('./lib/proxy');
var http = require('http');
var express = require('express');
var app = express();

app.use(require('cookie-parser')());
app.use(proxyToWayback.bind(null, {date: date}));

app.on('error', function(err) {
  console.error("Unable to open port:", port);
});

app.listen(port);

