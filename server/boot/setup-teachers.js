"use strict";
/**
 * @author Viet Nghiem<nghiem.van.viet@gmail.com>
 */

const debug = require("debug")("app:setup:app-contact");
// const ObjectID = mongo.ObjectID;

const HAVE_TO_TEST_FIRST = false;

module.exports = function (app) {
  const Teacher = app.models.Teacher;


  let options = {
    code: 'TEST',
    name: 'tester',
    status: 'ACTIVATED',
    updatedBy: 'viet.nghiem'
  }

  const dJson = [
    {
      "code": options.code,
      "name": options.name,
      "phone": '1234567890',
      "email": "test1@gmail.com",
      "address": options.address,
      "status": options.status,
      "type": '1',
      "updatedBy": options.updatedBy,
    },
    {
      "code": options.code,
      "name": options.name,
      "phone": '1234567890',
      "email": "test2@gmail.com",
      "address": options.address,
      "status": options.status,
      "type": '1',
      "updatedBy": options.updatedBy,
    },
    {
      "code": options.code,
      "name": options.name,
      "phone": '1234567890',
      "email": "test3@gmail.com",
      "address": options.address,
      "status": options.status,
      "type": '1',
      "updatedBy": options.updatedBy,
    }
  ];

  let jsonItems = [];
  for (let i = 0; i < 3000; i++) {
    let r = Math.round(Math.random() * 100000) % dJson.length;
    let copy = JSON.parse(JSON.stringify(dJson[r]));
    let k = (i + 1);
    copy.code = `CODE-${k}`
    copy.name = `teacher-${k}`
    copy.email = `m-tester-${k}@com.vn`
    jsonItems.push(copy);
  }

  async function doInSeries() {
    debug("doInSeries--------------------------------------");
    await Teacher.destroyAll();
    await addSeries(jsonItems, addItem);
  }

  async function addSeries(items, fn) {
    if (!items || !items.length > 0) {
      return;
    }
    for (let it of items) {
      let r = await fn(it);
      debug('result %o', r);
    }
  }

  async function addItem(it) {
    return Teacher.addTeacher(it);
  }

  if (HAVE_TO_TEST_FIRST) {
    doInSeries();
  }
};
