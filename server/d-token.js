'use strict';

const fs = require('fs');
const path = require('path');
const jwt = require('jsonwebtoken');

const privateKey = 'certs/rsa-app-key.pem';
const publicKey = 'certs/rsa-app-pub.pem';
const issuer = 'MY-APP';
const subject = 'Viet Nghiem - GDC<nghiem.van.viet@gmail.com>';
const audience = 'https://WWW.MY-APP.COM.VN/TEST';
const expiresIn = '12h';
const algorithm = 'RS256';

class DToken {
  constructor() {
    this.certs = {
      'key': fs.readFileSync(path.resolve(__dirname, privateKey), 'utf8'),
      'pub': fs.readFileSync(path.resolve(__dirname, publicKey), 'utf8')
    };

    this.signOption = {
      'issuer': issuer,
      'subject': subject,
      'audience': audience,
      'expiresIn': expiresIn,
      'algorithm': algorithm
    };

    this.verifyOption = {
      'issuer': issuer,
      'subject': subject,
      'audience': audience,
      'expiresIn': expiresIn,
      'algorithm': [algorithm]
    };
  }

  sign(payload, expiresIn) {
    let key = this.certs.key;
    let option = Object.assign({}, this.signOption, {
      'expiresIn': expiresIn
    });
    let token = jwt.sign(payload, key, option);
    return token;
  }

  verify(token, pub) {
    let key = pub || this.certs.pub;
    let option = Object.assign({}, this.verifyOption);
    let payload = jwt.verify(token, key, option);
    return payload;
  }

  decode(token, pub) {
    let key = pub || this.certs.pub;
    let option = Object.assign({ 'complete': true }, this.verifyOption);
    let payload = jwt.decode(token, key, option);
    return payload;
  }
}

module.exports = new DToken();