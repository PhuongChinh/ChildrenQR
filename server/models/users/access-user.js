"use strict";

const debug = require("debug")("app:models:AccessUser");
//const ldap = require("vldap/ldap-ad");
const g = require("strong-globalize")();
const utils = require("../../common/utils");

const cryptoUtil = require('../../common/crypto-util');

const config = {
  jwtTTL: process.env.JWT_TTL || 3 * 60 * 60, //3 hour
};
module.exports = function (AccessUser) {

  let disableMethods = [
    "upsert", // disables PATCH /AccessUser
    // 'find',                                 // disables GET /AccessUser
    "replaceOrCreate", // disables PUT /AccessUser
    // 'create',                               // disables POST /AccessUser

    // 'prototype.updateAttributes',           // disables PATCH /AccessUser/{id}
    // 'findById',                             // disables GET /AccessUser/{id}
    "exists", // disables HEAD /AccessUser/{id}
    "replaceById", // disables PUT /AccessUser/{id}
    // 'deleteById',                           // disables DELETE /AccessUser/{id}

    "prototype.verify", // disable POST /AccessUser/{id}/verify
    // 'changePassword',                       // disable POST /AccessUser/change-password
    "createChangeStream", // disable GET and POST /AccessUser/change-stream

    "confirm", // disables GET /AccessUser/confirm
    // 'count',                                // disables GET /AccessUser/count
    "findOne", // disables GET /AccessUser/findOne

    "login", // disables POST /AccessUser/login
    //'logout',                               // disables POST /AccessUser/logout

    "resetPassword", // disables POST /AccessUser/reset
    "setPassword", // disables POST /AccessUser/reset-password
    "update", // disables POST /AccessUser/update
    "upsertWithWhere", // disables POST /AccessUser/upsertWithWhere
  ];
  utils.disableModelMethods(AccessUser, disableMethods);

  let disableRelationMethodsPrefix = [
    "prototype.__get__", // disable GET /AccessUser/{id}/accessTokens
    "prototype.__create__", // disable POST /AccessUser/{id}/accessTokens
    "prototype.__delete__", // disable DELETE /AccessUser/{id}/accessTokens

    "prototype.__findById__", // disable GET /AccessUser/{id}/accessTokens/{fk}
    "prototype.__updateById__", // disable PUT /AccessUser/{id}/accessTokens/{fk}
    "prototype.__destroyById__", // disable DELETE /AccessUser/{id}/accessTokens/{fk}

    "prototype.__count__", // disable  GET /AccessUser/{id}/accessTokens/count

    "prototype.__exists__", // disables HEAD
    "prototype.__link__", // disables PUT
    "prototype.__unlink__", // disables DELETE
  ];
  let disableRelations = ["roles", "accessTokens", "teachers", "students", "schoolParents", "studentParents"];
  utils.disableModelRelationMethods(
    AccessUser,
    disableRelations,
    disableRelationMethodsPrefix
  );

  AccessUser.setUserPassword = AccessUser.setPassword;

  AccessUser.observe("before save", function beforeSave(ctx, next) {
    debug(
      "before save ctx.isNewInstance? %s",
      ctx.isNewInstance ? "YES" : "NO"
    );
    let data = ctx.instance || ctx.data;
    data.updated = new Date();
    next();
  });
  AccessUser.observe("after save", function beforeSave(ctx, next) {
    //let data = ctx.instance || ctx.data;
    debug("after save ctx.isNewInstance? %s", ctx.isNewInstance ? "YES" : "NO");
    next();
  });

  AccessUser.beforeRemote("findById", function (ctx, unused, next) {
    // if (!ctx.args.filter || !ctx.args.filter.include) {
    //   ctx.args.filter = { include: "roles" };
    // }
    next();
  });
  AccessUser.beforeRemote("authen", function (ctx, user, next) {
    if (!(ctx.req.body.ttl || ctx.req.body.ttl === 0)) {
      ctx.req.body.ttl = config.jwtTTL;
    }
    next();
  });
  AccessUser.beforeRemote("refreshToken", function (ctx, user, next) {
    if (!(ctx.req.body.ttl || ctx.req.body.ttl === 0)) {
      ctx.req.body.ttl = config.jwtTTL;
    }
    next();
  });

  AccessUser.afterRemote("authen", function (ctx, user, next) {
    let userId;
    let accessToken;
    if (user && user.accessToken) {
      accessToken = user.accessToken.id;
      userId = user.id;
    } else if (user && user.userId) {
      accessToken = user.id;
      userId = user.userId;
    }
    if (accessToken) {
      ctx.res.cookie("access_token", "" + accessToken, {
        signed: ctx.req.signedCookies ? true : false,
        maxAge: config.jwtTTL * 1000,
      });
    }
    if (userId) {
      ctx.res.cookie("userId", "" + userId, {
        signed: ctx.req.signedCookies ? true : false,
        maxAge: config.jwtTTL * 1000,
      });
    }
    next();
  });
  AccessUser.afterRemote("logout", function (ctx, unused, next) {
    debug("Supporter.afterRemote logout");
    ctx.res.clearCookie("access_token");
    ctx.res.clearCookie("userId");
    next();
  });

  // AccessUser.afterRemote("findById", function (ctx, user, next) {
  //   if (user) {
  //     ctx.result = _roleFilter(user);
  //   }
  //   next();
  // });
  // AccessUser.afterRemote("find", function (ctx, users, next) {
  //   if (users) {
  //     ctx.result = _roleFilter(users);
  //   }
  //   next();
  // });

  AccessUser.logout = async (access_token, req, res) => {
    return {};
  }

  AccessUser.setAccessRole = async function (id, newRole, removeRole) {
    if (!id) {
      return {
        error: {
          message: "Invalid input parameters",
          code: "INVALID_PARAMETER",
        },
      };
    }
    let userIns = await AccessUser.findOne({ where: { id: id } });
    if (!userIns) {
      return {
        error: { message: "User is not found", code: "USER_NOT_FOUND" },
      };
    }
    if (!(newRole || removeRole)) {
      return userIns;
    }

    if (removeRole) {
      let result = await userIns.roles.destroyAll({ name: removeRole });
      debug("Role [%s] has been removed, %o", curRole, result);
    }
    if (newRole) {
      await AccessUser.assignRole2User(userIns, newRole);
    }

    let userUpdated = await AccessUser.findOne({ where: { id: id }, include: ["roles"] });
    if (!userUpdated) {
      return {
        error: { message: "User is not found", code: "USER_NOT_FOUND" },
      };
    }
    return userUpdated;
  };

  AccessUser.assignRole2User = async function (userData, roleName) {
    if (roleName && (userData.username || userData.email)) {
      let filter = { name: roleName };
      let role = await AccessUser.app.models.AccessRole.findOne({ where: filter });
      let user = await AccessUser.findOne({ where: { username: userData.username, email: userData.email } });

      debug("assignRole2User", role);
      debug("assignRole2User", user);
      if (role && role.name && user && user.username) {
        let principal = {
          principalType: AccessUser.app.models.AccRoleMapping.USER,
          principalId: user.id,
        };

        let found = await role.principals.findOne({ where: principal });
        if (found && found.principalId) {
          debug("Principal ID : %s exists", found.principalId);
          return;
        }
        let printResult = await role.principals.create(principal);
        debug("Created principal ID %s", printResult);
      } else {
        debug("ignore assignRole2User1", role, user);
      }
    } else {
      debug("ignore assignRole2User2", roleName, userData);
    }
  };

  AccessUser.addUser = async function (it) {
    if (it.username && it.email && it.password) {
      let result = await AccessUser.findOrCreate(
        { where: { or: [{ username: it.username }, { email: it.email }] } },
        it
      );

      debug("addUser", result);

      let iscreated = result[1];
      let ins = result[0];
      if (iscreated) {
        // continue
      } else if (ins && ins.id) {
        //await ins.updateAttributes(it);
        //User.setPassword(ins.id, 'pwd4you1')
      }
      return ins;
    } else {
      debug("ignore addUser", it);
    }

    return null;
  };

  AccessUser.addRole = async function (it) {
    if (it.name) {
      let filter = { name: it.name, group: it.group };
      let result = await AccessUser.app.models.AccessRole.findOrCreate({ where: filter }, it);

      debug("addRole", result);

      let iscreated = result[1];
      let ins = result[0];
      if (iscreated) {
        // continue
      } else if (ins && ins.id) {
        ins = await ins.updateAttributes(it);
      }
      return ins;
    } else {
      debug("ignore addRole", it);
    }
    return null;
  };

  AccessUser.sendMail = function (options, req, res) {
    if (!options.to) {
      return Promise.resolve({ code: 'fail', message: 'Invalid input ID' });
    }
    return new Promise((resolve, reject) => {
      const mailOption = {
        from: process.env.EMAIL_DEFAULT_FROM || "no-reply@vsi-international.com", // sender address
        to: options.to, // list of receivers
        cc: options.cc,
        subject: options.subject, // Subject line
        html: options.body,
        attachments: options.attachments,
      };
      debug(mailOption);

      AccessUser.app.models.Email.send(mailOption, function (error, info) {
        if (error) {
          // debug(error);
          debug(error);
          resolve({ code: 'fail', error });
        } else {
          debug("Email sent: " + mailOption.to);
          resolve({ code: 'success', message: "Email sent: " + mailOption.to });
        }
      });
    });
  };

  function __createTK(user, credentials) {
    return new Promise((resolve, reject) => {
      if (!user.activated) {
        debug("User is deactiveted");
        const dError = new Error(g.f("User is deactiveted"));
        dError.statusCode = 401;
        dError.code = "DEACTIVETED";
        reject(dError);
        return;
      }

      function tokenHandler(err, token) {
        if (err) {
          reject(err);
        } else {
          //debug(token)
          token.__data.user = user;

          resolve(token);
        }
      }

      if (user.createAccessToken.length === 2) {
        user.createAccessToken(credentials.ttl, tokenHandler);
      } else {
        user.createAccessToken(credentials.ttl, credentials, tokenHandler);
      }
    });
  }

  function createPromiseCallback() {
    let cb;
    const promise = new Promise(function (resolve, reject) {
      cb = function (err, data) {
        if (err) return reject(err);
        return resolve(data);
      };
    });
    cb.promise = promise;
    return cb;
  }

  // function ldapAuth(username, password, fn) {
  //   ldap.authenticate(username, password).then(
  //     function (user) {
  //       debug("ldap authenticate user", user);
  //       fn(null, user);
  //     },
  //     function (err) {
  //       debug("ldap authenticate err", err);
  //       const dError = new Error(g.f("Invalid credential"));
  //       dError.statusCode = 401;
  //       dError.code = "INVALID_CREDENTIAL";
  //       fn(dError);
  //     }
  //   );
  // }
  // 
  // function userSignLog(user, error) {
  //   let isSucc = (error == undefined || error == null) ? true : false;
  //   AccessUser.app.models.UserSignLog.create({
  //     username: user.username,
  //     activated: user.activated,
  //     success: isSucc,
  //     error: error,
  //     createdTime: new Date()
  //   });
  //   if (typeof user.updateAttributes == 'function') {
  //     let l = 1;
  //     if (user.loginFailedTimes) {
  //       l += user.loginFailedTimes;
  //     }
  //     let attrs = {
  //       lastLogin: new Date(),
  //       loginFailedTimes: (isSucc ? 0 : l)
  //     };
  //     user.updateAttributes(attrs);
  //   }
  // }

  AccessUser.authen = function (credentials, fn) {
    const self = this;

    fn = fn || createPromiseCallback();

    const query = {};
    let pEmail = credentials.email || credentials.username;
    if (pEmail) {
      if (pEmail.indexOf('@') > 0) {
        query.email = pEmail;
      } else {
        query.username = pEmail;
      }
    }

    if (!query.email && !query.username) {
      const err2 = new Error(g.f("{{username}} or {{email}} is required"));
      err2.statusCode = 400;
      err2.code = "USERNAME_EMAIL_REQUIRED";
      fn(err2);
      return fn.promise;
    }
    if (query.username && typeof query.username !== "string") {
      const err3 = new Error(g.f("Invalid username"));
      err3.statusCode = 400;
      err3.code = "INVALID_USERNAME";
      fn(err3);
      return fn.promise;
    } else if (query.email && typeof query.email !== "string") {
      const err4 = new Error(g.f("Invalid email"));
      err4.statusCode = 400;
      err4.code = "INVALID_EMAIL";
      fn(err4);
      return fn.promise;
    }

    self.findOne({ where: query, include: ["roles", "teachers", "students", "schoolParents", "studentParents"] }, function (err, user) {
      const defaultError = new Error(g.f("login failed"));
      defaultError.statusCode = 401;
      defaultError.code = "LOGIN_FAILED";

      if (err) {
        debug("An error is reported from User.findOne: %j", err);
        fn(defaultError);
      } else if (user) {
        user.hasPassword(credentials.password, async function (err, isMatch) {
          if (err) {
            debug("An error is reported from User.hasPassword: %j", err);
            fn(defaultError);
          } else if (isMatch) {
            if (self.settings.emailVerificationRequired && !user.emailVerified) {
              // Fail to log in if email verification is not done yet
              debug("User email has not been verified");
              err = new Error(
                g.f("login failed as the email has not been verified")
              );
              err.statusCode = 401;
              err.code = "LOGIN_FAILED_EMAIL_NOT_VERIFIED";
              err.details = {
                userId: user.id,
              };
              fn(err);
            } else {
              __createTK(user, credentials).then((tk) => {
                //userSignLog(user);
                fn(null, tk);
              }, (err) => {
                //userSignLog(user, err ? err.code : '');
                fn(err);
              });
            }
          } else {
            debug(
              "The local password is invalid for user %s",
              query.email || query.username
            );
            fn(defaultError);

            // let username = query.email || query.username;
            // let ie = username.indexOf("@");
            // if (ie > 0) {
            //   username = username.substring(0, ie);
            // }
            // debug("Doing ldap-auth for user %s", username);
            // ldapAuth(username, credentials.password, (lerr, luser) => {
            //   debug("resutl of ldap-auth for user %s, %o, %j", username, lerr, luser);
            //   if (lerr) {
            //     fn(lerr);
            //   } else {
            //     __createTK(user, credentials).then((tk) => {
            //       userSignLog(user);
            //       fn(null, tk);
            //     }, (err) => {
            //       userSignLog(user, err ? err.code : '');
            //       fn(err);
            //     });
            //   }
            // });
          }
        });
      } else {
        debug(
          "No matching record is found for user %s",
          query.email || query.username
        );
        fn(defaultError);
      }
    });
    return fn.promise;
  };

  AccessUser.refreshToken = async function (req, res) {
    let userId = (req.accessToken ? req.accessToken.userId : undefined);
    if (!userId) {
      const err1 = new Error(g.f("Have no permission!"));
      err1.statusCode = 401;
      err1.code = "ACCESS_DENIED";
      return (err1);
    }

    let filter = {
      where: { id: userId },
      include: ["roles", "teachers", "students", "schoolParents", "studentParents"]
    };
    let user = await AccessUser.findOne(filter);
    if (!user) {
      const err1 = new Error(g.f("User is NOT found"));
      err1.statusCode = 400;
      err1.code = "USER_NOT_FOUND";
      return (err1);
    }

    return __createTK(user, {});
  };

  AccessUser.remoteMethod("sendMail", {
    http: { path: "/sendMail", verb: "post" },
    accepts: [
      {
        arg: "credentials",
        type: "object",
        required: true,
        http: { source: "body" },
      },
      {
        arg: "req",
        type: "object",
        http: {
          source: "req",
        },
      },
      {
        arg: "res",
        type: "object",
        http: {
          source: "res",
        },
      },
    ],
    returns: {
      arg: "result",
      type: "object",
      root: true,
    },
    description: "Sends email using specified information",
  });

  AccessUser.remoteMethod("refreshToken", {
    http: { path: "/refreshToken", verb: "post" },
    accepts: [
      { arg: "req", type: "object", http: { source: "req" } },
      { arg: "res", type: "object", http: { source: "res" } },
    ],
    returns: {
      root: true,
      type: "object",
    },
    description: "Refresh the user token",
  });
  AccessUser.remoteMethod("logout", {
    http: { path: "/logout", verb: "get" },
    accepts: [
      {
        arg: "access_token",
        type: "string"
      },
      { arg: "req", type: "object", http: { source: "req" } },
      { arg: "res", type: "object", http: { source: "res" } },
    ],
    returns: {
      root: true,
      type: "object",
    },
    description: "Logout",
  });
};
