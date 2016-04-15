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

  class ModelsDeploy extends S.classes.Plugin {

    static getName() {
      return 'serverless.core.' + this.name;
    }

    registerActions() {
      S.addAction(this.modelsDeploy.bind(this), {
        handler:       'modelsDeploy',
        description:   `Deploy APIG models from your project.
usage: serverless models deploy`,
        context:       'models',
        contextAction: 'deploy',
        options:       [
        ]
      });

      return BbPromise.resolve();
    }

    modelsDeploy(evt) {
      let _this    = this;
      _this.evt    = evt;

      return _this._prompt()
          .bind(_this)
          .then(_this._validateAndPrepare)
          .then(_this._deployModels)
          .then(function() {
            return _this.evt;
          });
    }

    _prompt() {
      
      return BbPromise.resolve();
    }

    _validateAndPrepare() {

      return BbPromise.resolve();
    }

    _deployModels() {
      return BbPromise.resolve();
    }

  }

  return ModelsDeploy;
}