'use strict';
/**
 * author: Viet Nghiem
 */
const os = require('os');
const fs = require('fs');
const path = require('path');
const Busboy = require('busboy');
const uuidv4 = require('uuid/v4');
const TMPDIR = os.tmpdir();

const debug = require('debug')('app:utils:fstorage');

class FileUploader {
  upload(req, res) {
    let self = this;

    return new Promise((resolve, reject) => {

      let busboy = new Busboy({
        headers: req.headers
      });
      let promises = [];

      busboy.on('field', function (fieldname, value) {
        req.body[fieldname] = value;
      });

      busboy.on('file', function (fieldname, file, filename, encoding, mimetype) {
        console.log('file event', fieldname, filename, encoding, mimetype);
        promises.push(self.saveFile(filename, file, mimetype));
      });

      busboy.on('finish', function () {
        console.log('finish uploaded');
        Promise.all(promises).then((result) => {
          //console.log('upload:result', result)
          return resolve(result);
        }).catch(err => {
          //console.log('upload:err', err)
          return reject(err);
        });
      });

      req.pipe(busboy);
    });
  }

  saveFile(filename, file, mimetype) {
    debug('saveFile', filename, mimetype)
    return new Promise((resolve, reject) => {
      let uid = uuidv4().replace(/[-]+/gi, '');
      let ext = path.extname(filename) || '';
      let fname = uid + ext;

      let filePath = path.join(TMPDIR, fname);
      let writer = fs.createWriteStream(filePath);
      writer.on('close', (meta) => {
        debug('saveFile:close: writer is complete', filePath);
        //const hash = md5File.sync(filePath);
        resolve({
          'Key': fname,
          'Location': filePath,
          'mimetype': mimetype,
          'filename': filename,
          //'hash': hash
        });
      });
      writer.on('error', (err) => {
        debug('saveFile:error on write to file', filePath, err);
        reject(err);
      });

      file.on('data', function (data) {
        console.log('File data [' + filename + '] got ' + data.length + ' bytes');
      });
      file.on('end', function () {
        console.log('File end [' + filename + '] Finished');
      });
      file.pipe(writer);
    });
  }

};

module.exports = new FileUploader();

