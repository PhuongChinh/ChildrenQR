'use strict';

const CONF = require('../common/conf')

module.exports = function (School) {

    School.addSchool = async (options, req) => {
        if (!options || !options.name) {
            return ({ code: 'fail', message: 'Invalid input parameter' });
        }

        let attrs = {
            "name": options.name,
            "description": options.description,
            "iconUrl": options.iconUrl,
            "status": options.status,
            "schoolType": options.schoolType,
            "contactName": options.contactName,
            "contactEmail": options.contactEmail,
            "updatedBy": options.updatedBy,
            "updatedTime": new Date(),
            "createdTime": new Date()
        }

        try {

            if (options.id) {
                let itemIns = await School.findOne({ where: { id: options.id } });
                if (!itemIns) {
                    return ({ code: 'fail', message: 'Invalid input ID' });
                }
                delete attrs.createdTime;
                await itemIns.updateAttributes(attrs);

                return ({ code: 'success', message: 'Successfully saving data into system database', result: itemIns });
            } else {
                let itemIns = await School.create(attrs);
                if (!itemIns) {
                    return ({ code: 'fail', message: 'Something went wrong!' });
                }
                let opss = JSON.parse(JSON.stringify(itemIns));
                School.notifyRegister(req.accessToken ? req.accessToken.userId : '', opss);
                return ({ code: 'success', message: 'Successfully saving data into system database', result: itemIns });
            }
        } catch (error) {
            return { code: 'fail', message: 'Something went wrong!' };
        }
    }

    School.deleteSchool = async (options, req) => {
        if (!options || !options.id) {
            return ({ code: 'fail', message: 'Invalid input parameter' });
        }

        let itemIns = await School.findOne({ where: { id: options.id } });
        if (!itemIns) {
            return ({ code: 'success' });
        }

        let result = await School.destroyById(itemIns.id);
        return ({ code: 'success', counter: result });
    }

    School.remoteMethod('addSchool', {
        http: { path: '/addSchool', verb: 'post' },
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

    School.remoteMethod('deleteSchool', {
        http: { path: '/deleteSchool', verb: 'post' },
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
