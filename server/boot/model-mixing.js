"use strict";
/**
 * @author Viet Nghiem<nghiem.van.viet@gmail.com>
 */

const debug = require("debug")("app:utils:mixing");
module.exports = function (app) {
  const mixingModels = [];
  mixingModels.forEach(name => {
    let Model = app.models[name];

    debug("mixingModels %s, %s", name, Model ? "YES" : "NO");

    Model.observe("before save", function beforeSave(ctx, next) {
      debug(
        "before save ctx.isNewInstance? %s",
        ctx.isNewInstance ? "YES" : "NO"
      );
      const token = ctx.options && ctx.options.accessToken;
      const updatedBy = token && token.userId;
      debug(
        "token", updatedBy
      );
      let data = ctx.instance || ctx.data;
      data.updated = new Date();
      if (updatedBy) {
        data.updatedBy = updatedBy;
      }
      next();
    });
  });
};
