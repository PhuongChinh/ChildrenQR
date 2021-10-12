"use strict";
/**
 * @author Viet Nghiem<nghiem.van.viet@gmail.com>
 */

const debug = require("debug")("app:setup:app-contact");
// const ObjectID = mongo.ObjectID;

const HAVE_TO_TEST_FIRST = false;

module.exports = function (app) {
  const AppContact = app.models.AppContact;

  let options = {
    code: 'TEST',
    name: 'tester',
    remarks: 'test now!',
    updatedBy: 'viet.nghiem'
  }
  const dJson = [
    {
      "code": options.code,
      "name": options.name,
      "phoneNum": '1234567890',
      "email": "test1@gmail.com",
      "address": options.address,
      "message": "Access Google Cloud SQL easily from almost any application on Google Cloud. Sign up now. Cloud SQL offers per-second billing and database instances are easy to stop and start. Deploy at Google scale. Get the support you need. Tailored to your business. Massive scale.",
      "status": options.status,
      "remarks": options.remarks,
      "updatedBy": options.updatedBy,
    },
    {
      "code": options.code,
      "name": options.name,
      "phoneNum": '1234567890',
      "email": "test2@gmail.com",
      "address": options.address,
      "message": "Learn How Automation Can Streamline Your Ops. Start Saving Time and Money Today. How Much Faster Could You Work if Your Database was Easy to Use, and Easy to Change?",
      "status": options.status,
      "remarks": options.remarks,
      "updatedBy": options.updatedBy,
    },
    {
      "code": options.code,
      "name": options.name,
      "phoneNum": '1234567890',
      "email": "test3@gmail.com",
      "address": options.address,
      "message": "To drop the associated users, run the dropAllUsersFromDatabase command in the database you are deleting. Indexes¶. Starting in MongoDB 4.4, the db.",
      "status": options.status,
      "remarks": options.remarks,
      "updatedBy": options.updatedBy,
    }
  ];

  let jsonItems = [];
  for (let i = 0; i < 100; i++) {
    let r = Math.round(Math.random() * 100000) % dJson.length;
    let copy = JSON.parse(JSON.stringify(dJson[r]));
    let k = (i + 1);
    copy.code = `CODE-${k}`
    copy.name = `messager-${k}`
    copy.email = `m-tester-${k}@tes.com`
    jsonItems.push(copy);
  }

  async function doInSeries() {
    debug("doInSeries--------------------------------------");
    await AppContact.destroyAll();
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
    return AppContact.addContact(it);
  }

  if (HAVE_TO_TEST_FIRST) {
    doInSeries();
  }
};
