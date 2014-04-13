Usage
=====

The proxy server has been started on port <port>.

You need to point your browser to this proxy server to travel 
back in time to <date>.

Be sure to use Incognito Mode / Private Browsing; while this project
does not steal your cookies, you should never trust a project like this
with your cookies unless you have read and understand the code.

CLI Options
-----------

```
Examples:
  node ./app --date 2006-03-01    View the web as if it were March 1st, 2006

Options:
  --port  [default: 4080]
  --date  [default: "2006-03-01"]
```

Proxy Server configuration
--------------------------

### Firefox

To configure the proxy server, navigate to:

Preferences -> Advanced -> Network -> Connection Settings

**Manual Proxy Configuration**: 

* HTTP Proxy: 127.0.0.1
* Port: <port>

### Other Browsers

Chrome, Safari, and IE use the system proxy settings. In all 
operating systems you can configure an HTTP proxy at 
127.0.0.1:<port> to access the wayback-machine-machine.


Notes
-----

If you liked this project and have feedback or bugs to report,
please contact me at sam@tixelated.com or on GitHub at
**github.com/STRML/wayback-machine-machine**

The proxy server is now running. Press CTRL-C to exit.
