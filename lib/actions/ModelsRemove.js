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

    modelsRemove(evt) {
      let _this    = this;
      _this.evt    = evt;

      return _this._prompt()
          .bind(_this)
          .then(_this._validateAndPrepare)
          .then(_this._removeModels)
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

    _removeModels() {
      return BbPromise.resolve();
    }

  }

  return ModelsRemove;
}