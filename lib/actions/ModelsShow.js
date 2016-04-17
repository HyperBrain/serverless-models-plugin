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
  _          = require('lodash'),
  yaml       = require('js-yaml');

  class ModelsShow extends S.classes.Plugin {

    static getName() {
      return 'serverless.core.' + this.name;
    }

    registerActions() {
      S.addAction(this.modelsShow.bind(this), {
        handler:       'modelsShow',
        description:   `Show definition of an APIG model.
usage: serverless models show <model name>`,
        context:       'models',
        contextAction: 'show',
        options:       [
                        {
                          option:      'format',
                          shortcut:    'f',
                          description: 'Output format used - json or yaml. Defaults to json'
                        }
        ],
        parameters:    [
                        {
                          parameter: 'names',
                          description: 'One or multiple model names',
                          position: '0->'
                        }
        ]
      });

      return BbPromise.resolve();
    }

    modelsShow(evt) {
      let _this     = this;
      _this.evt     = evt;
      _this.project = S.getProject();

      return _this._prompt()
          .bind(_this)
          .then(_this._validateAndPrepare)
          .then(_this._showModel)
          .then(function() {
            return _this.evt;
          });
    }

    _prompt() {
      return BbPromise.resolve();
    }

    _validateAndPrepare() {
      let _this = this;

      // Validate output format
      if (!_this.evt.options.format) {
        _this.evt.options.format = 'json';
      }
      if (!_this.evt.options.names) {
        return BbPromise.reject(new SError('No model(s) specified.'));
      }

      switch (_.toLower(_this.evt.options.format)) {
      case 'json':
        _this._formatter = JSON.stringify;
        break;
      case 'yaml':
        _this._formatter = _this._yamlStringify;
        break;
      default:
        return BbPromise.reject(new SError(`Unknown output format: ${_this.evt.options.format}`));
      }

      return S.classes.Models.loadFromProject(_this.project)
      .then(function (models) {
        // Validate requested models
        let modelNames = _.keys(models);
        if (_.size(models) === 0 || !_this.evt.options.names.every(function (modelName) {
          return _.indexOf(modelNames, modelName) !== -1;
        })) {
          return BbPromise.reject(new SError(`Unknown model specified`));
        }

        return BbPromise.resolve(models);
      });
    }

    _showModel(models) {
      let _this = this;

      let count = _this.evt.options.names.length;
      for (let n=0; n<count; n++) {
        let modelName = _this.evt.options.names[n];
        let output = {};
        output[modelName] = models[modelName];
        SCli.log('\n' + _this._formatter(output, null, 2));
      }

      return BbPromise.resolve();
    }

    _yamlStringify(obj, parser, indent) {
      return yaml.safeDump(obj);
    }

  }

  return ModelsShow;
};
