'use strict';
const debug = require("debug")("app:models:Student");
const CONF = require('../common/conf')

module.exports = function (Student) {

    Student.addStudent = async (options, req) => {
        if (!options || !options.name) {
            return ({ code: 'fail', message: 'Invalid input parameter' });
        }

        let attrs = {
            "schoolId": options.schoolId,
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
                let itemIns = await Student.findOne({ where: { id: options.id } });
                if (!itemIns) {
                    return ({ code: 'fail', message: 'Invalid input ID' });
                }
                delete attrs.createdTime;
                await itemIns.updateAttributes(attrs);

                let rr = await Student.addParents(options, itemIns);
                itemIns.parents = rr.filter(r => r.code == 'success');
                let f1 = rr.filter(r => r.code == 'fail');
                if (f1.length > 0) {
                    debug('Some parents could not add/update %o', f1);
                }

                return ({ code: 'success', message: 'Successfully saving data into system database', result: itemIns });
            } else {
                let itemIns = await Student.create(attrs);
                if (!itemIns) {
                    return ({ code: 'fail', message: 'Something went wrong!' });
                }
                let rr = await Student.addParents(options, itemIns);
                itemIns.parents = rr.filter(r => r.code == 'success');
                let f1 = rr.filter(r => r.code == 'fail');
                if (f1.length > 0) {
                    debug('Some parents could not add/update %o', f1);
                }

                //let item = JSON.parse(JSON.stringify(itemIns));
                // Student.notifyRegister(req.accessToken ? req.accessToken.userId : '', item);
                return ({ code: 'success', message: 'Successfully saving data into system database', result: itemIns });
            }
        } catch (error) {
            debug('Error %o', error);
            return { code: 'fail', message: 'Something went wrong!' };
        }
    }

    Student.addParents = async (options, student) => {
        let parents = options.parents;
        let results = [];
        if (!student || !parents || parents.length == 0) {
            results.push({ code: 'fail', message: 'No parents data' });
            return results;
        }
        for (let par of parents) {
            let attrs = {
                "schoolId": student.schoolId,
                "studentId": student.studentId,
                "name": par.name,
                "address": par.address,
                "phone": par.phone,
                "email": par.email,
                "type": par.type,
                "updatedBy": par.updatedBy,
                "updatedTime": new Date(),
                "createdTime": new Date()
            }
            try {
                if (par.id) {
                    let rr = await Student.app.models.Parent.findOrCreate({ where: { id: par.id } }, attrs);
                    let pIns = rr[0];
                    let iscreated = rr[1];
                    if (iscreated) {
                        results.push({ code: 'success', parent: pIns });
                    } else {
                        delete attrs.createdTime;
                        await pIns.updateAttributes(attrs);
                        results.push({ code: 'success', parent: pIns });
                    }
                } else {
                    let pIns = await Student.app.models.Parent.create(attrs);
                    results.push({ code: 'success', parent: pIns });
                }
            } catch (error) {
                debug('Error %o', error);
                results.push({ code: 'fail', message: 'Something went wrong!', parent: par });
            }
        }
        return results;
    }

    Student.deleteStudent = async (options, req) => {
        if (!options || !options.id) {
            return ({ code: 'fail', message: 'Invalid input parameter' });
        }

        let itemIns = await Student.findOne({ where: { id: options.id } });
        if (!itemIns) {
            return ({ code: 'success' });
        }

        let result = await Student.destroyById(itemIns.id);
        return ({ code: 'success', counter: result });
    }

    Student.remoteMethod('addStudent', {
        http: { path: '/addStudent', verb: 'post' },
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

    Student.remoteMethod('deleteStudent', {
        http: { path: '/deleteStudent', verb: 'post' },
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
