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

      return BbPromise.mapSeries([ 's-models.json', 's-models.yaml' ], (filename) => {
        // Load Templates
        let modelsFilePath = project.getRootPath(filename);

        if (S.utils.fileExistsSync(modelsFilePath)) {
          let models = new S.classes.Models({}, modelsFilePath);
          return models.load();
        }
        return null;
      })
      .filter((models) => { return models != null })
      .then(function (models) {
        if (models.length > 0) {
          return BbPromise.resolve(models[0]);
        }

        return BbPromise.reject(new Error("No model definitions found."));
      });

    }

    _listModels(models) {

      return BbPromise.resolve();
    }

  }

  return ModelsList;
}