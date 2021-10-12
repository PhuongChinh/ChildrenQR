"use strict";
/**
 * author: Viet Nghiem
 */
const debug = require("debug")("app:common:sa-conf");
const archiver = require('archiver');
const cryptoUtil = require('./crypto-util');

const FStorage = require("../common/fstorage");

function __padStart() {
  if (!String.prototype.padStart) {
    String.prototype.padStart = function padStart(targetLength, padString) {
      targetLength = targetLength >> 0 //truncate if number, or convert non-number to 0
      padString = String(typeof padString !== 'undefined' ? padString : ' ')
      if (this.length >= targetLength) {
        return String(this)
      } else {
        targetLength = targetLength - this.length
        if (targetLength > padString.length) {
          padString += padString.repeat(targetLength / padString.length) //append to original to ensure we are longer than needed
        }
        return padString.slice(0, targetLength) + String(this)
      }
    }
  }
}

const __extUtils = {
  getZip(docs, outputStream) {
    var archive = archiver('zip', {
      zlib: { level: 9 }
    });
    archive.on('warning', function (err) {
      if (err.code === 'ENOENT') {
        // log warning
        debug('getZip:archive:warning %o', err);
      } else {
        // throw error
        debug('getZip:archive:error %o', err);
        //throw err;
      }
    });
    archive.on('error', function (err) {
      debug('getZip:archive:error %o', err);
      //throw err;
    });
    archive.pipe(outputStream);

    docs.forEach(doc => {
      if (doc && doc.key) {
        let outfile = FStorage.getByKey(doc.key);
        archive.append(outfile, { 'name': doc.docName });
      } else {
        debug('getZip:Unknown document %j', doc);
      }
    });

    archive.finalize();
  },

  fmDateString(d) {
    let d1 = new Date(d);
    let options = { year: "numeric", month: "short", day: "numeric" };
    let srcTime = d1.toLocaleDateString("en-US", options);
    let d2 = srcTime.split(/[\s\,\-\/]+/);
    return d2[1] + '-' + d2[0] + '-' + d2[2];
  },

  fmString(d) {
    if (d == '' || d == null || d == undefined || d == 'undefined') {
      return '';
    }
    if (d == parseFloat(d)) {
      return String(d);
    }
    if (typeof d == 'boolean') {
      return d ? 'Yes' : 'No';
    }
    return String(d).trim();
  },

  __padStart() {
    return __padStart();
  },

  filenaminfy: (filename) => {
    return filename
      .replace(/[\#\^\*\`\;\:\'\"\,\/\|\\]+/g, "~")
      .replace(/[\~]+/g, "~")
      .replace(/[\-]+/g, "-")
      .replace(/[\_]+/g, "_");
  },

  randomString: (len) => {
    let size = len || 32;
    let text = "";
    let possible =
      "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";

    for (let i = 0; i < size; i++) {
      text += possible.charAt(Math.floor(Math.random() * possible.length));
    }
    return text;
  },


  getMD5Sum(keys) {
    let text = JSON.stringify(keys);
    return cryptoUtil.MD5Sum(text);
  },
  getSHAHash(text, secret) {
    return cryptoUtil.SHASum(text, secret);
  }
}
module.exports = Object.assign({}, __extUtils);
