'use strict';
/**
 * @author Viet Nghiem<nghiem.van.viet@gmail.com>
 */

const debug = require('debug')('app:utils:database');

module.exports = function (app) {

  app.execSQL = function () {//ds, statement, params
    let args = arguments;
    return new Promise(function (resolve, reject) {
      if (args.length < 3) {
        reject({ 'error': { 'message': 'invalid query' } });
        return;
      }
      let ds = args[0];
      let st = args[1];
      let params = Array.prototype.slice.call(args, 2);
      ds.connector.execute(st, params, function done(err, resp) {
        if (err) {
          if (err.error && err.error.message) {
            err.error.code = 'SERVER_ISSUE';
            reject(err);
            return;
          }
          reject({ 'error': { 'message': 'System issue while connecting with DB, please try agian later', 'detail': err, 'code': 'SERVER_ISSUE' } });
          return;
        }
        resolve(resp);
      });
    });
  };

  app.execLSQL = function () {//model, function, params
    let args = arguments;
    return new Promise(function (resolve, reject) {
      if (args.length < 3) {
        reject({ 'error': { 'message': 'invalid query' } });
        return;
      }
      let model = args[0];
      let fn = args[1];
      let params = Array.prototype.slice.call(args, 2);
      params.push(function done(err, resp) {
        if (err) {
          if (err.error && err.error.message) {
            err.error.code = 'SERVER_ISSUE';
            reject(err);
            return;
          }
          reject({ 'error': { 'message': 'System issue while connecting with DB, please try agian later', 'detail': err, 'code': 'SERVER_ISSUE' } });
          return;
        }
        resolve(resp);
      });
      model[fn].apply(model, params);
    });
  };


  app.getBetweenDates = function (fieldName, val) {
    let sd = new Date(val);
    sd.setHours(0);
    sd.setMinutes(0);
    sd.setSeconds(0);
    sd.setMilliseconds(0);
    let ed = new Date(val);
    ed.setHours(23);
    ed.setMinutes(59);
    ed.setSeconds(59);
    ed.setMilliseconds(999);
    let obj = {};
    obj[fieldName] = { 'between': [sd, ed] }
    return obj;
  };

  app.isValidNumber = function (numString) {
    return (numString == parseFloat(numString)) ? true : false;
  };

  app.isValidDate = function (dateString) {
    if (app.isValidNumber(dateString)) {
      return false;
    }
    if (typeof dateString === 'object' && typeof dateString.getTime === 'function') {
      return true;
    }
    let d = new Date(dateString);
    return (d !== "Invalid Date") && !isNaN(d) ? true : false;
  };

  app.RUN_ID_MAX_VALUE = 99999;
  app.RUN_ID_SIZE = 5;

  app.toRunNumString = function _toRunIDString(id, size) {
    if (id > app.RUN_ID_MAX_VALUE) {
      return id.toString();
    }
    if (id <= 0) {
      id = 0;
    }
    let idString = id.toString().padStart(size || app.RUN_ID_SIZE, 0);
    return idString;
  };

  if (!String.prototype.padStart) {
    String.prototype.padStart = function padStart(targetLength, padString) {
      targetLength = targetLength >> 0; //truncate if number, or convert non-number to 0;
      padString = String(typeof padString !== 'undefined' ? padString : ' ');
      if (this.length >= targetLength) {
        return String(this);
      } else {
        targetLength = targetLength - this.length;
        if (targetLength > padString.length) {
          padString += padString.repeat(targetLength / padString.length); //append to original to ensure we are longer than needed
        }
        return padString.slice(0, targetLength) + String(this);
      }
    };
  };
};



