'use strict';

module.exports = function (Country) {
    Country.addCountry = async (options, req) => {
        if (!options || !options.name || !(options.cn)) {
            return { code: 'fail', message: 'Invalid input parameter' };
        }

        let attrs = {
            "cn": options.cn,
            "name": options.name,
            "region": options.region
        }

        try {
            if (options.id) {
                let itemIns = await Country.findOne({ where: { id: options.id } });
                if (!itemIns) {
                    return { code: 'fail', message: 'Invalid input ID' };
                }
                await itemIns.updateAttributes(attrs);
                return { code: 'success', message: 'Successfully saving data into system database', result: itemIns };
            } else {
                let itemIns = await Country.create(attrs);
                if (!itemIns) {
                    return { code: 'fail', message: 'Something went wrong!' };
                }
                return { code: 'success', message: 'Successfully saving data into system database', result: itemIns };
            }
        } catch (error) {
            return { code: 'fail', message: 'Something went wrong!' };
        }
    }

    Country.deleteCountry = async (options, req) => {
        if (!options || !options.id) {
            return { code: 'fail', message: 'Invalid input parameter' };
        }

        let itemIns = await Country.findOne({ where: { id: options.id } });
        if (!itemIns) {
            return ({ code: 'success', counter: 0 });
        }

        let result = await Country.destroyById(itemIns.id);
        return { code: 'success', counter: result };
    }

    Country.remoteMethod('addCountry', {
        http: { path: '/addCountry', verb: 'post' },
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

    Country.remoteMethod('deleteCountry', {
        http: { path: '/deleteCountry', verb: 'post' },
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
