"use strict";
/**
 * @author Viet Nghiem<nghiem.van.viet@gmail.com>
 */

let path = require("path");
const Debug = require("debug");
const debug = Debug("app:server");

if (process.env.NODE_ENV == "production") {
  require("dotenv").config({
    silent: false,
    path: path.join(__dirname, "../env.production.properties")
  });
}
if (process.env.NODE_ENV == "stage") {
  require("dotenv").config({
    silent: false,
    path: path.join(__dirname, "../env.stage.properties")
  });
}
require("dotenv").config({
  silent: false,
  path: path.join(__dirname, "../env.properties")
});
if (process.env.LOGS_SIGN) {
  Debug.enable(process.env.LOGS_SIGN || "app:*");
}

let loopback = require('loopback');
let boot = require('loopback-boot');
let bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');

let app = (module.exports = loopback());
// configure view handler
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));
// configure body parser
// parser cookies
app.use(cookieParser(app.get('cookieSecret')));
// parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: true }));
// parse application/json
app.use(bodyParser.json());
// parse access token
app.use(loopback.token());

app.start = function () {
  // start the web server
  return app.listen(function () {
    app.emit("started");
    let baseUrl = app.get("url").replace(/\/$/, "");
    debug("Web server listening at: %s", baseUrl);
    if (app.get("loopback-component-explorer")) {
      let explorerPath = app.get("loopback-component-explorer").mountPath;
      debug("Browse your REST API at %s%s", baseUrl, explorerPath);
    }
  });
};

// Bootstrap the application, configure models, datasources and middleware.
// Sub-apps like REST API are mounted via boot scripts.
boot(app, __dirname, function (err) {
  if (err) throw err;

  // start the server if `$ node server.js`
  if (require.main === module) {
    app.io = require("socket.io")(app.start(), {
      path: "/sdb/api/v1/socket.io"
    });

    app.io.on("connection", function (socket) {
      console.log("a user connected");

      socket.on("disconnect", function () {
        console.log("user disconnected");
      });
      socket.on("new-message", message => {
        console.log(message);
      });
    });
  }
});

// process.on('uncaughtException', function(err) {
//   debug('Exception at: %s, %s', (new Date().toUTCString()), err.message);
//   debug('Error Stack: %o', err.stack);
// });
