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
      _this.project          = S.getProject();
      _this.provider         = S.getProvider();
      _this.regions          = _this.evt.options.region ? [_this.evt.options.region] : _this.project.getAllRegionNames(_this.evt.options.stage);
      _this.aws              = S.getProvider('aws'),
      _this.awsAccountNumber = _this.aws.getAccountId(_this.evt.options.stage, _this.evt.options.region);
      _this.restApiName      = _this.project.getRegion(_this.evt.options.stage, _this.evt.options.region).getVariables().apiGatewayApi;
      _this.spinner          = SCli.spinner();

      return _this._prompt()
          .bind(_this)
          .then(_this._validateAndPrepare)
          .tap(_this._getRestApi)
          .then(_this._deployModels)
          .then(function() {
            return _this.evt;
          });
    }

    _prompt() {
      
      return BbPromise.resolve();
    }

    _validateAndPrepare() {
      let _this    = this;

      _this.endpoint = _this.project.getEndpoint(_this.evt.options.name);
      if (!_this.endpoint) BbPromise.reject(new SError(`Endpoint could not be found: ${_this.evt.options.endpointPath}#${_this.evt.options.endpointMethod}`));

      // Populate endpoint
      _this.endpoint = _this.endpoint.toObjectPopulated({ stage: _this.evt.options.stage, region: _this.evt.options.region });

      // Check if models are defined and pass the affected models to deploy.
      return S.classes.Models.loadFromProject(_this.project)
      .then(function (modelsDefined) {
        let modelsUsed = {};

        for (let model in _this.endpoint.requestModels) {
          if (_.has(_this.endpoint.requestModels, model)) {
            let modelName = _this.endpoint.requestModels[model];

            if (!_.has(modelsUsed, modelName)) {
              if (_.has(modelsDefined, modelName)) {
                modelsUsed[modelName] = { content: model, model: modelsDefined[modelName] };
              } else {
                return BbPromise.reject(new SError(`Model not defined: ${modelName}`));
              }
            }
          }
        }
        for (let response in _this.endpoint.responses) {
          if (_.has(_this.endpoint.responses, response)) {
            let responseModels = _this.endpoint.responses[response].responseModels;

            for (let model in responseModels) {
              if (_.has(responseModels, model)) {
                let modelName = responseModels[model];

                if (!_.has(modelsUsed, modelName)) {
                  if (_.has(modelsDefined, modelName)) {
                    modelsUsed[modelName] = { content: model, model: modelsDefined[modelName] };
                  } else {
                    return BbPromise.reject(new SError(`Model not defined: ${modelName}`));
                  }
                }
              }
            }
          }
        }

        return BbPromise.resolve(modelsUsed);
      });
    }

    _getRestApi() {

      let _this = this;

      return _this.aws.getApiByName(_this.restApiName, _this.evt.options.stage, _this.evt.options.region)
        .then(function(restApi) {

          if (!restApi) {
            throw new SError('API Gateway REST API with the name: ' + _this.restApi);
          }

          // Store restApi
          _this.restApi = restApi;
        });
    }

    _deployModels(models) {
      let _this    = this;

      if (_.size(models) === 0) {
        SUtils.sDebug('No models to deploy');
        return BbPromise.resolve();
      }

      SUtils.sDebug('Deploying models in "' + _this.evt.options.stage + '" to the following regions: ' + _this.regions.join(', '));

      return BbPromise.try(function() {
          return _this.regions;
        })
        .bind(_this)
        .each(function(region) {
          // Process each Region
          return BbPromise.resolve();
        });
    }

  }

  return ModelsDeploy;
}