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

    modelsCreate(evt) {
      let _this    = this;
      _this.evt    = evt;

      return _this._prompt()
          .bind(_this)
          .then(_this._validateAndPrepare)
          .then(_this._createModels)
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

    _createModels() {
      return BbPromise.resolve();
    }

  }

  return ModelsCreate;
}