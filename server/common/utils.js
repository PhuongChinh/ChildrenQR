'use strict';

const debug = require('debug')('app:utils:models');
module.exports = {
    disableModelMethods: function(model, methods) {
      if (methods && methods.length > 0) {
        methods.forEach(methodName => {
          debug('Disable remote method %s -> %s', model.definition.name, methodName);
          model.disableRemoteMethodByName(methodName);
        });
      }
    },
    disableModelRelationMethods: function(model, relations, methods) {
      if (relations && relations.length > 0 && methods && methods.length > 0) {
        relations.forEach(relation => {
          methods.forEach(prefix => {
            let methodName = prefix + relation;
            debug('Disable relationship remote method %s -> %s', model.definition.name, methodName);
            model.disableRemoteMethodByName(methodName);
          });
        });
      }
    }
};