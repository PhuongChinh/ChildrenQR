'use strict';

const debug = require("debug")("app:models:School");
const CONF = require('../common/conf')

module.exports = function (School) {

    School.addSchool = async (options, req) => {
        if (!options || !options.code || !options.name) {
            return ({ code: 'fail', message: 'Invalid input parameter' });
        }

        let attrs = {
            "code": options.code,
            "name": options.name,
            "description": options.description,
            "iconUrl": options.iconUrl,
            "status": options.status,
            "schoolType": options.schoolType,
            "contactName": options.contactName,
            "contactEmail": options.contactEmail,
            "contactPhone": options.contactPhone,
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

                //let opss = JSON.parse(JSON.stringify(itemIns));
                //School.notifyRegister(req.accessToken ? req.accessToken.userId : '', opss);
                return ({ code: 'success', message: 'Successfully saving data into system database', result: itemIns });
            }
        } catch (error) {
            debug('Error %o', error);
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

    School.parentLinkSchoolID = async (options, req) => {
        let userId = (req.accessToken ? req.accessToken.userId : '');
        if (!userId) {
            return { code: 'fail', message: 'Invalid user session' };
        }
        if (!options || !options.code) {
            return { code: 'fail', message: 'Invalid input parameter' };
        }
        let userIns = await School.app.models.AccessUser.findOne({ where: { id: userId } });
        if (!userIns) {
            return { code: 'fail', message: `Invalid input user ID` };
        }

        let studentIns = await School.app.models.Student.findOne({ where: { code: options.code }, include: ['school'] });
        if (!studentIns) {
            return { code: 'fail', message: `Invalid input Student CODE: ${options.code}` };
        }

        let student = JSON.parse(JSON.stringify(studentIns));
        let school = student.school;
        if (!school) {
            return { code: 'fail', message: 'Something went wrong with student/school link' };
        }

        let attrs = {
            schoolId: school.id,
            studentId: student.id,
            userId: userId
        }

        let result = await School.app.models.SchoolParentUser.findOrCreate({ where: attrs }, attrs);
        return ({ code: 'success', result: result });
    }

    School.remoteMethod('parentLinkSchoolID', {
        http: { path: '/parentLinkSchoolID', verb: 'post' },
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
        description: 'parentLinkSchoolID'
    });


    School.studentLinkSchoolID = async (options, req) => {
        let userId = (req.accessToken ? req.accessToken.userId : '');
        if (!userId) {
            return { code: 'fail', message: 'Invalid user session' };
        }
        if (!options || !options.code) {
            return { code: 'fail', message: 'Invalid input parameter' };
        }
        let userIns = await School.app.models.AccessUser.findOne({ where: { id: userId } });
        if (!userIns) {
            return { code: 'fail', message: `Invalid input user ID` };
        }

        let studentIns = await School.app.models.Student.findOne({ where: { code: options.code }, include: ['school'] });
        if (!studentIns) {
            return { code: 'fail', message: `Invalid input Student CODE: ${options.code}` };
        }

        let student = JSON.parse(JSON.stringify(studentIns));
        let school = student.school;
        if (!school) {
            return { code: 'fail', message: 'Something went wrong with student/school link' };
        }

        let attrs = {
            schoolId: school.id,
            studentId: student.id,
            userId: userId
        }

        let result = await School.app.models.StudentUser.findOrCreate({ where: attrs }, attrs);
        return ({ code: 'success', result: result });
    }

    School.remoteMethod('studentLinkSchoolID', {
        http: { path: '/studentLinkSchoolID', verb: 'post' },
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
        description: 'studentLinkSchoolID'
    });

    School.teacherLinkSchoolID = async (options, req) => {
        let userId = (req.accessToken ? req.accessToken.userId : '');
        if (!userId) {
            return { code: 'fail', message: 'Invalid user session' };
        }
        if (!options || !options.code) {
            return { code: 'fail', message: 'Invalid input parameter' };
        }
        let userIns = await School.app.models.AccessUser.findOne({ where: { id: userId } });
        if (!userIns) {
            return { code: 'fail', message: `Invalid input user ID` };
        }

        let teacherIns = await School.app.models.Teacher.findOne({ where: { code: options.code }, include: ['school'] });
        if (!teacherIns) {
            return { code: 'fail', message: `Invalid input Student CODE: ${options.code}` };
        }

        let teacher = JSON.parse(JSON.stringify(teacherIns));
        let school = student.school;
        if (!school) {
            return { code: 'fail', message: 'Something went wrong with teacher/school link' };
        }

        let attrs = {
            schoolId: school.id,
            teacherId: teacher.id,
            userId: userId
        }

        let result = await School.app.models.TeacherUser.findOrCreate({ where: attrs }, attrs);
        return ({ code: 'success', result: result });
    }

    School.remoteMethod('teacherLinkSchoolID', {
        http: { path: '/teacherLinkSchoolID', verb: 'post' },
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
        description: 'teacherLinkSchoolID'
    });
};
