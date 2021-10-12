'use strict';

const CONF = require('../common/conf')

module.exports = function (AppContact) {

    AppContact.addContact = async (options, req) => {
        if (!options || !options.name || !(options.phoneNum || options.email || options.address || options.message)) {
            return ({ code: 'fail', message: 'Invalid input parameter' });
        }

        let attrs = {
            "code": options.code,
            "name": options.name,
            "phoneNum": options.phoneNum,
            "email": options.email,
            "address": options.address,
            "message": options.message,
            "status": options.status,
            "remarks": options.remarks,
            "updatedBy": options.updatedBy,
            "updatedTime": new Date(),
            "createdTime": new Date()
        }

        try {
            if (options.id) {
                let itemIns = await AppContact.findOne({ where: { id: options.id } });
                if (!itemIns) {
                    return ({ code: 'fail', message: 'Invalid input ID' });
                }
                delete attrs.createdTime;
                await itemIns.updateAttributes(attrs);

                return ({ code: 'success', message: 'Successfully saving data into system database', result: itemIns });
            } else {
                let itemIns = await AppContact.create(attrs);
                if (!itemIns) {
                    return ({ code: 'fail', message: 'Something went wrong!' });
                }
                let opss = [JSON.parse(JSON.stringify(itemIns))];
                AppContact.notifySales(opss);
                return ({ code: 'success', message: 'Successfully saving data into system database', result: itemIns });
            }
        } catch (error) {
            return { code: 'fail', message: 'Something went wrong!' };
        }
    }

    AppContact.deleteContact = async (options, req) => {
        if (!options || !options.id) {
            return ({ code: 'fail', message: 'Invalid input parameter' });
        }

        let itemIns = await AppContact.findOne({ where: { id: options.id } });
        if (!itemIns) {
            return ({ code: 'success' });
        }

        let result = await AppContact.destroyById(itemIns.id);
        return ({ code: 'success', counter: result });
    }

    AppContact.upContact = async (options, req) => {
        if (!options || !options.id || !(options.status || options.remarks)) {
            return ({ code: 'fail', message: 'Invalid input parameter' });
        }

        let attrs = {
            "status": options.status,
            "remarks": options.remarks,
            "updatedBy": options.updatedBy || (req.accessToken ? req.accessToken.userId : ''),
            "updatedTime": new Date()
        }

        if (options.id) {
            let itemIns = await AppContact.findOne({ where: { id: options.id } });
            if (!itemIns) {
                return ({ code: 'fail', message: 'Invalid input ID' });
            }
            delete attrs.createdTime;
            let itemIns2 = await itemIns.updateAttributes(attrs);
            if (!itemIns2) {
                return ({ code: 'fail', message: 'Something went wrong!' });
            }
            return ({ code: 'success', message: 'Successfully saving data into system database', result: itemIns2 });
        }
    }

    AppContact.notifySales = async (opss) => {
        if (opss.length == 0) {
            return;
        }
        let ops = opss[0];
        let receivers = await AppContact.app.models.AccessUser.find({
            where: {
                enableNotif: true,
                email: { 'neq': null }
            }
        });
        receivers = JSON.parse(JSON.stringify(receivers));
        if (receivers.length > 0) {
            let mailTo = receivers.map(u => u.email).join(';');
            let mailOption = {
                to: mailTo,
                subject: `[${String(ops.code).toUpperCase()}] Contact Notification`,
                body: '<html><head><style> table {border-collapse: collapse;background-color:white;} table, td, th {border: 1px solid gray;margin: 3px;padding:3px;} .alert {color:red;background-color:yellow;}</style></head><body>' +
                    '<p>Dear {MEM} <br /></p>' +
                    '<p>Please find the details below new contact</p><br />' +
                    '{TABLE} <br /></body></html>'
            }

            let tbl = '<table width="100%"><tr><th>#</th><th>Name</th><th>Contact</th><th>Message</th><th>Date/Time</th></tr>';
            opss.forEach((it, i) => {
                let contact = '';
                if (it.email) {
                    if (contact) {
                        contact += '<br />';
                    }
                    contact += `${CONF.fmString(it.email)}`;
                }
                if (it.phoneNum) {
                    if (contact) {
                        contact += '<br />';
                    }
                    contact += `${CONF.fmString(it.phoneNum)}`;
                }
                if (it.address) {
                    if (contact) {
                        contact += '<br />';
                    }
                    contact += `${CONF.fmString(it.address)}`;
                }
                tbl += `<tr><td>${(i + 1)}</td>`;
                tbl += `<td>${it.name}</td>`;
                tbl += `<td><p>${contact}</p></td>`;
                tbl += `<td>${it.message}</td>`;
                tbl += `<td>${CONF.fmDateString(it.createdTime)}</td>`;
                tbl += '</tr>';
            });
            tbl += '</table>';
            mailOption.body = mailOption.body.replace(/\{MEM\}/g, ('Sir/Madam')).replace(/\{TABLE\}/g, tbl);
            await AppContact.app.models.AccessUser.sendMail(mailOption);
        }
    }

    AppContact.remoteMethod('addContact', {
        http: { path: '/addContact', verb: 'post' },
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

    AppContact.remoteMethod('deleteContact', {
        http: { path: '/deleteContact', verb: 'post' },
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

    AppContact.remoteMethod('upContact', {
        http: { path: '/upContact', verb: 'post' },
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
        description: 'upContact'
    })
};
