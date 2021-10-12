'use strict';

const debug = require('debug')('app:models:AccessRole');
module.exports = function (AccessRole) {
    let model = AccessRole;

    let disableMethods = [
        'upsert',                               // disables PATCH /model
        // 'find',                                 // disables GET /model
        'replaceOrCreate',                      // disables PUT /model
        // 'create',                               // disables POST /model

        // 'prototype.updateAttributes',           // disables PATCH /model/{id}
        // 'findById',                             // disables GET /model/{id}
        'exists',                               // disables HEAD /model/{id}
        'replaceById',                          // disables PUT /model/{id}
        // 'deleteById',                           // disables DELETE /model/{id}

        'prototype.verify',                     // disable POST /model/{id}/verify
        // 'changePassword',                       // disable POST /model/change-password
        'createChangeStream',                   // disable GET and POST /model/change-stream
        // 'count',                                // disables GET /model/count
        'findOne',                              // disables GET /model/findOne

        'update',                               // disables POST /model/update
        'upsertWithWhere'                      // disables POST /model/upsertWithWhere
    ];
    disableMethods.forEach(methodName => {
        debug('Disable remote method %s -> %s', model.definition.name, methodName);
        model.disableRemoteMethodByName(methodName);
    });
};
