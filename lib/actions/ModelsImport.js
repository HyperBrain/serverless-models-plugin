'use strict';
/**
 * Import APIG models from APIG
 */

module.exports = function(S) {

  const path   = require('path'),
  SUtils     = S.utils,
  SError     = require(S.getServerlessPath('Error')),
  SCli       = require(S.getServerlessPath('utils/cli')),
  BbPromise  = require('bluebird'),
  _          = require('lodash');

  class ModelsImport extends S.classes.Plugin {

    static getName() {
      return 'serverless.core.' + this.name;
    }

    registerActions() {
      S.addAction(this.modelsImport.bind(this), {
        handler:       'modelsImport',
        description:   `Remove an APIG model from your project.
usage: serverless models remove`,
        context:       'models',
        contextAction: 'import',
        options:       [
        ]
      });

      return BbPromise.resolve();
    }

    modelsImport() {
      return BbPromise.resolve();
    }
  }

  return ModelsImport;
}