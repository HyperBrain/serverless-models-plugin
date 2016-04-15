'use strict';
/**
 * Create APIG models
 */

module.exports = function(S) {

  const path   = require('path'),
  SUtils     = S.utils,
  SError     = require(S.getServerlessPath('Error')),
  SCli       = require(S.getServerlessPath('utils/cli')),
  BbPromise  = require('bluebird'),
  _          = require('lodash');

  class ModelsCreate extends S.classes.Plugin {

    static getName() {
      return 'serverless.core.' + this.name;
    }

    registerActions() {
      S.addAction(this.modelsCreate.bind(this), {
        handler:       'modelsCreate',
        description:   `Create a new APIG model in your project.
usage: serverless models create`,
        context:       'models',
        contextAction: 'create',
        options:       [
        ]
      });

      return BbPromise.resolve();
    }

    modelsCreate() {
      return BbPromise.resolve();
    }
  }

  return ModelsCreate;
}