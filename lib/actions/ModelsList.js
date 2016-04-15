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

  class ModelsList extends S.classes.Plugin {

    static getName() {
      return 'serverless.core.' + this.name;
    }

    registerActions() {
      S.addAction(this.modelsList.bind(this), {
        handler:       'modelsList',
        description:   `List defined APIG models in your project.
usage: serverless models list`,
        context:       'models',
        contextAction: 'list',
        options:       [
        ]
      });

      return BbPromise.resolve();
    }

    modelsList() {
      return BbPromise.resolve();
    }
  }

  return ModelsList;
}