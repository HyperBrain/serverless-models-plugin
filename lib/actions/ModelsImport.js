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

    modelsImport(evt) {
      let _this    = this;
      _this.evt    = evt;

      return _this._prompt()
          .bind(_this)
          .then(_this._validateAndPrepare)
          .then(_this._importModels)
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

    _importModels() {
      return BbPromise.resolve();
    }

  }

  return ModelsImport;
};
