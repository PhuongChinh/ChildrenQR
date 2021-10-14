'use strict';
const constants = require("../../constants");

module.exports = function (QRCode) {
    //create many QR Code
    QRCode.createManyQRCode = async (options, req) => {
        if (!options || !options.numberOfCode) {
            return ({ code: 'fail', message: 'Chưa nhập số lượng mã cần in!' });
        }
        // create code
        let lstCode = [];
        for (let i = 0; i < options.numberOfCode; i++) {
            let qrCodeAttr = {
                code: await createQRCode(24),
                password: "",
                status: constants.STATUS_QR_CODE.NEW,
                profileId: ""
            }
            let qrCodeItem = await QRCode.create(qrCodeAttr);
            if (qrCodeItem) {
                lstCode.push(qrCodeItem);
            }
        }
        return ({ code: 'success', message: 'Tạo mã thành công!', result: lstCode });
    }
    // create code
    async function createQRCode(length) {
        // create qr code
        var verifyCode = null;
        let check = true;
        while (check) {
            verifyCode = QRCode.createRandomString(length);
            check = await QRCode.findOne({ where: { code: verifyCode } });
        }
        return verifyCode;
    }
    // create random string
    QRCode.createRandomString = function (length) {
        var result = '';
        var characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
        var charactersLength = characters.length;
        for (var i = 0; i < length; i++) {
            result += characters.charAt(Math.floor(Math.random() *
                charactersLength));
        }
        return result;
    }
    QRCode.remoteMethod('createManyQRCode', {
        http: { path: '/createManyQRCode', verb: 'post' },
        accepts: [
            {
                "arg": "options",
                "type": "object",
                "required": true,
                "http": {
                    "source": "body"
                }
            },
            {
                "arg": "req",
                "type": "object",
                "http": {
                    "source": "req"
                }
            }
        ],
        returns: {
            root: true,
            type: 'object'
        },
        description: 'create many code'
    })

    // check password to modify information of qr code
    QRCode.checkPasswordToModifyQrCode = async (options, req) => {
        try {
            if (!options || !options.code || !options.password) {
                return ({ code: 'fail', message: 'Lỗi dữ liệu vào!' });
            }
             // get code
             let qrCodeItem = await QRCode.findOne({where: {code: options.code}});
             if (!qrCodeItem) {
                 return ({ code: 'fail', message: 'Mã QR này không tồn tại!' });
             }

             let checkPassword = genHash(options.password);
             console.log("INPUT PASS: ", checkPassword);
             console.log("QR code: ", qrCodeItem);

             if ((checkPassword + '') === qrCodeItem.password) {
                return ({ code: 'success', message: 'Mật khẩu đúng!', result: true });
             } else {
                return ({ code: 'success', message: 'Mật khẩu sai!', result: false });
             }
        } catch (error) {

        }

    }
    QRCode.remoteMethod('checkPasswordToModifyQrCode', {
        http: { path: '/checkPasswordToModifyQrCode', verb: 'post' },
        accepts: [
            {
                "arg": "options",
                "type": "object",
                "required": true,
                "http": {
                    "source": "body"
                }
            },
            {
                "arg": "req",
                "type": "object",
                "http": {
                    "source": "req"
                }
            }
        ],
        returns: {
            root: true,
            type: 'object'
        },
        description: 'create many code'
    })

    // check password to modify information of qr code
    QRCode.setPasswordForQrCode = async (options, req) => {
        try {
            if (!options || !options.code || !options.password) {
                return ({ code: 'fail', message: 'Chưa nhập số lượng mã cần in!' });
            }
            // get code
            let qrCodeItem = await QRCode.findOne({where: {code: options.code}});
            if (!qrCodeItem) {
                return ({ code: 'fail', message: 'Mã QR này không tồn tại!' });
            }

            let password = genHash(options.password);
            qrCodeItem.password = password;
            await qrCodeItem.updateAttributes(qrCodeItem);
            return ({ code: 'success', message: 'Cài mật khẩu thành công!', result: qrCodeItem });
        } catch (error) {
            return ({ code: 'fail', message: 'Lỗi hệ thống!' });
        }

    }
    QRCode.remoteMethod('setPasswordForQrCode', {
        http: { path: '/setPasswordForQrCode', verb: 'post' },
        accepts: [
            {
                "arg": "options",
                "type": "object",
                "required": true,
                "http": {
                    "source": "body"
                }
            },
            {
                "arg": "req",
                "type": "object",
                "http": {
                    "source": "req"
                }
            }
        ],
        returns: {
            root: true,
            type: 'object'
        },
        description: 'create many code'
    })

    function genHash(str, seed = 0) {
        let h1 = 0xdeadbeef ^ seed, h2 = 0x41c6ce57 ^ seed;
        for (let i = 0, ch; i < str.length; i++) {
            ch = str.charCodeAt(i);
            h1 = Math.imul(h1 ^ ch, 2654435761);
            h2 = Math.imul(h2 ^ ch, 1597334677);
        }
        h1 = Math.imul(h1 ^ (h1>>>16), 2246822507) ^ Math.imul(h2 ^ (h2>>>13), 3266489909);
        h2 = Math.imul(h2 ^ (h2>>>16), 2246822507) ^ Math.imul(h1 ^ (h1>>>13), 3266489909);
        return 4294967296 * (2097151 & h2) + (h1>>>0);
    };

};
