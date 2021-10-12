/** csv file
a,b,c
1,2,3
4,5,6
*/

const csv = require('csvtojson');
const fs = require('fs');
const debug = require("debug")("app:init-data");

const ROOT_DIR = 'server/data/';

const list = [
    ROOT_DIR + 'country.csv',
    ROOT_DIR + 'province.csv',
    ROOT_DIR + 'district.csv',
    ROOT_DIR + 'ward.csv'
];

function saveF(filePath, textContent) {
    debug('saveF', filePath)
    fs.writeFile(filePath, textContent, function (err) {
        if (err) throw err;
        debug('Saved!', filePath);
    });
}

function csvF(filePath) {
    debug('csvF', filePath)
    csv()
        .fromFile(filePath)
        .then((jsonObj) => {
            debug(jsonObj);
            saveF(filePath + '.json', JSON.stringify(jsonObj));
        })
}

list.forEach(fp => {
    csvF(fp);
});



