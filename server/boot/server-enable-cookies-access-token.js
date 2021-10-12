'use strict';
/**
 * @author Viet Nghiem<nghiem.van.viet@gmail.com>
 */

const debug = require('debug')('app:server:cookies-access');
const cookieParser = require('cookie-parser');
const session = require('express-session');

module.exports = function (app) {

  // Enable the use of access tokens to identify users.
  app.middleware('auth', app.loopback.token({
    model: app.models.accessToken
  }));
  // Enable to the use of cookie based sessions.
  app.middleware('session:before', cookieParser(app.get('cookieSecret')));
  app.middleware('session', session({
    secret: 'IjoiVEVTLUFNTSIsIqdfgjkuOUCVBS345tIC0gR0RDPG5gdlkrd()#$CFVBN',
    saveUninitialized: true,
    resave: true,
    /*
    cookie: {
      secure: true,
        httpOnly: true,
        domain: 'example.com',
      path: '/',
      expires: 0
    }*/
  }));

};
