'use strict';
const debug = require("debug")("app:models:Teacher");
const CONF = require('../common/conf')

module.exports = function (Teacher) {

    Teacher.addTeacher = async (options, req) => {
        if (!options || !options.name) {
            return ({ code: 'fail', message: 'Invalid input parameter' });
        }

        let attrs = {
            "code": options.code,
            "name": options.name,
            "phone": options.phone,
            "email": options.email,
            "address": options.address,
            "status": options.status,
            "type": options.type,
            "updatedBy": options.updatedBy,
            "updatedTime": new Date(),
            "createdTime": new Date()
        }

        try {
            if (options.id) {
                let itemIns = await Teacher.findOne({ where: { id: options.id } });
                if (!itemIns) {
                    return ({ code: 'fail', message: 'Invalid input ID' });
                }
                delete attrs.createdTime;
                await itemIns.updateAttributes(attrs);

                return ({ code: 'success', message: 'Successfully saving data into system database', result: itemIns });
            } else {
                let itemIns = await Teacher.create(attrs);
                if (!itemIns) {
                    return ({ code: 'fail', message: 'Something went wrong!' });
                }

                return ({ code: 'success', message: 'Successfully saving data into system database', result: itemIns });
            }
        } catch (error) {
            debug('Error %o', error);
            return { code: 'fail', message: 'Something went wrong!' };
        }
    }

    Teacher.deleteTeacher = async (options, req) => {
        if (!options || !options.id) {
            return ({ code: 'fail', message: 'Invalid input parameter' });
        }

        let itemIns = await Teacher.findOne({ where: { id: options.id } });
        if (!itemIns) {
            return ({ code: 'success' });
        }

        let result = await Teacher.destroyById(itemIns.id);
        return ({ code: 'success', counter: result });
    }

    Teacher.remoteMethod('addTeacher', {
        http: { path: '/addTeacher', verb: 'post' },
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
        description: 'Update'
    })

    Teacher.remoteMethod('deleteTeacher', {
        http: { path: '/deleteTeacher', verb: 'post' },
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
        description: 'Delete'
    });

};
