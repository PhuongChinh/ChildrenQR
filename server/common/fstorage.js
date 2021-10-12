"use strict";
/**
 * author: Viet Nghiem
 */
const os = require("os");
const fs = require("fs");
const path = require("path");
const Busboy = require("busboy");
const uuidv4 = require("uuid/v4");
const md5File = require("md5-file");

//https://docs.aws.amazon.com/sdk-for-javascript/v2/developer-guide/s3-node-examples.html
const AWS = require("aws-sdk");
const S3Download = require("s3-download");

const debug = require("debug")("app:utils:fstorage");

const TMPDIR = os.tmpdir();

process.env.AWS_CLIENT_TIMEOUT = 360000;

const DEFAULT_OPT = {
  region: process.env.AWS_S3_REGION || "ap-southeast-1",
  Bucket: process.env.AWS_S3_BUCKET || "app-files",
  apiVersion: process.env.AWS_S3_API_VERSION || "2006-03-01",
  accessKeyId: process.env.AWS_S3_KEY_ID || "",
  secretAccessKey:
    process.env.AWS_S3_KEY_SECRET || "",
  "httpOptions ": {
    connectTimeout: process.env.AWS_CLIENT_TIMEOUT,
    timeout: process.env.AWS_CLIENT_TIMEOUT,
  },
};

class FUploader {
  _getS3Inst() {
    let s3 = new AWS.S3(DEFAULT_OPT);
    return s3;
  }
  setting() {
    this.defaultFolder = (process.env.AWS_S3_DEFAULT_FOLDER || "app");
    AWS.config.update(DEFAULT_OPT);
    //s3 = this._getS3Inst();
  }

  getFileKey(filename) {
    let fileKey = this.defaultFolder + "/" + path.basename(filename);
    return fileKey;
  }

  get(filename, res) {
    let fileKey = this.getFileKey(filename);
    return this.getByKey(fileKey, res);
  }

  getByKey(fileKey, res) {
    let bucketParams = {
      Bucket: DEFAULT_OPT.Bucket,
      Key: fileKey,
    };
    let maxSize = 50 * 1024 * 1024;
    let sessionParams = {
      maxPartSize: maxSize, //default 20MB
      concurrentStreams: 5, //default 5
      maxRetries: 3, //default 3
      totalObjectSize: maxSize, //required size of object being downloaded
    };

    let s3 = this._getS3Inst();
    let downloader = S3Download(s3);
    var d = downloader.download(bucketParams, sessionParams);
    d.on("error", function (err) {
      debug("getByKey", err);
    });
    // dat = size_of_part_downloaded
    d.on("part", function (dat) {
      debug("getByKey", dat);
    });
    d.on("downloaded", function (dat) {
      debug("getByKey", dat);
    });
    if (res) {
      d.pipe(res);
    }
    return d;
  }

  listObjects() {
    return new Promise((resolve, reject) => {
      let bucketParams = {
        Bucket: DEFAULT_OPT.Bucket,
      };

      let s3 = this._getS3Inst();
      s3.listObjects(bucketParams, function (err, data) {
        if (err) {
          debug("Error", err);
          reject(err);
        } else {
          debug("Success", data);
          resolve(data);
        }
      });
    });
  }

  listBuckets() {
    return new Promise((resolve, reject) => {
      let s3 = this._getS3Inst();
      s3.listBuckets(function (err, data) {
        if (err) {
          debug("Error", err);
          reject(err);
        } else {
          debug("Success", data.Buckets);
          resolve(data);
        }
      });
    });
  }

  deleteBucket() {
    return new Promise((resolve, reject) => {
      let bucketParams = {
        Bucket: DEFAULT_OPT.Bucket,
      };

      let s3 = this._getS3Inst();
      s3.deleteBucket(bucketParams, function (err, data) {
        if (err) {
          debug("Error", err);
          reject(err);
        } else {
          debug("Success", data);
          resolve(data);
        }
      });
    });
  }

  createBucket() {
    return new Promise((resolve, reject) => {
      let bucketParams = {
        Bucket: DEFAULT_OPT.Bucket,
        ACL: "public-read",
      };

      let s3 = this._getS3Inst();
      s3.createBucket(bucketParams, function (err, data) {
        if (err) {
          debug("Error", err);
          reject(err);
        } else {
          debug("Success", data);
          resolve(data);
        }
      });
    });
  }

  uploadS3(req, res) {
    return this.upload(true, req, res);
  }

  uploadTmp(req, res) {
    return this.upload(false, req, res);
  }

  upload(isAWS, req, res) {
    let self = this;

    return new Promise((resolve, reject) => {
      let busboy = new Busboy({
        headers: req.headers,
      });
      let promises = [];

      busboy.on("field", function (fieldname, value) {
        req.body[fieldname] = value;
      });

      busboy.on("file", function (
        fieldname,
        file,
        filename,
        encoding,
        mimetype
      ) {
        if (isAWS) {
          promises.push(self.saveFileS3(filename, file, mimetype));
        } else {
          promises.push(self.saveFile(filename, file, mimetype));
        }
      });

      busboy.on("finish", function () {
        debug("upload finish");
        Promise.all(promises)
          .then((result) => {
            //debug("result", result);
            return resolve(result);
          })
          .catch((err) => {
            debug('Error', err)
            return reject(err);
          });
      });

      req.pipe(busboy);
    });
  }

  saveFileS3(filename, file, mimetype) {
    debug("saveFileS3", filename, mimetype);
    return new Promise((resolve, reject) => {
      let uid = uuidv4().replace(/[-]+/gi, "");
      let ext = path.extname(filename) || "";
      let fname = uid + ext;
      let fileKey = this.getFileKey(fname);

      let upParams = {
        Bucket: DEFAULT_OPT.Bucket,
        Key: fileKey,
        Body: file,
      };

      // call S3 to retrieve upload file to specified bucket
      let s3 = this._getS3Inst();
      let upload = s3.upload(upParams);
      upload.on("httpUploadProgress", function (ev) {
        debug("Upload httpUploadProgress currentSize %0", ev);
        upload.__progress = ev;
      });

      upload.send(function (err, data) {
        debug("Upload send %o, %o", err, data);
        if (err) {
          debug("Error", err);
          reject(err);
          return;
        }
        if (!data || !data.Location) {
          debug("Error", data);
          reject(data);
          return;
        }
        debug("Upload Success", data.Location);
        if (upload.__progress && upload.__progress.total >= 0) {
          data.size = upload.__progress.total;
        }
        data.mimetype = mimetype;
        data.filename = filename;
        data.hash = String(data.ETag).replace(/[\"\'\s]+/g, "");
        resolve(data);
      });
    });
  }

  saveFile(filename, file, mimetype) {
    debug("saveFile", filename, mimetype);
    return new Promise((resolve, reject) => {
      let uid = uuidv4().replace(/[-]+/gi, "");
      let ext = path.extname(filename) || "";
      let fname = uid + ext;

      let filePath = path.join(TMPDIR, fname);
      let writer = fs.createWriteStream(filePath);
      writer.on("close", (meta) => {
        debug("saveFile:close: writer is complete", filePath);
        const hash = md5File.sync(filePath);
        resolve({
          Key: fname,
          Location: filePath,
          mimetype: mimetype,
          filename: filename,
          hash: hash,
        });
      });
      writer.on("error", (err) => {
        debug("saveFile:error on write to file", filePath, err);
        reject(err);
      });
      file.pipe(writer);
    });
  }

  removeTmp(f1) {
    if (f1 && f1.Location) {
      // setTimeout(() => {
      //remove temp file
      fs.unlink(f1.Location, err => {
        debug("unlink result", err, f1.Location);
      });
      // }, 2 * 60 * 1000);
    }
  }

  tupS3(options) {
    let inputStream = fs.createReadStream(options.Location);
    inputStream.on("error", function (err) {
      debug("File Uploading Error", err);
    });
    let filename = path.join(this.defaultFolder, options.Key);
    return this.post(filename, inputStream, options.mimetype);
  }

  tup(filePath) {
    let inputStream = fs.createReadStream(filePath);
    inputStream.on("error", function (err) {
      debug("File Uploading Error", err);
    });
    let filename = path.join(this.defaultFolder, path.basename(filePath));
    return this.post(filename, inputStream, "application/octet-stream");
  }

  tdown(filename) {
    let uid = uuidv4().replace(/[-]+/gi, "");
    let ext = path.extname(filename) || "";
    let fname = uid + ext;

    let filePath = path.join(TMPDIR, fname);
    var res = fs.createWriteStream(filePath);
    this.get(filename, res);
  }
}

module.exports = new FUploader();
module.exports.setting();
