"use strict";
/**
 * @author Viet Nghiem<nghiem.van.viet@gmail.com>
 */

const debug = require("debug")("app:setup:app-master");
// const ObjectID = mongo.ObjectID;

const HAVE_TO_TEST_FIRST = false;

module.exports = function (app) {
  const Country = app.models.Country;
  const Province = app.models.Province;
  const District = app.models.District;
  const Ward = app.models.Ward;

  const countries = require('../data/country.csv.json');
  const provinces = require('../data/province.csv.json');
  const districts = require('../data/district.csv.json');
  const wards = require('../data/ward.csv.json');

  const cMap = {};
  const pMap = {};
  const dMap = {};

  async function doInSeries() {
    debug("doInSeries--------------------------------------");
    let c = await Country.findOne();
    if (c) {
      return;
    }
    await addSeries(countries, addCountry);
    await addSeries(provinces, addProvince);
    await addSeries(districts, addDistrict);
    await addSeries(wards, addWard);
  }

  async function addSeries(items, fn) {
    if (!items || !items.length > 0) {
      return;
    }
    for (let it of items) {
      let r = await fn(it);
      //debug('result %o', r);
    }
  }

  async function addCountry(it) {
    let c = await Country.create(it);
    cMap[c.cn] = JSON.parse(JSON.stringify(c));
  }

  async function addProvince(it) {
    let country = cMap[it.country];
    //delete it.country;
    if (country) {
      it.countryId = country.id;
      let c = await Province.create(it);
      pMap[c.name] = JSON.parse(JSON.stringify(c));
    } else {
      debug('addProvince country is not found', it);
    }
  }

  async function addDistrict(it) {
    let province = pMap[it.province];
    //delete it.province;
    if (province) {
      it.provinceId = province.id;
      let c = await District.create(it);
      dMap[c.name] = JSON.parse(JSON.stringify(c));
    } else {
      debug('addDistrict province is not found', it);
    }
  }

  async function addWard(it) {
    let district = dMap[it.district];
    //delete it.country;
    if (district) {
      it.districtId = district.id;
      let c = await Ward.create(it);
    } else {
      debug('addWard district is not found', it);
    }
  }

  if (HAVE_TO_TEST_FIRST) {
    doInSeries();
    debug('Done');
  }
};
