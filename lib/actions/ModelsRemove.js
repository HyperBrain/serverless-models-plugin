'use strict';
/**
 * List APIG models
 */

module.exports = function(S) {

  const path   = require('path'),
  SUtils     = S.utils,
  SError     = require(S.getServerlessPath('Error')),
  SCli       = require(S.getServerlessPath('utils/cli')),
  BbPromise  = require('bluebird'),
  _          = require('lodash');

  class ModelsRemove extends S.classes.Plugin {

    static getName() {
      return 'serverless.core.' + this.name;
    }

    registerActions() {
      S.addAction(this.modelsRemove.bind(this), {
        handler:       'modelsRemove',
        description:   `Remove an APIG model from your project.
usage: serverless models remove`,
        context:       'models',
        contextAction: 'remove',
        options:       [
        ]
      });

      return BbPromise.resolve();
    }

    modelsRemove() {
      return BbPromise.resolve();
    }
  }

  return ModelsRemove;
}