"use strict";
/**
 * @author Viet Nghiem<nghiem.van.viet@gmail.com>
 */

const debug = require("debug")("app:setup:users");
const CONF = require('../common/conf');
const HAVE_TO_CLEAR_FIRST = false;

const HAVE_TO_TEST_FIRST = false;

module.exports = function (app) {
  const User = app.models.AccessUser;
  const Role = app.models.AccessRole;
  const AccRoleMapping = app.models.AccRoleMapping;
  const AccessToken = app.models.AccessToken;

  const usersJson = [
    {
      name: "Viet, Nghiem",
      username: process.env.ADMIN_NAME || "viet.nghiem",
      email: process.env.ADMIN_EMAIL || "nghiem.van.viet@gmail.com",
      created: new Date(),
      updated: new Date(),
      password: process.env.ADMIN_PWD || "pwd4you1",
      emailVerified: true
    },
    {
      name: "Demo1, System",
      username: process.env.ADMIN_NAME || "demo1",
      email: process.env.ADMIN_EMAIL || "demo1@gmail.com",
      created: new Date(),
      updated: new Date(),
      password: process.env.ADMIN_PWD || "Demo4y@u1",
      emailVerified: true
    }
  ];



  const rolesJson = [
    { name: "admin", description: "Administrator", "group": "system" },
    { name: "super", description: "Supervisor", "group": "system" },
    { name: "member", description: "Member", "group": "system" },
  ];

  if (HAVE_TO_CLEAR_FIRST) {
    AccRoleMapping.destroyAll();
    AccessToken.destroyAll();

    User.destroyAll(undefined, function (ee, r) {
      debug("User destroyAll %o  %o", ee, r);
    });
    Role.destroyAll();
  }

  if (HAVE_TO_TEST_FIRST) {
    doInSeries();
  }

  async function doInSeries() {
    debug("doInSeries--------------------------------------");
    let users = await addSeries(usersJson, addUser);
    if (users && users.length > 0) {
      let demo1 = users.find(u => u.username == 'demo1');
      let demo2 = users.find(u => u.username == 'viet.nghiem');
      await User.assignRole2User(demo2, 'admin');
      await User.assignRole2User(demo1, 'super');
    }
  }

  async function addSeries(items, fn) {
    let results = [];
    if (!items || !items.length > 0) {
      return;
    }
    for (let it of items) {
      results.push(await fn(it));
    }
    return results;
  }

  async function addUser(it) {
    return User.addUser(it);
  }

  async function addRole(it) {
    return User.addRole(it);
  }
};
