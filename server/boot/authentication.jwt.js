'use strict';
/**
 * @author Viet Nghiem<nghiem.van.viet@gmail.com>
 */

const jwt = require('jsonwebtoken');
const config = {
  jwtKey: process.env.JWT_KEY,
  jwtTTL: process.env.JWT_TTL || 60 * 60 //1 hour
};

module.exports = function enableAuthentication(app) {

  const User = app.models.AccessUser;
  const AccessToken = app.models.AccessToken;

  const ENABLE_REST_AUTHEN_JWT = false;

  if (ENABLE_REST_AUTHEN_JWT) {
    User.prototype.createAccessToken = function (ttl, cb) {
      const userSettings = this.constructor.settings;
      const expiresIn = Math.min(ttl || config.jwtTTL || userSettings.ttl, userSettings.maxTTL);
      const accessToken = jwt.sign({ id: this.id }, config.jwtKey, { expiresIn });
      const created = new Date().getTime();
      return cb ? cb(null, Object.assign(this, {
        'accessToken': {
          'id': accessToken,
          'ttl': expiresIn,
          'created': created
        }
      })) : {
        'id': accessToken,
        'ttl': expiresIn,
        'created': created
      };
    };

    // User.logout = function(tokenId, fn) {
    //   // You may want to implement JWT blacklist here
    // };

    AccessToken.resolve = function (id, cb) {
      if (id) {
        try {
          const data = jwt.verify(id, config.jwtKey);
          cb(null, { userId: data.id });
        } catch (err) {
          // Should override the error to 401
          cb(err);
        }
      } else {
        cb();
      }
    };
  }
};

