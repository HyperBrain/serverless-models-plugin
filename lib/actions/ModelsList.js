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

    modelsList(evt) {
      let _this    = this;
      _this.evt    = evt;

      return _this._prompt()
          .bind(_this)
          .then(_this._validateAndPrepare)
          .then(_this._listModels)
          .then(function() {
            return _this.evt;
          });
    }

    _prompt() {
      return BbPromise.resolve();
    }

    _validateAndPrepare() {
      let project = S.getProject();

      return S.classes.Models.loadFromProject(project);
    }

    _listModels(models) {

      for (let model in models) {
        if (_.has(models, model) && !_.startsWith(model, '_')) {
          SCli.log(model);
        }
      }

      return BbPromise.resolve();
    }

  }

  return ModelsList;
}