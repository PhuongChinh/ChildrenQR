'use strict';
const constants = require("../../constants");

module.exports = function (ChildProfile) {

    // get child's profile by qrCode
    ChildProfile.findChildProfileByQRCode = async (options, req) => {
        try {
            if (!options || !options.qrCode) {
                return ({ code: 'fail', message: 'Mã QR không hợp lệ!' });
            }

            // get infor of qr code
            let qrCodeItem = await ChildProfile.app.models.QRCode.findOne({ where: { code: options.qrCode } });
            if (!qrCodeItem) {
                return ({ code: 'fail', message: 'Mã không tồn tại trong hệ thống!' });
            }
            console.log("code: ", qrCodeItem);

            let response = {
                isProfileExisted: false,
                profile: {}
            }
            if (qrCodeItem.status === constants.STATUS_QR_CODE.NEW) {
                return ({ code: 'success', message: 'Lấy thông tin thành công!', result: response });
            } else {
                let childProfileItem = await ChildProfile.findOne({ where: { id: qrCodeItem.profileId } });
                response.isProfileExisted = true;
                response.profile = childProfileItem;
                return ({ code: 'success', message: 'Lấy thông tin thành công!', result: response });
            }

        } catch (err) {
            console.log("ERROR: ", err);
            return ({ code: 'fail', message: 'Lỗi server!' });
        }
    }

    ChildProfile.remoteMethod('findChildProfileByQRCode', {
        http: { path: '/findChildProfileByQRCode', verb: 'post' },
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

    // create child profile and attack to qr code
    ChildProfile.createOrUpdateChildProfile = async (options, req) => {
        try {
            if (!options || !options.qrCode || !options.childProfile || !options.action) {
                return ({ code: 'fail', message: 'Mã QR không hợp lệ!' });
            }

            // get infor of qr code
            let qrCodeItem = await ChildProfile.app.models.QRCode.findOne({ where: { code: options.qrCode } });
            if (!qrCodeItem) {
                return ({ code: 'fail', message: 'Mã không tồn tại trong hệ thống!' });
            }
            console.log("QR code: ", qrCodeItem);

            let childProfileItem;
            console.log("OPTIONS: ", options);

            switch (options.action) {
                case constants.ACTION.CREATE:
                    let childProfile = {
                        childName: options.childProfile.childName,
                        fatherName: options.childProfile.fatherName,
                        fatherPhoneNumber: options.childProfile.fatherPhoneNumber,
                        fatherEmail: options.childProfile.fatherEmail,
                        address: options.childProfile.address,
                        note: options.childProfile.note
                    }
                    childProfileItem = await ChildProfile.create(childProfile);
                    if (childProfileItem) {
                        qrCodeItem.profileId = childProfileItem.id
                        qrCodeItem.status = constants.STATUS_QR_CODE.ACTIVATED
                        await qrCodeItem.updateAttributes(qrCodeItem);
                    }
                    return ({ code: 'success', message: 'Tạo thông tin cho trẻ thành công!', result: childProfileItem });
                case constants.ACTION.UPDATE:
                    childProfileItem = await ChildProfile.findOne({ where: { id: options.childProfile.id } });
                    if (!childProfileItem) {
                        return ({ code: 'fail', message: 'Hồ sơ của bé không tồn tại trong hệ thống!' });
                    }
                    await childProfileItem.updateAttributes(options.childProfile);
                    return ({ code: 'success', message: 'Tạo thông tin cho trẻ thành công!', result: childProfileItem });
                default:
                    break;
            }
        } catch (err) {
            console.log("ERROR: ", err);
            return ({ code: 'fail', message: 'Lỗi server!' });
        }
    };
    ChildProfile.remoteMethod('createOrUpdateChildProfile', {
        http: { path: '/createOrUpdateChildProfile', verb: 'post' },
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
};
