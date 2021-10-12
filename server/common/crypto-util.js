"use strict";
/**
 * author: Viet Nghiem
 */
const crypto = require('crypto');

const algorithm = 'aes-256-ctr';
const iv = crypto.randomBytes(16);

const encrypt = (text, secretKey) => {
    const cipher = crypto.createCipheriv(algorithm, secretKey, iv);

    const encrypted = Buffer.concat([cipher.update(text), cipher.final()]);

    return {
        iv: iv.toString('hex'),
        content: encrypted.toString('hex')
    };
};

const decrypt = (hash, secretKey) => {

    const decipher = crypto.createDecipheriv(algorithm, secretKey, Buffer.from(hash.iv, 'hex'));

    const decrpyted = Buffer.concat([decipher.update(Buffer.from(hash.content, 'hex')), decipher.final()]);

    return decrpyted.toString();
};

const MD5Sum = (text) => {
    return crypto.createHash('md5').update(text).digest('hex');
};
const SHASum = (text, secretKey) => {
    return crypto.createHmac('sha256', secretKey).update(text).digest('hex');
};

module.exports = {
    encrypt,
    decrypt,
    MD5Sum,
    SHASum
};