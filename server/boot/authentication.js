'use strict';
/**
 * @author Viet Nghiem<nghiem.van.viet@gmail.com>
 */

module.exports = function enableAuthentication(server) {
  // enable authentication
  if (process.env.ENABLE_REST_AUTHEN === 'true') {
    server.enableAuth();
  }
};
