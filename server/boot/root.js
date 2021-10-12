"use strict";
/**
 * @author Viet Nghiem<nghiem.van.viet@gmail.com>
 */
const path = require("path");
const CONF = require('../common/conf');

module.exports = function (app) {
  CONF.__padStart();
  // Install a `/` route that returns server status
  let router = app.loopback.Router();
  // User do refresh browser with angular route path, that need to redirect to index page
  router.get("/", function (req, res, next) {
    res.sendFile(path.resolve(__dirname, "../assets/index.html"));
  });

  app.use(router);

  // setTimeout(async () => {
  //   let ldapApi = new LdapApi();
  //   let result = await ldapApi.authenticate({ username: 'admin', password: 'pwd4you1' });
  //   console.log('authen result', result);
  // });
};
