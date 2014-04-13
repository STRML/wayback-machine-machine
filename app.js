'use strict';
var args = require('yargs')
  .usage('Teleport your browser back in time.\nUsage: $0 [date] --port [num] --debug')
  .example('$0 --date 2006-03-01', 'View the web as if it were March 1st, 2006')
  .default('port', '4080')
  .default('date', '2006-03-01')
  .argv;

// Get options
var date = args.date;
var port = args.port;
var log = require('./lib/log').init(args.debug).log;

// Print banner & Usage
var ascli = require('ascli').app(require('./package').name.replace(/-/g, '  '));
ascli.banner(ascli.appName.rainbow.bold);
var msee = require('msee');
var usage = msee.parseFile(process.cwd() + '/USAGE.md');
console.log(usage.replace(/<port>/g, port).replace(/<date>/g, new Date(date).toLocaleDateString()));

// Start local proxy server.
var proxyToWayback = require('./lib/proxy');
var http = require('http');
var express = require('express');
var app = express();

app.use(require('cookie-parser')());
app.use(proxyToWayback.bind(null, {date: date.replace(/-/g, '')}));

app.on('error', function(err) {
  console.error("Unable to open port:", port);
});

app.listen(port);

